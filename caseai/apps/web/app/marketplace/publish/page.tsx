'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useVaultSession } from '../../../components/vault-provider';
import { apiRequest, marketplaceApiUrl } from '../../../lib/api';

type ListingPreview = {
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

export default function PublishPage() {
  const { vault, session } = useVaultSession();
  const searchParams = useSearchParams();
  const caseId = searchParams.get('caseId') ?? '';
  const [preview, setPreview] = useState<ListingPreview | null>(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!vault || !caseId) {
      return;
    }
    void vault.buildMarketplaceListing(caseId).then((result) => setPreview(result as ListingPreview));
  }, [vault, caseId]);

  const publish = async () => {
    if (!preview || !session) {
      return;
    }
    const payload = {
      jurisdiction: preview.jurisdiction,
      case_type: preview.caseType,
      languages: preview.languages,
      geo_scope_level: preview.geoScopeLevel,
      deadline_date: preview.deadlineDate,
      budget_min: preview.budgetMin,
      budget_max: preview.budgetMax,
      currency: preview.currency,
      doc_volume_count: preview.docCount,
      doc_volume_pages_est: preview.pageEstimate,
      anonym_summary: preview.anonymSummary
    };

    await apiRequest(`${marketplaceApiUrl}/listings`, { method: 'POST', body: JSON.stringify(payload) }, session.accessToken);
    setStatus('Listing created. Publish/approval may still be required by moderation flow.');
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Publish anonymized listing</h1>
      {preview ? <pre className="overflow-x-auto rounded border border-slate-700 p-3 text-xs">{JSON.stringify(preview, null, 2)}</pre> : <p>Loading preview...</p>}
      <button className="px-3 py-2 bg-indigo-600" onClick={publish} disabled={!preview}>Confirm publish</button>
      {status ? <p className="text-emerald-400">{status}</p> : null}
      <p className="text-xs text-slate-400">Payload excludes filenames, document text, and notes by design.</p>
    </div>
  );
}
