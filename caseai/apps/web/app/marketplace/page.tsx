'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiRequest, marketplaceApiUrl } from '../../lib/api';
import { useVaultSession } from '../../components/vault-provider';

type Listing = {
  listing_id: string;
  jurisdiction: string;
  case_type: string;
  anonym_summary: string;
  budget_min: string;
  budget_max: string;
  currency: string;
};

export default function MarketplacePage() {
  const { session } = useVaultSession();
  const [listings, setListings] = useState<Listing[]>([]);
  const [bidText, setBidText] = useState<Record<string, string>>({});
  const [bidStatus, setBidStatus] = useState('');

  useEffect(() => {
    void apiRequest<Listing[]>(`${marketplaceApiUrl}/listings`, { method: 'GET' }).then(setListings);
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Marketplace</h1>
      <ul className="space-y-3">
        {listings.map((listing) => (
          <li key={listing.listing_id} className="rounded border border-slate-700 p-3">
            <p className="font-semibold">{listing.case_type} • {listing.jurisdiction}</p>
            <p className="text-sm text-slate-300">{listing.anonym_summary}</p>
            <p className="text-xs text-slate-400">{listing.budget_min} - {listing.budget_max} {listing.currency}</p>
            {session ? (
              <div className="mt-2 flex gap-2">
                <input
                  className="p-2 text-xs"
                  placeholder="Bid amount"
                  value={bidText[listing.listing_id] ?? ''}
                  onChange={(event) =>
                    setBidText((current) => ({ ...current, [listing.listing_id]: event.target.value }))
                  }
                />
                <button
                  className="px-2 py-1 bg-indigo-600 text-xs"
                  onClick={async () => {
                    const amount = Number(bidText[listing.listing_id] ?? '0');
                    await apiRequest(
                      `${marketplaceApiUrl}/listings/${listing.listing_id}/bids`,
                      {
                        method: 'POST',
                        body: JSON.stringify({
                          pricing_type: 'FIXED',
                          price_amount: amount,
                          currency: listing.currency,
                          estimate_text: 'Estimated scope based on anonym listing only.',
                          conditions_text: 'Subject to NDA and full local review by client.'
                        })
                      },
                      session.accessToken
                    );
                    setBidStatus(`Bid submitted for listing ${listing.listing_id}`);
                  }}
                >
                  Submit bid
                </button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      {bidStatus ? <p className="text-emerald-400 text-sm">{bidStatus}</p> : null}
      <Link href="/cases" className="inline-block px-3 py-2 bg-indigo-600">Create/publish from local case</Link>
    </div>
  );
}
