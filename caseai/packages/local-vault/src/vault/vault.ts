import {
  decryptAESGCM,
  deriveKeyPBKDF2,
  encryptAESGCM,
  fromUtf8Bytes,
  randomSalt,
  toUtf8Bytes
} from '../crypto/webCrypto';
import { WebIndexedDbVaultStorage } from '../storage/indexedDbStorage';
import {
  AddDocumentMetadataInput,
  AddTimelineEventInput,
  CreateCaseInput,
  ExportedEncryptedBundleManifest,
  LocalCase,
  LocalDocumentMetadata,
  LocalTimelineEvent,
  MarketplaceListingPayload,
  VaultClient
} from '../types';

type EncryptedDocumentRecord = {
  id: string;
  caseId: string;
  metadata: LocalDocumentMetadata;
  encryptedFile: {
    iv: number[];
    ciphertext: number[];
  };
};

function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

function sanitizeSummary(value: string): string {
  return value.replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[redacted-email]').replace(/\+?\d[\d\s().-]{7,}\d/g, '[redacted-phone]').trim();
}

export async function initVaultInternal(userId: string, password: string): Promise<VaultClient> {
  const storage = new WebIndexedDbVaultStorage(userId);
  await storage.connect();

  const existingMeta = await storage.getMeta(userId);
  const salt = existingMeta ? Uint8Array.from(existingMeta.salt) : await randomSalt();

  if (!existingMeta) {
    await storage.setMeta({ userId, salt: Array.from(salt), createdAt: new Date().toISOString() });
  }

  const key = await deriveKeyPBKDF2(password, salt, 150_000);

  async function encryptJson(value: unknown) {
    return encryptAESGCM(key, toUtf8Bytes(JSON.stringify(value)));
  }

  async function decryptJson<T>(payload: { iv: Uint8Array; ciphertext: Uint8Array }): Promise<T> {
    const bytes = await decryptAESGCM(key, payload.iv, payload.ciphertext);
    return JSON.parse(fromUtf8Bytes(bytes)) as T;
  }

  const createCase = async (input: CreateCaseInput): Promise<LocalCase> => {
      const now = new Date().toISOString();
      const entity: LocalCase = {
        id: createId('case'),
        userId,
        title: input.title,
        jurisdiction: input.jurisdiction,
        caseType: input.caseType,
        languages: input.languages,
        geoScopeLevel: input.geoScopeLevel,
        deadlineDate: input.deadlineDate,
        budgetMin: input.budgetMin,
        budgetMax: input.budgetMax,
        currency: input.currency,
        anonymSummary: sanitizeSummary(input.anonymSummary),
        pageEstimate: input.pageEstimate,
        status: input.status ?? 'DRAFT',
        createdAt: now,
        updatedAt: now
      };
      await storage.putEncrypted('cases', entity.id, userId, await encryptJson(entity));
      return entity;
    };

  const listCases = async (): Promise<LocalCase[]> => {
      const records = await storage.getAllEncryptedByUser('cases', userId);
      const entities = await Promise.all(records.map((record) => decryptJson<LocalCase>(record.payload)));
      return entities.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
    };

  const getCase = async (caseId: string): Promise<LocalCase | null> => {
      const record = await storage.getEncrypted('cases', caseId);
      if (!record) {
        return null;
      }
      return decryptJson<LocalCase>(record);
    };

  const deleteCase = async (caseId: string): Promise<void> => {
      await storage.delete('cases', caseId);
      const docs = await storage.getAllEncryptedByUser('documents', userId);
      const timeline = await storage.getAllEncryptedByUser('timeline', userId);

      for (const doc of docs) {
        const parsed = await decryptJson<EncryptedDocumentRecord>(doc.payload);
        if (parsed.caseId === caseId) {
          await storage.delete('documents', parsed.id);
        }
      }

      for (const event of timeline) {
        const parsed = await decryptJson<LocalTimelineEvent>(event.payload);
        if (parsed.caseId === caseId) {
          await storage.delete('timeline', parsed.id);
        }
      }
    };

  const addDocument = async (
    caseId: string,
    file: File,
    metadata: AddDocumentMetadataInput
  ): Promise<LocalDocumentMetadata> => {
      const caseRecord = await storage.getEncrypted('cases', caseId);
      if (!caseRecord) {
        throw new Error('Case not found');
      }

      const documentId = createId('doc');
      const fileBytes = new Uint8Array(await file.arrayBuffer());
      const encryptedFile = await encryptAESGCM(key, fileBytes);

      const docMetadata: LocalDocumentMetadata = {
        id: documentId,
        caseId,
        userId,
        pageCountEstimate: metadata.pageCountEstimate,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
        createdAt: new Date().toISOString()
      };

      const encryptedRecord = await encryptJson({
        id: documentId,
        caseId,
        metadata: docMetadata,
        encryptedFile: {
          iv: Array.from(encryptedFile.iv),
          ciphertext: Array.from(encryptedFile.ciphertext)
        }
      } satisfies EncryptedDocumentRecord);

      await storage.putEncrypted('documents', documentId, userId, encryptedRecord);
      return docMetadata;
    };

  const listDocuments = async (caseId: string): Promise<LocalDocumentMetadata[]> => {
      const records = await storage.getAllEncryptedByUser('documents', userId);
      const parsed = await Promise.all(records.map((record) => decryptJson<EncryptedDocumentRecord>(record.payload)));
      return parsed.filter((entry) => entry.caseId === caseId).map((entry) => entry.metadata);
    };

  const getDocumentFile = async (documentId: string): Promise<Blob> => {
      const record = await storage.getEncrypted('documents', documentId);
      if (!record) {
        throw new Error('Document not found');
      }
      const parsed = await decryptJson<EncryptedDocumentRecord>(record);
      const bytes = await decryptAESGCM(
        key,
        Uint8Array.from(parsed.encryptedFile.iv),
        Uint8Array.from(parsed.encryptedFile.ciphertext)
      );
      const blobBytes = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
      return new Blob([blobBytes], { type: parsed.metadata.mimeType });
    };

  const addTimelineEvent = async (
    caseId: string,
    event: AddTimelineEventInput
  ): Promise<LocalTimelineEvent> => {
      const timelineEvent: LocalTimelineEvent = {
        id: createId('evt'),
        caseId,
        userId,
        type: event.type,
        content: event.content,
        occurredAt: event.occurredAt,
        createdAt: new Date().toISOString()
      };

      await storage.putEncrypted('timeline', timelineEvent.id, userId, await encryptJson(timelineEvent));
      return timelineEvent;
    };

  const listTimeline = async (caseId: string): Promise<LocalTimelineEvent[]> => {
      const records = await storage.getAllEncryptedByUser('timeline', userId);
      const parsed = await Promise.all(records.map((record) => decryptJson<LocalTimelineEvent>(record.payload)));
      return parsed
        .filter((event) => event.caseId === caseId)
        .sort((left, right) => left.occurredAt.localeCompare(right.occurredAt));
    };

  const buildMarketplaceListing = async (caseId: string): Promise<MarketplaceListingPayload> => {
      const caseData = await getCase(caseId);
      if (!caseData) {
        throw new Error('Case not found');
      }
      const documents = await listDocuments(caseId);
      return {
        jurisdiction: caseData.jurisdiction,
        caseType: caseData.caseType,
        languages: caseData.languages,
        geoScopeLevel: caseData.geoScopeLevel,
        deadlineDate: caseData.deadlineDate,
        budgetMin: caseData.budgetMin,
        budgetMax: caseData.budgetMax,
        currency: caseData.currency,
        docCount: documents.length,
        pageEstimate: caseData.pageEstimate,
        anonymSummary: sanitizeSummary(caseData.anonymSummary)
      };
    };

  const exportEncryptedBundle = async (caseId: string): Promise<Blob> => {
      const caseData = await getCase(caseId);
      if (!caseData) {
        throw new Error('Case not found');
      }
      const documents = await listDocuments(caseId);
      const timeline = await listTimeline(caseId);

      const manifest: ExportedEncryptedBundleManifest = {
        version: '1',
        exportedAt: new Date().toISOString(),
        caseId,
        userId,
        includesEncryptedContentOnly: true
      };

      const payload = {
        manifest,
        caseData,
        documents,
        timeline
      };

      const encrypted = await encryptAESGCM(key, toUtf8Bytes(JSON.stringify(payload)));
      const serialized = JSON.stringify({
        iv: Array.from(encrypted.iv),
        ciphertext: Array.from(encrypted.ciphertext)
      });

      return new Blob([serialized], { type: 'application/octet-stream' });
    };

  return {
    createCase,
    listCases,
    getCase,
    deleteCase,
    addDocument,
    listDocuments,
    getDocumentFile,
    addTimelineEvent,
    listTimeline,
    buildMarketplaceListing,
    exportEncryptedBundle
  };
}
