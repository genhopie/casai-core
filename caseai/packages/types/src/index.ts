export enum CaseType {
  CIVIL = 'CIVIL',
  CRIMINAL = 'CRIMINAL',
  FAMILY = 'FAMILY',
  EMPLOYMENT = 'EMPLOYMENT',
  COMMERCIAL = 'COMMERCIAL',
  IMMIGRATION = 'IMMIGRATION'
}

export enum PricingType {
  FIXED = 'FIXED',
  HOURLY = 'HOURLY'
}

export enum GeoScopeLevel {
  LOCAL = 'LOCAL',
  REGIONAL = 'REGIONAL',
  NATIONAL = 'NATIONAL',
  INTERNATIONAL = 'INTERNATIONAL'
}

export type AnonymMarketplaceListingPayload = {
  jurisdiction: string;
  case_type: CaseType | string;
  languages: string[];
  geo_scope_level: GeoScopeLevel;
  deadline_date: string;
  budget_min: number;
  budget_max: number;
  currency: string;
  doc_volume_count: number;
  doc_volume_pages_est: number;
  anonym_summary: string;
};

export type RedactedAiExcerpt = {
  excerpt: string;
  redactionNotes: string[];
};
