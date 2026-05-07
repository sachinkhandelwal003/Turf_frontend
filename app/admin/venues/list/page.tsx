'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Pencil, Plus, Check, X, Search, MapPin } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Venue List</h2>
          <p className="mt-1 text-sm text-gray-500">Browse and manage all venue records from one place.</p>
        </div>
        <Link
          href="/admin/venues/add"
          className="!inline-flex !items-center !justify-center !gap-2 !rounded-lg !bg-[#1abc60] !px-5 !py-2.5 !text-sm !font-medium !text-white hover:!bg-[#17a554] !transition-colors !shadow-sm !no-underline"
        >
          <Plus className="h-4 w-4" />
          Add Venue
        </Link>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative group flex items-center bg-gray-50 border border-gray-300 rounded-lg focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1abc60]/20 focus-within:border-[#1abc60] transition-all">
          <div className="pl-4 pr-2 text-gray-400 group-focus-within:text-[#1abc60]">
            <Search className="w-4 h-4" />
          </div>
          <input 
            type="text"
            placeholder="Search venues by name or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="!w-full !px-3 !py-2.5 !bg-transparent !outline-none !transition-all !text-sm !text-gray-700 placeholder:!text-gray-400 !border-none focus:!ring-0"
          />
        </div>
      </div>

      {/* Venue List */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#1abc60]" />
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <table className="hidden min-w-full divide-y divide-gray-200 text-left md:table">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Venue</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">City</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Sports</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Base Rate</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredVenues.map((venue) => (
                  <tr key={venue._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shrink-0">
                          {venue.images && venue.images.length > 0 ? (
                            <img src={getImageUrl(venue.images[0])} alt={venue.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-[#1abc60] font-bold">
                              {venue.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <span className="truncate max-w-[180px] font-semibold text-gray-900">{venue.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{venue.location?.city || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{venue.sports?.join(', ') || '-'}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{venue.pricePerHour || 0} <span className="text-gray-500 font-normal">/ hr</span></td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium capitalize border ${
                        (venue.status || 'pending') === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                        (venue.status || 'pending') === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {(venue.status || 'pending')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/venues/edit?id=${venue._id}`} 
                          className="!inline-flex !items-center !justify-center !gap-1.5 !px-3 !py-1.5 !rounded-md !text-sm !font-medium !text-[#1abc60] hover:!bg-green-50 !bg-transparent !border !border-transparent hover:!border-green-100 !transition-colors !no-underline"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                        
                        {user?.role === 'superadmin' && (
                          <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
                            {venue.status !== 'approved' && (
                              <button
                                onClick={() => handleStatusUpdate(venue._id, 'approved')}
                                disabled={actionLoading === venue._id}
                                className="!inline-flex !items-center !justify-center !w-8 !h-8 !bg-green-50 !text-green-600 hover:!bg-green-100 !rounded-md !transition-colors !border-none !cursor-pointer disabled:!opacity-50"
                                title="Approve Venue"
                              >
                                {actionLoading === venue._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                              </button>
                            )}
                            {venue.status !== 'rejected' && (
                              <button
                                onClick={() => handleStatusUpdate(venue._id, 'rejected')}
                                disabled={actionLoading === venue._id}
                                className="!inline-flex !items-center !justify-center !w-8 !h-8 !bg-red-50 !text-red-600 hover:!bg-red-100 !rounded-md !transition-colors !border-none !cursor-pointer disabled:!opacity-50"
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
                {filteredVenues.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No venues found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Mobile List View */}
            <div className="divide-y divide-gray-100 md:hidden">
              {filteredVenues.map((venue) => (
                <div key={venue._id} className="p-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shrink-0">
                        {venue.images && venue.images.length > 0 ? (
                          <img src={getImageUrl(venue.images[0])} alt={venue.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-[#1abc60] font-bold">
                            {venue.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{venue.name}</p>
                        <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{venue.location?.city || '-'}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold capitalize border ${
                      (venue.status || 'pending') === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                      (venue.status || 'pending') === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {venue.status || 'pending'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <p className="text-sm font-bold text-gray-900">₹{venue.pricePerHour || 0} <span className="text-xs font-normal text-gray-500">/ hr</span></p>
                      <p className="text-xs text-gray-500 mt-0.5">{venue.sports?.join(', ') || '-'}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {user?.role === 'superadmin' && (
                        <>
                          {venue.status !== 'approved' && (
                            <button
                              onClick={() => handleStatusUpdate(venue._id, 'approved')}
                              disabled={actionLoading === venue._id}
                              className="!inline-flex !items-center !justify-center !w-8 !h-8 !bg-green-50 !text-green-600 hover:!bg-green-100 !rounded-md !transition-colors !border-none !cursor-pointer disabled:!opacity-50"
                            >
                              {actionLoading === venue._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                            </button>
                          )}
                          {venue.status !== 'rejected' && (
                            <button
                              onClick={() => handleStatusUpdate(venue._id, 'rejected')}
                              disabled={actionLoading === venue._id}
                              className="!inline-flex !items-center !justify-center !w-8 !h-8 !bg-red-50 !text-red-600 hover:!bg-red-100 !rounded-md !transition-colors !border-none !cursor-pointer disabled:!opacity-50"
                            >
                              {actionLoading === venue._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                            </button>
                          )}
                        </>
                      )}
                      <Link 
                        href={`/admin/venues/edit?id=${venue._id}`} 
                        className="!inline-flex !items-center !justify-center !gap-1.5 !px-3 !py-1.5 !bg-gray-50 !text-gray-700 hover:!bg-gray-100 hover:!text-gray-900 !rounded-md !text-xs !font-medium !border !border-gray-200 !transition-colors !no-underline ml-1"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              {filteredVenues.length === 0 && (
                <div className="px-6 py-12 text-center text-gray-500">
                  No venues found matching your search.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// uioesagfbweqoifghwuioeqh