'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LocalCase } from '@caseai/local-vault';
import { useVaultSession } from '../../components/vault-provider';

export default function CasesPage() {
  const { vault } = useVaultSession();
  const [cases, setCases] = useState<LocalCase[]>([]);

  useEffect(() => {
    if (!vault) {
      return;
    }
    void vault.listCases().then(setCases);
  }, [vault]);

  if (!vault) {
    return <p>Please authenticate in /auth.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Local Cases</h1>
        <Link href="/cases/new" className="px-3 py-2 bg-indigo-600">New Case</Link>
      </div>
      <ul className="space-y-2">
        {cases.map((item) => (
          <li key={item.id} className="rounded border border-slate-700 p-3">
            <Link href={`/cases/${item.id}`} className="font-medium">{item.title}</Link>
            <p className="text-sm text-slate-400">{item.jurisdiction} • {item.caseType}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
