"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Pencil, Plus, Check, X, Search, MapPin, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/app/services/api';
import { useAuth } from '@/app/context/AuthContext';
import Swal from 'sweetalert2';

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
  owner?: {
    _id: string;
    name: string;
    email: string;
  };
}

export default function VenueListPage() {
  const { user } = useAuth();
  const [venues, setVenues] = useState<VenueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOwner, setSelectedOwner] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const uniqueOwners = Array.from(new Set(venues.map(v => v.owner?.name).filter(Boolean)));
             

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

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This venue will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        const res = await api.delete(`/turfs/${id}`);
        if (res.data.success) {
          setVenues(venues.filter(v => v._id !== id));
          Swal.fire({
            title: "Deleted!",
            text: "Venue has been deleted.",
            icon: "success",
            confirmButtonColor: "#1abc60"
          });
        }
      } catch (error: any) {
        Swal.fire({
          title: "Error!",
          text: error.response?.data?.error || "Failed to delete venue",
          icon: "error",
          confirmButtonColor: "#1abc60"
        });
      }
    }
  };

  const filteredVenues = venues.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (v.location?.city || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOwner = selectedOwner ? v.owner?.name === selectedOwner : true;
    return matchesSearch && matchesOwner;
  });

  return (
    <div className="!max-w-7xl !mx-auto !px-4 sm:!px-6 lg:!px-8 !py-8 !space-y-6 !font-sans">
      {/* Header */}
      <div className="!flex !flex-col sm:!flex-row sm:!items-center !justify-between !gap-4 !border-b !border-gray-200 !pb-5">
        <div>
          <h2 className="!text-2xl !font-bold !text-gray-900 !tracking-tight !m-0">Venue List</h2>
          <p className="!mt-1 !text-sm !text-gray-500 !font-medium !m-0">Browse and manage all venue records from one place.</p>
        </div>
        <Link
          href="/admin/venues/add"
          className="!inline-flex !items-center !justify-center !gap-2 !rounded-lg !bg-[#1abc60] !px-5 !py-2.5 !text-sm !font-semibold !text-white hover:!bg-[#17a554] !transition-colors !shadow-sm !no-underline"
        >
          <Plus className="!w-4 !h-4 !block !shrink-0" />
          Add Venue
        </Link>
      </div>

      {/* Search Filter */}
      <div className="!bg-white !p-4 !rounded-xl !shadow-sm !border !border-gray-200 !flex !flex-col sm:!flex-row !gap-4">
        <div className="!relative !group !flex !items-center !bg-gray-50 !border !border-gray-300 !rounded-lg focus-within:!bg-white focus-within:!ring-2 focus-within:!ring-[#1abc60]/20 focus-within:!border-[#1abc60] !transition-all !w-full">
          <div className="!pl-4 !pr-2 !text-gray-400 group-focus-within:!text-[#1abc60]">
            <Search className="!w-4 !h-4 !block !shrink-0" />
          </div>
          <input 
            type="text"
            placeholder="Search venues by name or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="!w-full !px-3 !py-2.5 !bg-transparent !outline-none !transition-all !text-sm !font-medium !text-gray-900 placeholder:!text-gray-400 !border-none focus:!ring-0"
          />
        </div>
        
        {/* Admin Filter Dropdown (Superadmin only) */}
        {user?.role === 'superadmin' && uniqueOwners.length > 0 && (
          <select
            value={selectedOwner}
            onChange={(e) => setSelectedOwner(e.target.value)}
            className="!w-full sm:!w-64 !px-4 !py-2.5 !bg-gray-50 !border !border-gray-300 !text-gray-700 !rounded-lg hover:!bg-white !text-sm !font-semibold !transition-colors !outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !cursor-pointer"
          >
            <option value="">All Venue Owners</option>
            {uniqueOwners.map((ownerName) => (
              <option key={ownerName as string} value={ownerName as string}>{ownerName as string}</option>
            ))}
          </select>
        )}
      </div>

      {/* Venue List */}
      <div className="!overflow-hidden !rounded-xl !border !border-gray-200 !bg-white !shadow-sm">
        {loading ? (
          <div className="!flex !items-center !justify-center !py-16">
            <Loader2 className="!h-8 !w-8 !block !shrink-0 !animate-spin !text-[#1abc60]" />
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <table className="!hidden !min-w-full !divide-y !divide-gray-200 !text-left md:!table">
              <thead className="!bg-gray-50">
                <tr>
                  <th className="!px-6 !py-4 !text-xs !font-bold !uppercase !tracking-wider !text-gray-500">Venue</th>
                  <th className="!px-6 !py-4 !text-xs !font-bold !uppercase !tracking-wider !text-gray-500">City</th>
                  <th className="!px-6 !py-4 !text-xs !font-bold !uppercase !tracking-wider !text-gray-500">Sports</th>
                  <th className="!px-6 !py-4 !text-xs !font-bold !uppercase !tracking-wider !text-gray-500">Base Rate</th>
                  <th className="!px-6 !py-4 !text-xs !font-bold !uppercase !tracking-wider !text-gray-500">Status</th>
                  <th className="!px-6 !py-4 !text-xs !font-bold !uppercase !tracking-wider !text-gray-500 !text-right">Action</th>
                </tr>
              </thead>
              <tbody className="!divide-y !divide-gray-200">
                {filteredVenues.map((venue) => (
                  <tr key={venue._id} className="hover:!bg-gray-50/50 !transition-colors">
                    <td className="!px-6 !py-4">
                      <div className="!flex !items-center !gap-3">
                        <div className="!w-10 !h-10 !rounded-lg !bg-gray-100 !flex !items-center !justify-center !overflow-hidden !border !border-gray-200 !shrink-0">
                          {venue.images && venue.images.length > 0 ? (
                            <img src={getImageUrl(venue.images[0])} alt={venue.name} className="!w-full !h-full !object-cover" />
                          ) : (
                            <div className="!w-full !h-full !flex !items-center !justify-center !bg-emerald-50 !text-[#1abc60] !font-bold">
                              {venue.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="!flex !flex-col !min-w-0">
                          <span className="!truncate !max-w-[180px] !font-bold !text-sm !text-gray-900">{venue.name}</span>
                          {user?.role === 'superadmin' && venue.owner?.name && (
                            <span className="!text-[10px] !text-gray-400 !font-medium !truncate">Owner: {venue.owner.name}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="!px-6 !py-4 !text-sm !font-medium !text-gray-600">{venue.location?.city || '-'}</td>
                    <td className="!px-6 !py-4 !text-sm !font-medium !text-gray-600">{venue.sports?.join(', ') || '-'}</td>
                    <td className="!px-6 !py-4 !text-sm !font-bold !text-gray-900">₹{venue.pricePerHour || 0} <span className="!text-gray-500 !font-medium !text-xs">/ hr</span></td>
                    <td className="!px-6 !py-4">
                      <span className={`!inline-flex !items-center !px-2.5 !py-1 !rounded-md !text-[10px] !font-bold !uppercase !tracking-wider !border ${
                        (venue.status || 'pending') === 'approved' ? '!bg-emerald-50 !text-emerald-700 !border-emerald-200' : 
                        (venue.status || 'pending') === 'rejected' ? '!bg-red-50 !text-red-700 !border-red-200' : '!bg-amber-50 !text-amber-700 !border-amber-200'
                      }`}>
                        {(venue.status || 'pending')}
                      </span>
                    </td>
                    <td className="!px-6 !py-4">
                      <div className="!flex !items-center !justify-end !gap-2">
                        
                        <Link 
                          href={`/admin/venues/edit?id=${venue._id}`} 
                          className="!inline-flex !items-center !justify-center !gap-1.5 !px-3 !py-1.5 !bg-white !border !border-gray-300 !text-gray-700 !rounded-lg !text-xs !font-bold hover:!bg-gray-50 hover:!text-[#1abc60] hover:!border-[#1abc60]/30 !transition-all !shadow-sm !no-underline"
                        >
                          <Pencil className="!w-3.5 !h-3.5 !block !shrink-0 !opacity-100" />
                          <span className="!block">Edit</span>
                        </Link>
                        
                        {/* Status Update & Delete Buttons */}
                        <div className="!flex !items-center !gap-1.5 !border-l !border-gray-200 !pl-3 !ml-1">
                          {venue.status !== 'approved' && (
                            <button
                              onClick={() => handleStatusUpdate(venue._id, 'approved')}
                              disabled={actionLoading === venue._id}
                              className="!inline-flex !items-center !justify-center !w-8 !h-8 !bg-white !border !border-green-200 !text-green-600 hover:!bg-green-50 !rounded-lg !transition-all !cursor-pointer disabled:!opacity-50 !shadow-sm"
                              title="Approve Venue"
                            >
                              {actionLoading === venue._id ? <Loader2 className="!w-4 !h-4 !block !shrink-0 !animate-spin" /> : <Check className="!w-4 !h-4 !block !shrink-0 !opacity-100" />}
                            </button>
                          )}
                          {venue.status !== 'rejected' && (
                            <button
                              onClick={() => handleStatusUpdate(venue._id, 'rejected')}
                              disabled={actionLoading === venue._id}
                              className="!inline-flex !items-center !justify-center !w-8 !h-8 !bg-white !border !border-red-200 !text-red-600 hover:!bg-red-50 !rounded-lg !transition-all !cursor-pointer disabled:!opacity-50 !shadow-sm"
                              title="Reject Venue"
                            >
                              {actionLoading === venue._id ? <Loader2 className="!w-4 !h-4 !block !shrink-0 !animate-spin" /> : <X className="!w-4 !h-4 !block !shrink-0 !opacity-100" />}
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(venue._id)}
                            className="!inline-flex !items-center !justify-center !w-8 !h-8 !bg-white !border !border-gray-200 !text-gray-400 hover:!text-red-600 hover:!border-red-200 hover:!bg-red-50 !rounded-lg !transition-all !cursor-pointer !shadow-sm"
                            title="Delete Venue"
                          >
                            <Trash2 className="!w-4 !h-4 !block !shrink-0 !opacity-100" />
                          </button>
                        </div>
                        
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredVenues.length === 0 && (
                  <tr>
                    <td colSpan={6} className="!px-6 !py-12 !text-center !text-sm !font-medium !text-gray-500">
                      No venues found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Mobile List View */}
            <div className="!divide-y !divide-gray-200 md:!hidden">
              {filteredVenues.map((venue) => (
                <div key={venue._id} className="!p-4 hover:!bg-gray-50/50 !transition-colors">
                  <div className="!flex !items-start !justify-between !gap-3 !mb-3">
                    <div className="!flex !items-center !gap-3 !min-w-0">
                      <div className="!w-12 !h-12 !rounded-lg !bg-gray-100 !flex !items-center !justify-center !overflow-hidden !border !border-gray-200 !shrink-0">
                        {venue.images && venue.images.length > 0 ? (
                          <img src={getImageUrl(venue.images[0])} alt={venue.name} className="!w-full !h-full !object-cover" />
                        ) : (
                          <div className="!w-full !h-full !flex !items-center !justify-center !bg-emerald-50 !text-[#1abc60] !font-bold">
                            {venue.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="!min-w-0">
                        <p className="!text-sm !font-bold !text-gray-900 !truncate !m-0">{venue.name}</p>
                        <div className="!flex !items-center !gap-1 !mt-1 !text-xs !font-medium !text-gray-500">
                          <MapPin className="!w-3 !h-3 !shrink-0" />
                          <span className="!truncate">{venue.location?.city || '-'}</span>
                        </div>
                        {user?.role === 'superadmin' && venue.owner?.name && (
                          <p className="!text-[10px] !text-gray-400 !mt-0.5 !truncate !m-0">Owner: {venue.owner.name}</p>
                        )}
                      </div>
                    </div>
                    <span className={`!shrink-0 !rounded-md !px-2 !py-1 !text-[10px] !font-bold !uppercase !tracking-wider !border ${
                      (venue.status || 'pending') === 'approved' ? '!bg-emerald-50 !text-emerald-700 !border-emerald-200' : 
                      (venue.status || 'pending') === 'rejected' ? '!bg-red-50 !text-red-700 !border-red-200' : '!bg-amber-50 !text-amber-700 !border-amber-200'
                    }`}>
                      {venue.status || 'pending'}
                    </span>
                  </div>
                  
                  <div className="!flex !items-center !justify-between !mt-4">
                    <div>
                      <p className="!text-sm !font-bold !text-gray-900 !m-0">₹{venue.pricePerHour || 0} <span className="!text-[10px] !font-medium !text-gray-500">/ hr</span></p>
                      <p className="!text-xs !font-medium !text-gray-500 !mt-1 !m-0">{venue.sports?.join(', ') || '-'}</p>
                    </div>
                    
                    <div className="!flex !items-center !gap-2">
                      {/* Action Buttons for Mobile */}
                      <div className="!flex !items-center !gap-1.5 !mr-2 !pr-3 !border-r !border-gray-200">
                        {venue.status !== 'approved' && (
                          <button
                            onClick={() => handleStatusUpdate(venue._id, 'approved')}
                            disabled={actionLoading === venue._id}
                            className="!inline-flex !items-center !justify-center !w-8 !h-8 !bg-white !border !border-green-200 !text-green-600 hover:!bg-green-50 !rounded-lg !transition-all !cursor-pointer disabled:!opacity-50 !shadow-sm"
                            title="Approve"
                          >
                            {actionLoading === venue._id ? <Loader2 className="!w-4 !h-4 !block !shrink-0 !animate-spin" /> : <Check className="!w-4 !h-4 !block !shrink-0 !opacity-100" />}
                          </button>
                        )}
                        {venue.status !== 'rejected' && (
                          <button
                            onClick={() => handleStatusUpdate(venue._id, 'rejected')}
                            disabled={actionLoading === venue._id}
                            className="!inline-flex !items-center !justify-center !w-8 !h-8 !bg-white !border !border-red-200 !text-red-600 hover:!bg-red-50 !rounded-lg !transition-all !cursor-pointer disabled:!opacity-50 !shadow-sm"
                            title="Reject"
                          >
                            {actionLoading === venue._id ? <Loader2 className="!w-4 !h-4 !block !shrink-0 !animate-spin" /> : <X className="!w-4 !h-4 !block !shrink-0 !opacity-100" />}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(venue._id)}
                          className="!inline-flex !items-center !justify-center !w-8 !h-8 !bg-white !border !border-gray-200 !text-gray-400 hover:!text-red-600 hover:!border-red-200 hover:!bg-red-50 !rounded-lg !transition-all !cursor-pointer !shadow-sm"
                          title="Delete"
                        >
                          <Trash2 className="!w-4 !h-4 !block !shrink-0 !opacity-100" />
                        </button>
                      </div>
                      
                      <Link 
                        href={`/admin/venues/edit?id=${venue._id}`} 
                        className="!inline-flex !items-center !justify-center !gap-1.5 !px-3 !py-1.5 !bg-white !border !border-gray-300 !text-gray-700 !rounded-lg !text-xs !font-bold hover:!bg-gray-50 hover:!text-[#1abc60] hover:!border-[#1abc60]/30 !transition-all !shadow-sm !no-underline"
                      >
                        <Pencil className="!w-3.5 !h-3.5 !block !shrink-0 !opacity-100" />
                        <span className="!block">Edit</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              {filteredVenues.length === 0 && (
                <div className="!px-6 !py-12 !text-center !text-sm !font-medium !text-gray-500">
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