import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">caseai</h1>
      <p className="text-slate-300">Local-first legal workspace with anonymized marketplace publishing.</p>
      <div className="flex gap-4">
        <Link href="/auth" className="px-4 py-2 bg-indigo-600 rounded">Get started</Link>
        <Link href="/marketplace" className="px-4 py-2 border border-slate-700 rounded">Marketplace</Link>
      </div>
    </div>
  );
}
