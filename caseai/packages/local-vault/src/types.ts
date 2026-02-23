export type EncryptedPayload = {
  iv: Uint8Array;
  ciphertext: Uint8Array;
};

export type SerializedEncryptedPayload = {
  iv: number[];
  ciphertext: number[];
};

export type CaseStatus = 'DRAFT' | 'OPEN' | 'ARCHIVED';

export type LocalCase = {
  id: string;
  userId: string;
  title: string;
  jurisdiction: string;
  caseType: string;
  languages: string[];
  geoScopeLevel: 'LOCAL' | 'REGIONAL' | 'NATIONAL' | 'INTERNATIONAL';
  deadlineDate: string;
  budgetMin: number;
  budgetMax: number;
  currency: string;
  anonymSummary: string;
  pageEstimate: number;
  status: CaseStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateCaseInput = Omit<LocalCase, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'status'> & {
  status?: CaseStatus;
};

export type LocalDocumentMetadata = {
  id: string;
  caseId: string;
  userId: string;
  pageCountEstimate: number;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
};

export type AddDocumentMetadataInput = {
  pageCountEstimate: number;
};

export type LocalTimelineEvent = {
  id: string;
  caseId: string;
  userId: string;
  type: 'MILESTONE' | 'NOTE' | 'DEADLINE' | 'ACTION';
  content: string;
  occurredAt: string;
  createdAt: string;
};

export type AddTimelineEventInput = Omit<LocalTimelineEvent, 'id' | 'createdAt' | 'userId'>;

export type MarketplaceListingPayload = {
  jurisdiction: string;
  caseType: string;
  languages: string[];
  geoScopeLevel: 'LOCAL' | 'REGIONAL' | 'NATIONAL' | 'INTERNATIONAL';
  deadlineDate: string;
  budgetMin: number;
  budgetMax: number;
  currency: string;
  docCount: number;
  pageEstimate: number;
  anonymSummary: string;
};

export type ExportedEncryptedBundleManifest = {
  version: '1';
  exportedAt: string;
  caseId: string;
  userId: string;
  includesEncryptedContentOnly: true;
};

export type VaultClient = {
  createCase(input: CreateCaseInput): Promise<LocalCase>;
  listCases(): Promise<LocalCase[]>;
  getCase(caseId: string): Promise<LocalCase | null>;
  deleteCase(caseId: string): Promise<void>;
  addDocument(caseId: string, file: File, metadata: AddDocumentMetadataInput): Promise<LocalDocumentMetadata>;
  listDocuments(caseId: string): Promise<LocalDocumentMetadata[]>;
  getDocumentFile(documentId: string): Promise<Blob>;
  addTimelineEvent(caseId: string, event: AddTimelineEventInput): Promise<LocalTimelineEvent>;
  listTimeline(caseId: string): Promise<LocalTimelineEvent[]>;
  buildMarketplaceListing(caseId: string): Promise<MarketplaceListingPayload>;
  exportEncryptedBundle(caseId: string): Promise<Blob>;
};

export type InitVaultParams = {
  userId: string;
  password: string;
};
