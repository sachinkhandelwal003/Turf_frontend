"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Search, User, MapPin, Phone, Mail, Clock, CheckCircle, XCircle, Loader2, Image as ImageIcon, Trash2, Eye, Building2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/app/services/api';
import { toast } from 'sonner';

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
    <div className="!min-h-screen !bg-[#f8fafc] !p-4 md:!p-6 lg:!p-8 !font-sans">
      <div className="!max-w-[1600px] !mx-auto">
        
        {/* Header Section */}
        <div className="!flex !flex-col md:!flex-row md:!items-center !justify-between !gap-6 !mb-8 !bg-white !p-6 !rounded-[24px] !border !border-gray-100 !shadow-sm">
          <div>
            <h1 className="!text-2xl md:!text-3xl !font-bold !text-gray-900 !tracking-tight !m-0 !mb-1">Registration Leads</h1>
            <p className="!text-sm !font-medium !text-gray-500 !m-0">Manage ground owner registration enquiries and onboarding</p>
          </div>

          <div className="!flex !flex-wrap !items-center !gap-3">
            <div className="!relative !group">
              <Search className="!absolute !left-3.5 !top-1/2 !-translate-y-1/2 !w-4 !h-4 !text-gray-400 group-focus-within:!text-[#1abc60] !transition-colors" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="!w-full md:!w-64 !pl-10 !pr-4 !py-2.5 !bg-gray-50 hover:!bg-gray-100 !border !border-gray-200 focus:!bg-white focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !rounded-xl !text-sm !font-medium !text-gray-900 !transition-all placeholder:!text-gray-400"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="!px-4 !py-2.5 !bg-gray-50 hover:!bg-gray-100 !border !border-gray-200 focus:!bg-white focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !rounded-xl !text-sm !font-bold !text-gray-700 !transition-all !cursor-pointer !appearance-none"
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
          <div className="!flex !flex-col !items-center !justify-center !min-h-[50vh] !gap-4">
            <div className="!w-16 !h-16 !bg-emerald-50 !rounded-2xl !flex !items-center !justify-center !border !border-emerald-100 !shadow-sm">
              <Loader2 className="!w-8 !h-8 !animate-spin !text-[#1abc60]" />
            </div>
            <p className="!text-[11px] !font-bold !text-gray-400 !uppercase !tracking-[0.2em] !animate-pulse">Loading Leads...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="!bg-white !rounded-[24px] !border !border-gray-200 !py-20 !text-center !shadow-sm">
             <div className="!w-20 !h-20 !bg-gray-50 !rounded-full !flex !items-center !justify-center !mx-auto !mb-4 !border !border-gray-100">
                <Search className="!w-8 !h-8 !text-gray-300" />
              </div>
              <h3 className="!text-lg !font-bold !text-gray-900 !m-0 !mb-1">No Leads Found</h3>
              <p className="!text-sm !font-medium !text-gray-500 !m-0">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="!grid !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-3 xl:!grid-cols-4 !gap-6">
            <AnimatePresence mode='popLayout'>
              {filteredLeads.map((lead) => (
                <motion.div
                  key={lead._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="!bg-white !rounded-[20px] !border !border-gray-200 !shadow-sm hover:!shadow-lg hover:!border-[#1abc60]/30 !transition-all !group !flex !flex-col !overflow-hidden"
                >
                  {/* Card Image Area */}
                  <div className="!relative !h-48 !bg-gray-100 !overflow-hidden !shrink-0">
                    {lead.photos && lead.photos.length > 0 ? (
                      <img 
                        src={getImageUrl(lead.photos[0])} 
                        alt={lead.groundName}
                        className="!w-full !h-full !object-cover group-hover:!scale-105 !transition-transform !duration-700"
                      />
                    ) : (
                      <div className="!w-full !h-full !flex !items-center !justify-center !bg-gray-50 !text-gray-300">
                        <ImageIcon className="!w-12 !h-12" />
                      </div>
                    )}
                    {/* Dark gradient for badge readability */}
                    <div className="!absolute !inset-0 !bg-gradient-to-b !from-gray-900/60 !via-transparent !to-transparent"></div>
                    <div className={`!absolute !top-4 !right-4 !px-2.5 !py-1 !rounded-md !text-[10px] !font-bold !uppercase !tracking-wider !border ${getStatusColor(lead.status)} !shadow-sm`}>
                      {lead.status}
                    </div>
                  </div>

                  {/* Card Content Area */}
                  <div className="!p-5 !flex !flex-col !flex-1">
                    <div className="!mb-4">
                      <h3 className="!text-lg !font-bold !text-gray-900 !truncate !m-0 !leading-tight group-hover:!text-[#1abc60] !transition-colors">{lead.groundName}</h3>
                      <p className="!text-xs !font-semibold !text-gray-500 !truncate !mt-1 !m-0">{lead.turfName}</p>
                    </div>

                    <div className="!space-y-2.5 !mb-6 !flex-1">
                      <div className="!flex !items-center !gap-2.5 !text-sm !font-medium !text-gray-600">
                        <User className="!w-4 !h-4 !text-gray-400 !shrink-0" />
                        <span className="!truncate">{lead.ownerName}</span>
                      </div>
                      <div className="!flex !items-center !gap-2.5 !text-sm !font-medium !text-gray-600">
                        <MapPin className="!w-4 !h-4 !text-gray-400 !shrink-0" />
                        <span className="!truncate">{lead.location}</span>
                      </div>
                      <div className="!flex !items-center !gap-2.5 !text-sm !font-medium !text-gray-600">
                        <Phone className="!w-4 !h-4 !text-gray-400 !shrink-0" />
                        <span className="!truncate">{lead.contactNumber}</span>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="!flex !items-center !gap-2 !pt-4 !border-t !border-gray-100 !shrink-0">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="!flex-1 !flex !items-center !justify-center !gap-2 !py-2.5 !bg-white !border !border-gray-200 !text-gray-700 !rounded-xl !text-xs !font-bold hover:!bg-gray-50 hover:!text-gray-900 !transition-colors !cursor-pointer !shadow-sm"
                      >
                        <Eye className="!w-4 !h-4" /> Details
                      </button>
                      
                      {lead.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(lead._id, 'contacted')}
                          disabled={updatingId === lead._id}
                          className="!px-4 !py-2.5 !bg-[#1abc60]/10 !text-[#1abc60] hover:!bg-[#1abc60] hover:!text-white !rounded-xl !transition-all disabled:!opacity-50 !cursor-pointer !border-none !flex !items-center !justify-center"
                          title="Mark as Contacted"
                        >
                          {updatingId === lead._id ? <Loader2 className="!w-4 !h-4 !animate-spin" /> : <CheckCircle2 className="!w-4 !h-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
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
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}