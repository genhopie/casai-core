import { initVaultInternal } from './vault/vault';
import { InitVaultParams, VaultClient } from './types';

export type {
  AddDocumentMetadataInput,
  AddTimelineEventInput,
  CreateCaseInput,
  LocalCase,
  LocalDocumentMetadata,
  LocalTimelineEvent,
  MarketplaceListingPayload,
  VaultClient
} from './types';

export async function initVault(params: InitVaultParams): Promise<VaultClient> {
  if (!params.userId || !params.password) {
    throw new Error('userId and password are required');
  }
  return initVaultInternal(params.userId, params.password);
}
