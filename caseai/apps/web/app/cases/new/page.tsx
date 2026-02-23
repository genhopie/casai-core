'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVaultSession } from '../../../components/vault-provider';

export default function NewCasePage() {
  const { vault } = useVaultSession();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [caseType, setCaseType] = useState('CIVIL');
  const [summary, setSummary] = useState('');

  const createCase = async (event: FormEvent) => {
    event.preventDefault();
    if (!vault) {
      return;
    }

    const created = await vault.createCase({
      title,
      jurisdiction,
      caseType,
      languages: ['en'],
      geoScopeLevel: 'LOCAL',
      deadlineDate: new Date(Date.now() + 86400000 * 30).toISOString(),
      budgetMin: 1000,
      budgetMax: 5000,
      currency: 'USD',
      anonymSummary: summary,
      pageEstimate: 25
    });

    router.push(`/cases/${created.id}`);
  };

  return (
    <form className="mx-auto max-w-xl space-y-3" onSubmit={createCase}>
      <h1 className="text-2xl font-semibold">Create local case</h1>
      <input className="w-full p-2" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Case title" required />
      <input className="w-full p-2" value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} placeholder="Jurisdiction" required />
      <input className="w-full p-2" value={caseType} onChange={(e) => setCaseType(e.target.value)} placeholder="Case type" required />
      <textarea className="w-full p-2" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Anonym summary only" required />
      <button type="submit" className="px-3 py-2 bg-indigo-600">Create</button>
    </form>
  );
}
