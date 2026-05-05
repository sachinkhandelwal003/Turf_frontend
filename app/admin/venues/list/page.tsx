'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Pencil, Plus } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/app/services/api';

interface VenueItem {
  _id: string;
  name: string;
  pricePerHour: number;
  isActive: boolean;
  sports: string[];
  location?: {
    city?: string;
  };
}

export default function VenueListPage() {
  const [venues, setVenues] = useState<VenueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVenues = async () => {
      setLoading(true);
      try {
        const res = await api.get('/turfs/my/all');
        setVenues(res.data?.turfs || []);
      } catch (error) {
        toast.error('Failed to load venues');
      } finally {
        setLoading(false);
      }
    };
    fetchVenues();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Venue List</h2>
          <p className="mt-1 text-sm text-gray-500">Browse and manage all venue records from one place.</p>
        </div>
        <Link
          href="/admin/venues/add"
          className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          <Plus className="h-4 w-4" />
          Add Venue
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
          </div>
        ) : (
          <>
            <table className="hidden min-w-full divide-y divide-gray-200 text-left md:table">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Venue</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">City</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Sports</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Base Rate</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {venues.map((venue) => (
                  <tr key={venue._id}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{venue.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{venue.location?.city || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{venue.sports?.join(', ') || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">₹{venue.pricePerHour || 0} / hour</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${venue.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {venue.isActive ? 'Active' : 'Pending Review'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/venues/edit?id=${venue._id}`} className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700">
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="space-y-3 p-3 md:hidden">
              {venues.map((venue) => (
                <div key={venue._id} className="rounded-lg border border-gray-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{venue.name}</p>
                      <p className="text-xs text-gray-600">{venue.location?.city || '-'}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${venue.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {venue.isActive ? 'Active' : 'Pending'}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-600">{venue.sports?.join(', ') || '-'}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-700">₹{venue.pricePerHour || 0} / hour</p>
                    <Link href={`/admin/venues/edit?id=${venue._id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
