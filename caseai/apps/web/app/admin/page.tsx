'use client';

import { useEffect, useState } from 'react';
import { useVaultSession } from '../../components/vault-provider';
import { apiRequest, authApiUrl, marketplaceApiUrl } from '../../lib/api';

type UserRow = { id: string; email: string; status: string };
type ListingRow = { listing_id: string; moderation_status: string; case_type: string };
type RevenueRow = { plan_type: string; status: string; _count: { _all: number } };

export default function AdminPage() {
  const { session } = useVaultSession();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [queue, setQueue] = useState<ListingRow[]>([]);
  const [revenue, setRevenue] = useState<RevenueRow[]>([]);

  useEffect(() => {
    if (!session) {
      return;
    }
    void Promise.all([
      apiRequest<UserRow[]>(`${authApiUrl}/admin/users`, { method: 'GET' }, session.accessToken),
      apiRequest<ListingRow[]>(`${marketplaceApiUrl}/admin/listings/moderation-queue`, { method: 'GET' }, session.accessToken),
      apiRequest<RevenueRow[]>(`${authApiUrl}/admin/revenue-snapshots`, { method: 'GET' }, session.accessToken)
    ]).then(([usersRes, queueRes, revenueRes]) => {
      setUsers(usersRes);
      setQueue(queueRes);
      setRevenue(revenueRes);
    });
  }, [session]);

  if (!session) {
    return <p>Please authenticate in /auth.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin</h1>

      <section>
        <h2 className="mb-2 text-lg font-medium">Users</h2>
        <div className="overflow-x-auto rounded border border-slate-700">
          <table className="w-full text-sm">
            <thead><tr><th className="p-2 text-left">ID</th><th className="p-2 text-left">Email</th><th className="p-2 text-left">Status</th></tr></thead>
            <tbody>{users.map((user) => <tr key={user.id}><td className="p-2">{user.id}</td><td className="p-2">{user.email}</td><td className="p-2">{user.status}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-medium">Listings moderation queue</h2>
        <div className="overflow-x-auto rounded border border-slate-700">
          <table className="w-full text-sm">
            <thead><tr><th className="p-2 text-left">Listing ID</th><th className="p-2 text-left">Case Type</th><th className="p-2 text-left">Status</th></tr></thead>
            <tbody>{queue.map((listing) => <tr key={listing.listing_id}><td className="p-2">{listing.listing_id}</td><td className="p-2">{listing.case_type}</td><td className="p-2">{listing.moderation_status}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-medium">Revenue snapshots</h2>
        <div className="overflow-x-auto rounded border border-slate-700">
          <table className="w-full text-sm">
            <thead><tr><th className="p-2 text-left">Plan</th><th className="p-2 text-left">Status</th><th className="p-2 text-left">Count</th></tr></thead>
            <tbody>{revenue.map((row) => <tr key={`${row.plan_type}-${row.status}`}><td className="p-2">{row.plan_type}</td><td className="p-2">{row.status}</td><td className="p-2">{row._count._all}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
