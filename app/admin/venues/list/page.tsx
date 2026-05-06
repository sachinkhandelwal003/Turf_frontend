'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Pencil, Plus, Check, X, Search } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/app/services/api';
import { useAuth } from '@/app/context/AuthContext';

interface VenueItem {
  _id: string;
  name: string;
  pricePerHour: number;
  isActive: boolean;
  status: 'pending' | 'approved' | 'rejected';
  images?: string[];
  sports: string[];
  location?: {
    city?: string;
  };
}

export default function VenueListPage() {
  const { user } = useAuth();
  const [venues, setVenues] = useState<VenueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5001';
    return `${baseUrl}${path}`;
  };

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

  useEffect(() => {
    fetchVenues();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      await api.patch(`/turfs/${id}/status`, { status: newStatus });
      toast.success(`Venue ${newStatus} successfully`);
      fetchVenues();
    } catch (error: any) {
      toast.error(error.response?.data?.error || `Failed to update status`);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredVenues = venues.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.location?.city || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {/* Search Filter */}
      <div className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-100">
        <div className="relative max-w-md group flex items-center bg-gray-50/50 border border-gray-100 rounded-full focus-within:bg-white focus:ring-4 focus:ring-green-50 focus:border-[#1abc60] transition-all">
          <div className="pl-6 pr-3 text-gray-400 group-focus-within:text-[#1abc60]">
            <Search className="w-5 h-5" />
          </div>
          <div className="w-px h-6 bg-gray-200" />
          <input 
            type="text"
            placeholder="Search venues by name or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3.5 bg-transparent outline-none transition-all text-sm font-bold text-gray-700 placeholder:text-gray-300"
          />
        </div>
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
                {filteredVenues.map((venue) => (
                  <tr key={venue._id}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 shrink-0">
                          {venue.images && venue.images.length > 0 ? (
                            <img src={getImageUrl(venue.images[0])} alt={venue.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-600">
                              {venue.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <span className="truncate max-w-[150px]">{venue.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{venue.location?.city || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{venue.sports?.join(', ') || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">₹{venue.pricePerHour || 0} / hour</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        (venue.status || 'pending') === 'approved' ? 'bg-emerald-50 text-emerald-700' : 
                        (venue.status || 'pending') === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {(venue.status || 'pending').charAt(0).toUpperCase() + (venue.status || 'pending').slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link href={`/admin/venues/edit?id=${venue._id}`} className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700">
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Link>
                        {user?.role === 'superadmin' && (
                          <div className="flex items-center gap-2 ml-2 border-l pl-3">
                            {venue.status !== 'approved' && (
                              <button
                                onClick={() => handleStatusUpdate(venue._id, 'approved')}
                                disabled={actionLoading === venue._id}
                                className="inline-flex items-center justify-center p-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-md transition-all shadow-sm"
                                title="Approve Venue"
                              >
                                {actionLoading === venue._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                              </button>
                            )}
                            {venue.status !== 'rejected' && (
                              <button
                                onClick={() => handleStatusUpdate(venue._id, 'rejected')}
                                disabled={actionLoading === venue._id}
                                className="inline-flex items-center justify-center p-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition-all shadow-sm"
                                title="Reject Venue"
                              >
                                {actionLoading === venue._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="space-y-3 p-3 md:hidden">
              {venues.map((venue) => (
                <div key={venue._id} className="rounded-lg border border-gray-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 shrink-0">
                        {venue.images && venue.images.length > 0 ? (
                          <img src={getImageUrl(venue.images[0])} alt={venue.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-600 font-bold">
                            {venue.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{venue.name}</p>
                        <p className="text-xs text-gray-600">{venue.location?.city || '-'}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                      (venue.status || 'pending') === 'approved' ? 'bg-emerald-50 text-emerald-700' : 
                      (venue.status || 'pending') === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {(venue.status || 'pending').charAt(0).toUpperCase() + (venue.status || 'pending').slice(1)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-600">{venue.sports?.join(', ') || '-'}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-700">₹{venue.pricePerHour || 0} / hour</p>
                    <div className="flex items-center gap-3">
                      {user?.role === 'superadmin' && (
                        <div className="flex items-center gap-2 mr-2 pr-2 border-r">
                          {venue.status !== 'approved' && (
                            <button
                              onClick={() => handleStatusUpdate(venue._id, 'approved')}
                              disabled={actionLoading === venue._id}
                              className="inline-flex items-center justify-center p-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-md transition-all shadow-sm"
                              title="Approve Venue"
                            >
                              {actionLoading === venue._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                            </button>
                          )}
                          {venue.status !== 'rejected' && (
                            <button
                              onClick={() => handleStatusUpdate(venue._id, 'rejected')}
                              disabled={actionLoading === venue._id}
                              className="inline-flex items-center justify-center p-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition-all shadow-sm"
                              title="Reject Venue"
                            >
                              {actionLoading === venue._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                            </button>
                          )}
                        </div>
                      )}
                      <Link href={`/admin/venues/edit?id=${venue._id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                    </div>
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
