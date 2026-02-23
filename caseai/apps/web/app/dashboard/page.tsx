'use client';

import Link from 'next/link';
import { useVaultSession } from '../../components/vault-provider';

export default function DashboardPage() {
  const { session, logout } = useVaultSession();
  if (!session) {
    return (
      <div className="space-y-4">
        <p>Please login first.</p>
        <Link href="/auth">Go to auth</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Dashboard</h1>
      <p className="text-slate-300">Signed in as {session.userId}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/cases" className="rounded border border-slate-700 p-4">Local Cases</Link>
        <Link href="/marketplace" className="rounded border border-slate-700 p-4">Marketplace</Link>
        <Link href="/admin" className="rounded border border-slate-700 p-4">Admin</Link>
      </div>
      <button className="px-3 py-2 bg-slate-800" onClick={logout}>Logout</button>
    </div>
  );
}
