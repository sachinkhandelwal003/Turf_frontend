"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Search, User, MapPin, Phone, Mail, Clock, CheckCircle, XCircle, Loader2, Image as ImageIcon, Trash2, Eye, Building2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/app/services/api';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

interface VenueLead {
  _id: string;
  groundName: string;
  turfName: string;
  location: string;
  ownerName: string;
  contactNumber: string;
  email: string;
  photos: string[];
  status: 'pending' | 'contacted' | 'converted' | 'rejected';
  notes: string;
  createdAt: string;
}

export default function VenueLeadsPage() {
  const { isSuperadmin } = useAuth();
  const [leads, setLeads] = useState<VenueLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState<VenueLead | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (isSuperadmin) {
      fetchLeads();
    }
  }, [isSuperadmin]);

  const fetchLeads = async () => {
    try {
      const res = await api.get('/venue-leads');
      if (res.data.success) {
        setLeads(res.data.leads);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to load venue leads');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (leadId: string, status: string, notes: string = "") => {
    setUpdatingId(leadId);
    try {
      const res = await api.patch(`/venue-leads/${leadId}/status`, { status, notes });
      if (res.data.success) {
        setLeads(leads.map(l => l._id === leadId ? res.data.lead : l));
        toast.success(`Lead marked as ${status}`);
        if (selectedLead?._id === leadId) {
          setSelectedLead(res.data.lead);
        }
      }
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteLead = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This lead will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        const res = await api.delete(`/venue-leads/${id}`);
        if (res.data.success) {
          setLeads(leads.filter(l => l._id !== id));
          toast.success("Lead deleted successfully");
        }
      } catch (error: any) {
        toast.error(error.response?.data?.error || "Failed to delete lead");
      }
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.groundName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '!bg-amber-50 !text-amber-700 !border-amber-200';
      case 'contacted': return '!bg-blue-50 !text-blue-700 !border-blue-200';
      case 'converted': return '!bg-emerald-50 !text-emerald-700 !border-emerald-200';
      case 'rejected': return '!bg-red-50 !text-red-700 !border-red-200';
      default: return '!bg-gray-50 !text-gray-700 !border-gray-200';
    }
  };

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5001';
    return `${baseUrl}${path}`;
  };

  if (!isSuperadmin) {
    return (
      <div className="!flex !items-center !justify-center !min-h-[80vh] !bg-[#f8fafc]">
        <div className="!text-center !bg-white !p-10 !rounded-3xl !shadow-sm !border !border-gray-200 !max-w-md">
          <XCircle className="!w-16 !h-16 !text-red-500 !mx-auto !mb-4" />
          <h1 className="!text-2xl !font-bold !text-gray-900 !mb-2">Access Denied</h1>
          <p className="!text-gray-500 !font-medium">Only Superadmins can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="!w-full !font-sans !bg-white !rounded-[24px] !border !border-slate-200/80 !shadow-sm !p-6 md:!p-8 !space-y-6">
      
      {/* Header Section */}
      <div className="!flex !flex-col md:!flex-row md:!items-center !justify-between !gap-6 !pb-6 !border-b !border-slate-100">
        <div>
          <h1 className="!text-2xl md:!text-3xl !font-bold !text-slate-900 !tracking-tight !m-0 !mb-1.5">Registration Leads</h1>
          <p className="!text-sm !font-medium !text-slate-500 !m-0">Manage ground owner registration enquiries and onboarding</p>
        </div>

        <div className="!flex !flex-wrap !items-center !gap-3">
          <div className="!relative !group">
            <Search className="!absolute !left-3.5 !top-1/2 !-translate-y-1/2 !w-4 !h-4 !text-slate-400 group-focus-within:!text-[#1abc60] !transition-colors" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="!w-full md:!w-64 !pl-10 !pr-4 !py-2.5 !bg-slate-50 hover:!bg-slate-100 !border !border-slate-200 focus:!bg-white focus:!outline-none focus:!ring-1 focus:!ring-[#1abc60] focus:!border-[#1abc60] !rounded-xl !text-sm !font-medium !text-slate-900 !transition-all placeholder:!text-gray-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="!px-4 !py-2.5 !bg-slate-50 hover:!bg-slate-100 !border !border-slate-200 focus:!bg-white focus:!outline-none focus:!ring-1 focus:!ring-[#1abc60] focus:!border-[#1abc60] !rounded-xl !text-sm !font-bold !text-slate-700 !transition-all !cursor-pointer !appearance-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="!flex !flex-col !items-center !justify-center !min-h-[40vh] !gap-4">
          <div className="!w-16 !h-16 !bg-emerald-50 !rounded-2xl !flex !items-center !justify-center !border !border-emerald-100 !shadow-sm">
            <Loader2 className="!w-8 !h-8 !animate-spin !text-[#1abc60]" />
          </div>
          <p className="!text-[11px] !font-bold !text-slate-400 !uppercase !tracking-[0.2em] !animate-pulse">Loading Leads...</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="!border !border-slate-200/60 !rounded-2xl !py-20 !text-center">
           <div className="!w-20 !h-20 !bg-slate-50 !rounded-full !flex !items-center !justify-center !mx-auto !mb-4 !border !border-slate-200">
              <Search className="!w-8 !h-8 !text-slate-400" />
            </div>
            <h3 className="!text-lg !font-bold !text-slate-900 !m-0 !mb-1">No Leads Found</h3>
            <p className="!text-sm !font-medium !text-slate-500 !m-0">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="!border !border-slate-200/60 !rounded-2xl !overflow-hidden">
          <div className="!overflow-x-auto !custom-scrollbar">
            <table className="!w-full !text-left !border-collapse !min-w-[900px]">
              <thead className="!bg-slate-50 !text-slate-500 !text-[10px] !font-black !uppercase !tracking-widest !border-b !border-slate-200">
                <tr>
                  <th className="!px-6 md:!px-8 !py-4">Ground Info</th>
                  <th className="!px-6 md:!px-8 !py-4">Owner Info</th>
                  <th className="!px-6 md:!px-8 !py-4">Contact</th>
                  <th className="!px-6 md:!px-8 !py-4">Location</th>
                  <th className="!px-6 md:!px-8 !py-4">Status</th>
                  <th className="!px-6 md:!px-8 !py-4 !text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="!divide-y !divide-slate-100">
                {filteredLeads.map((lead) => (
                  <tr key={lead._id} className="hover:!bg-slate-50/80 !transition-colors !border-b !border-slate-100 last:!border-0">
                    <td className="!px-6 md:!px-8 !py-4">
                      <div className="!flex !items-center !gap-4 !min-w-0">
                        <div className="!w-10 !h-10 !rounded-xl !overflow-hidden !bg-slate-50 !border !border-slate-200 !shrink-0 !flex !items-center !justify-center text-slate-400">
                          {lead.photos && lead.photos.length > 0 ? (
                            <img src={getImageUrl(lead.photos[0])} alt={lead.groundName} className="!w-full !h-full !object-cover" />
                          ) : (
                            <ImageIcon className="!w-5 !h-5" />
                          )}
                        </div>
                        <div className="!flex !flex-col !min-w-0">
                          <span className="!text-sm !font-bold !text-slate-900 !truncate">{lead.groundName}</span>
                          <span className="!text-xs !font-medium !text-slate-500 !truncate">{lead.turfName}</span>
                        </div>
                      </div>
                    </td>
                    <td className="!px-6 md:!px-8 !py-4">
                      <div className="!flex !flex-col">
                        <span className="!text-sm !font-bold !text-slate-800">{lead.ownerName}</span>
                        <span className="!text-xs !font-medium !text-slate-500">{lead.email}</span>
                      </div>
                    </td>
                    <td className="!px-6 md:!px-8 !py-4">
                      <span className="!text-sm !font-bold !text-slate-600">{lead.contactNumber}</span>
                    </td>
                    <td className="!px-6 md:!px-8 !py-4">
                      <span className="!text-sm !font-bold !text-slate-600">{lead.location}</span>
                    </td>
                    <td className="!px-6 md:!px-8 !py-4">
                      <span className={`!inline-flex !px-2.5 !py-1 !rounded-full !text-[10px] !font-bold !uppercase !tracking-widest !border ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="!px-6 md:!px-8 !py-4 !text-right">
                      <div className="!flex !justify-end !gap-2">
                        <div
                          onClick={() => setSelectedLead(lead)}
                          className="!p-2 !text-slate-400 hover:!text-[#1abc60] hover:!bg-emerald-50 !rounded-lg !transition-colors !border !border-transparent hover:!border-emerald-200 !bg-transparent !cursor-pointer !inline-flex"
                          title="View Details"
                        >
                          <Eye className="!w-4 !h-4" />
                        </div>
                        {lead.status === 'pending' && (
                          <div
                            onClick={() => handleUpdateStatus(lead._id, 'contacted')}
                            className="!p-2 !text-slate-400 hover:!text-blue-600 hover:!bg-blue-50 !rounded-lg !transition-colors !border !border-transparent hover:!border-blue-200 !bg-transparent !cursor-pointer !inline-flex"
                            title="Mark as Contacted"
                          >
                            {updatingId === lead._id ? <Loader2 className="!w-4 !h-4 !animate-spin" /> : <CheckCircle2 className="!w-4 !h-4" />}
                          </div>
                        )}
                        <div
                          onClick={() => handleDeleteLead(lead._id)}
                          className="!p-2 !text-slate-400 hover:!text-red-500 hover:!bg-red-50 !rounded-lg !transition-colors !border !border-transparent hover:!border-red-200 !bg-transparent !cursor-pointer !inline-flex"
                          title="Delete Lead"
                        >
                          <Trash2 className="!w-4 !h-4" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>

      {/* ============================================================== */}
      {/* PREMIUM DETAILS MODAL                                          */}
      {/* ============================================================== */}
      <AnimatePresence>
        {selectedLead && (
          <div className="!fixed !inset-0 !z-[100] !flex !items-center !justify-center !p-4 sm:!p-6 !bg-gray-900/60 !backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="!relative !w-full !max-w-3xl !bg-[#f8fafc] !rounded-[24px] !shadow-2xl !overflow-hidden !flex !flex-col !max-h-[90vh] !border !border-gray-100"
            >
              
              {/* Modal Header */}
              <div className="!px-6 !py-5 !bg-white !border-b !border-gray-200 !flex !justify-between !items-start !shrink-0">
                <div>
                  <div className="!flex !items-center !gap-3 !mb-1.5">
                    <h2 className="!text-2xl !font-bold !text-gray-900 !tracking-tight !m-0">{selectedLead.groundName}</h2>
                    <span className={`!px-2.5 !py-1 !rounded-md !text-[10px] !font-bold !uppercase !tracking-wider !border ${getStatusColor(selectedLead.status)}`}>
                      {selectedLead.status}
                    </span>
                  </div>
                  <p className="!text-sm !font-semibold !text-[#1abc60] !m-0 flex items-center gap-1.5">
                    <Building2 className="!w-4 !h-4" /> {selectedLead.turfName}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="!p-2 !bg-gray-50 hover:!bg-gray-100 !text-gray-400 hover:!text-gray-600 !rounded-full !transition-colors !cursor-pointer !border-none"
                >
                  <XCircle className="!w-6 !h-6" />
                </button>
              </div>

              {/* Modal Body (Scrollable) */}
              <div className="!p-6 md:!p-8 !overflow-y-auto !custom-scrollbar !flex-1 !space-y-6">
                
                {/* Info Cards Grid */}
                <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
                  {/* Owner Info Card */}
                  <div className="!bg-white !p-5 !rounded-2xl !border !border-gray-200 !shadow-sm">
                    <p className="!text-[10px] !font-bold !text-gray-400 !uppercase !tracking-widest !mb-4 !flex !items-center !gap-1.5">
                      <User className="!w-3.5 !h-3.5" /> Owner Details
                    </p>
                    <div className="!space-y-3">
                      <div>
                        <p className="!text-xs !text-gray-500 !font-medium !mb-0.5 !m-0">Full Name</p>
                        <p className="!text-sm !font-bold !text-gray-900 !m-0">{selectedLead.ownerName}</p>
                      </div>
                      <div>
                        <p className="!text-xs !text-gray-500 !font-medium !mb-0.5 !m-0">Email</p>
                        <a href={`mailto:${selectedLead.email}`} className="!text-sm !font-bold !text-[#1abc60] hover:!underline !m-0">{selectedLead.email}</a>
                      </div>
                      <div>
                        <p className="!text-xs !text-gray-500 !font-medium !mb-0.5 !m-0">Phone</p>
                        <a href={`tel:${selectedLead.contactNumber}`} className="!text-sm !font-bold !text-gray-900 hover:!text-[#1abc60] !transition-colors !m-0">{selectedLead.contactNumber}</a>
                      </div>
                    </div>
                  </div>

                  {/* Location & Date Card */}
                  <div className="!bg-white !p-5 !rounded-2xl !border !border-gray-200 !shadow-sm !flex !flex-col !gap-4">
                    <div>
                      <p className="!text-[10px] !font-bold !text-gray-400 !uppercase !tracking-widest !mb-2 !flex !items-center !gap-1.5">
                        <MapPin className="!w-3.5 !h-3.5" /> Location
                      </p>
                      <p className="!text-sm !font-bold !text-gray-900 !m-0 !leading-relaxed">{selectedLead.location}</p>
                    </div>
                    <div className="!w-full !h-[1px] !bg-gray-100"></div>
                    <div>
                      <p className="!text-[10px] !font-bold !text-gray-400 !uppercase !tracking-widest !mb-2 !flex !items-center !gap-1.5">
                        <Clock className="!w-3.5 !h-3.5" /> Submitted On
                      </p>
                      <p className="!text-sm !font-bold !text-gray-900 !m-0">
                        {new Date(selectedLead.createdAt).toLocaleString('en-IN', { 
                          day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Notes (If any) */}
                {selectedLead.notes && (
                  <div className="!bg-white !p-5 !rounded-2xl !border !border-gray-200 !shadow-sm">
                     <p className="!text-[10px] !font-bold !text-gray-400 !uppercase !tracking-widest !mb-3">Admin Notes</p>
                     <p className="!text-sm !font-medium !text-gray-700 !m-0 !whitespace-pre-wrap">{selectedLead.notes}</p>
                  </div>
                )}

                {/* Photos Grid */}
                {selectedLead.photos && selectedLead.photos.length > 0 && (
                  <div>
                    <p className="!text-[10px] !font-bold !text-gray-400 !uppercase !tracking-widest !mb-3 !flex !items-center !gap-1.5">
                      <ImageIcon className="!w-3.5 !h-3.5" /> Ground Photos ({selectedLead.photos.length})
                    </p>
                    <div className="!grid !grid-cols-2 sm:!grid-cols-3 !gap-3">
                      {selectedLead.photos.map((photo, i) => (
                        <a 
                          key={i} 
                          href={getImageUrl(photo)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="!aspect-video !rounded-xl !overflow-hidden !bg-gray-100 !border !border-gray-200 !block !group"
                        >
                          <img 
                            src={getImageUrl(photo)} 
                            alt={`Ground ${i + 1}`} 
                            className="!w-full !h-full !object-cover group-hover:!scale-110 !transition-transform !duration-500" 
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="!px-6 !py-4 !bg-white !border-t !border-gray-200 !flex !flex-col sm:!flex-row !gap-3 !shrink-0">
                <button
                  onClick={() => handleUpdateStatus(selectedLead._id, 'converted')}
                  disabled={updatingId === selectedLead._id || selectedLead.status === 'converted'}
                  className="!flex-1 !flex !items-center !justify-center !gap-2 !py-3 !bg-[#1abc60] !text-white !rounded-xl !text-sm !font-bold hover:!bg-[#17a554] !transition-all !shadow-md !shadow-green-100 disabled:!opacity-50 disabled:!cursor-not-allowed !border-none !cursor-pointer"
                >
                  {updatingId === selectedLead._id && selectedLead.status !== 'converted' ? <Loader2 className="!w-4 !h-4 !animate-spin" /> : <CheckCircle2 className="!w-4 !h-4" />}
                  Approve & Convert
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedLead._id, 'rejected')}
                  disabled={updatingId === selectedLead._id || selectedLead.status === 'rejected'}
                  className="!flex-1 !flex !items-center !justify-center !gap-2 !py-3 !bg-white !text-red-600 !border !border-red-200 !rounded-xl !text-sm !font-bold hover:!bg-red-50 !transition-all disabled:!opacity-50 disabled:!cursor-not-allowed !cursor-pointer"
                >
                  {updatingId === selectedLead._id && selectedLead.status !== 'rejected' ? <Loader2 className="!w-4 !h-4 !animate-spin" /> : <XCircle className="!w-4 !h-4" />}
                  Reject Lead
                </button>
                <button
                  onClick={() => {
                    handleDeleteLead(selectedLead._id);
                    setSelectedLead(null);
                  }}
                  className="!px-4 !py-3 !bg-white !text-gray-400 hover:!text-red-600 !border !border-gray-200 hover:!border-red-200 !rounded-xl !text-sm !font-bold !transition-all !cursor-pointer"
                  title="Delete Lead"
                >
                  <Trash2 className="!w-4 !h-4" />
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}