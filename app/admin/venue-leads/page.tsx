"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Search, User, MapPin, Phone, Mail, Clock, CheckCircle, XCircle, Loader2, Image as ImageIcon, Trash2, Eye } from 'lucide-react';
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
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'contacted': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'converted': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
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
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-500">Only Superadmins can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Admin Registration Leads</h1>
          <p className="text-slate-500 font-medium">Manage ground owner registration enquiries</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1abc60] outline-none w-64 transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#1abc60] transition-all"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-[40vh] gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-[#1abc60]" />
          <p className="text-slate-500 font-bold animate-pulse">Loading leads...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode='popLayout'>
            {filteredLeads.map((lead) => (
              <motion.div
                key={lead._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#1abc60]/30 transition-all group overflow-hidden"
              >
                <div className="relative h-48 bg-slate-100">
                  {lead.photos && lead.photos.length > 0 ? (
                    <img 
                      src={getImageUrl(lead.photos[0])} 
                      alt={lead.groundName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                  )}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(lead.status)}`}>
                    {lead.status}
                  </div>
                </div>

                <div className="p-5">
                  <div className="mb-4">
                    <h3 className="text-lg font-black text-slate-900 truncate uppercase tracking-tight">{lead.groundName}</h3>
                    <p className="text-xs font-bold text-[#1abc60] uppercase tracking-wider">{lead.turfName}</p>
                  </div>

                  <div className="space-y-2.5 mb-6">
                    <div className="flex items-center gap-2 text-slate-600">
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium truncate">{lead.ownerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm font-medium truncate">{lead.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm font-medium">{lead.contactNumber}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedLead(lead)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors"
                    >
                      <Eye className="w-4 h-4" /> View Details
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(lead._id, 'contacted')}
                      disabled={updatingId === lead._id || lead.status === 'contacted'}
                      className="p-2.5 bg-[#1abc60]/10 text-[#1abc60] rounded-xl hover:bg-[#1abc60] hover:text-white transition-all disabled:opacity-50"
                      title="Mark as Contacted"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLead(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 sm:p-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{selectedLead.groundName}</h2>
                    <p className="text-[#1abc60] font-bold uppercase tracking-widest">{selectedLead.turfName}</p>
                  </div>
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <XCircle className="w-6 h-6 text-slate-400" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Owner Information</p>
                      <p className="text-sm font-bold text-slate-900">{selectedLead.ownerName}</p>
                      <p className="text-xs font-medium text-slate-500">{selectedLead.email}</p>
                      <p className="text-xs font-medium text-slate-500">{selectedLead.contactNumber}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</p>
                      <p className="text-sm font-bold text-slate-900">{selectedLead.location}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Received On</p>
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                        <Clock className="w-4 h-4 text-[#1abc60]" />
                        {new Date(selectedLead.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ground Photos</p>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedLead.photos.map((photo, i) => (
                        <div key={i} className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
                          <img src={getImageUrl(photo)} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-6 border-t border-slate-100">
                  <button
                    onClick={() => handleUpdateStatus(selectedLead._id, 'converted')}
                    disabled={updatingId === selectedLead._id}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#1abc60] text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#169c4e] transition-all shadow-lg shadow-[#1abc60]/20 disabled:opacity-50"
                  >
                    Mark as Converted
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedLead._id, 'rejected')}
                    disabled={updatingId === selectedLead._id}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-red-50 text-red-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-600 hover:text-white transition-all border border-red-100 disabled:opacity-50"
                  >
                    Reject Lead
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
