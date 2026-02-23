import { DBSchema, IDBPDatabase, openDB } from 'idb';
import { EncryptedPayload, SerializedEncryptedPayload } from '../types';

type VaultMetaRecord = {
  userId: string;
  salt: number[];
  createdAt: string;
};

type EncryptedRecord = {
  id: string;
  userId: string;
  payload: SerializedEncryptedPayload;
};

interface VaultDbSchema extends DBSchema {
  vault_meta: {
    key: string;
    value: VaultMetaRecord;
  };
  cases: {
    key: string;
    value: EncryptedRecord;
    indexes: { 'by-user': string };
  };
  documents: {
    key: string;
    value: EncryptedRecord;
    indexes: { 'by-user': string };
  };
  timeline: {
    key: string;
    value: EncryptedRecord;
    indexes: { 'by-user': string };
  };
}

function toSerializedPayload(payload: EncryptedPayload): SerializedEncryptedPayload {
  return {
    iv: Array.from(payload.iv),
    ciphertext: Array.from(payload.ciphertext)
  };
}

function fromSerializedPayload(payload: SerializedEncryptedPayload): EncryptedPayload {
  return {
    iv: Uint8Array.from(payload.iv),
    ciphertext: Uint8Array.from(payload.ciphertext)
  };
}

export class WebIndexedDbVaultStorage {
  private readonly dbName: string;
  private db: IDBPDatabase<VaultDbSchema> | null = null;

  constructor(userId: string) {
    this.dbName = `caseai-vault-${userId}`;
  }

  async connect(): Promise<void> {
    this.db = await openDB<VaultDbSchema>(this.dbName, 1, {
      upgrade(db: IDBPDatabase<VaultDbSchema>) {
        db.createObjectStore('vault_meta');

        const cases = db.createObjectStore('cases', { keyPath: 'id' });
        cases.createIndex('by-user', 'userId');

        const documents = db.createObjectStore('documents', { keyPath: 'id' });
        documents.createIndex('by-user', 'userId');

        const timeline = db.createObjectStore('timeline', { keyPath: 'id' });
        timeline.createIndex('by-user', 'userId');
      }
    });
  }

  private assertDb(): IDBPDatabase<VaultDbSchema> {
    if (!this.db) {
      throw new Error('Vault storage is not connected');
    }
    return this.db;
  }

  async getMeta(userId: string): Promise<VaultMetaRecord | null> {
    const db = this.assertDb();
    return (await db.get('vault_meta', userId)) ?? null;
  }

  async setMeta(record: VaultMetaRecord): Promise<void> {
    const db = this.assertDb();
    await db.put('vault_meta', record, record.userId);
  }

  async putEncrypted(store: 'cases' | 'documents' | 'timeline', id: string, userId: string, payload: EncryptedPayload): Promise<void> {
    const db = this.assertDb();
    await db.put(store, { id, userId, payload: toSerializedPayload(payload) });
  }

  async getEncrypted(store: 'cases' | 'documents' | 'timeline', id: string): Promise<EncryptedPayload | null> {
    const db = this.assertDb();
    const record = await db.get(store, id);
    if (!record) {
      return null;
    }
    return fromSerializedPayload(record.payload);
  }

  async getAllEncryptedByUser(store: 'cases' | 'documents' | 'timeline', userId: string): Promise<Array<{ id: string; payload: EncryptedPayload }>> {
    const db = this.assertDb();
    const records = await db.getAllFromIndex(store, 'by-user', userId);
    return records.map((record: EncryptedRecord) => ({
      id: record.id,
      payload: fromSerializedPayload(record.payload)
    }));
  }

  async delete(store: 'cases' | 'documents' | 'timeline', id: string): Promise<void> {
    const db = this.assertDb();
    await db.delete(store, id);
  }
}
