"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, Mail, Phone, MapPin, Calendar, CheckCircle, 
  Trash2, Search, ArrowLeft, Loader2, IndianRupee, Home, 
  Building, Send, X, Inbox, User, Tag, Clock, Edit3, 
  AlertCircle, MessageSquare, Layers
} from 'lucide-react';
import Link from 'next/link';

interface Estimate {
  _id: string;
  customerName: string;
  email: string;
  phone?: string;
  projectType: string;
  projectSubtype?: string;
  builtUpArea: number;
  areaUnit: string;
  numberOfFloors: number;
  qualityLevel: string;
  features: string[];
  city?: string;
  location?: string;
  customerBudget?: string;
  calculatedEstimate?: {
    baseCost: number;
    featureCost: number;
    qualityMultiplier: number;
    totalEstimate: number;
    breakdown: {
      construction: number;
      materials: number;
      labor: number;
      features: number;
      other: number;
    };
  };
  status: 'new' | 'contacted' | 'negotiating' | 'approved' | 'rejected' | 'converted';
  adminNotes?: string;
  createdAt: string;
}

export default function AdminEstimatesPage() {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  // Email Modal State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  // Global Alert State
  const [alert, setAlert] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const showAlert = (type: 'success' | 'error', text: string) => {
    setAlert({ type, text });
    setTimeout(() => setAlert(null), 4000);
  };

  useEffect(() => {
    fetchEstimates();
  }, [statusFilter]);

  const fetchEstimates = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const query = statusFilter ? `?status=${statusFilter}` : '';
      const response = await fetch(`${API_URL}/api/estimate${query}`);
      const data = await response.json();
      if (data.success) {
        setEstimates(data.data);
        if (selectedEstimate) {
          const updated = data.data.find((e: Estimate) => e._id === selectedEstimate._id);
          if (updated) setSelectedEstimate(updated);
        }
      }
    } catch (error) {
      console.error('Error fetching estimates:', error);
      showAlert('error', 'Failed to load estimates.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string, adminNotes?: string) => {
    setUpdating(id);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/estimate/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes })
      });
      const data = await response.json();
      if (data.success) {
        const updatedEstimate = { ...estimates.find(e => e._id === id)!, status: status as any, adminNotes };
        setEstimates(estimates.map(e => e._id === id ? updatedEstimate : e));
        if (selectedEstimate?._id === id) setSelectedEstimate(updatedEstimate);
        showAlert('success', 'Estimate updated successfully.');
      }
    } catch (error) {
      console.error('Error updating estimate:', error);
      showAlert('error', 'Failed to update estimate.');
    } finally {
      setUpdating(null);
    }
  };

  const deleteEstimate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this estimate? This cannot be undone.')) return;
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/estimate/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        setEstimates(estimates.filter(e => e._id !== id));
        if (selectedEstimate?._id === id) setSelectedEstimate(null);
        showAlert('success', 'Estimate deleted successfully.');
      }
    } catch (error) {
      console.error('Error deleting estimate:', error);
      showAlert('error', 'Failed to delete estimate.');
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEstimate || !emailSubject || !emailMessage) return;

    setSendingEmail(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      // Assuming you use the same generic send-email endpoint, otherwise adjust URL
      const response = await fetch(`${API_URL}/api/estimate/${selectedEstimate._id}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: emailSubject,
          message: emailMessage
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showAlert('success', `Email sent to ${selectedEstimate.email}`);
        setEmailSubject('');
        setEmailMessage('');
        setShowEmailModal(false);
      } else {
        showAlert('error', data.message || 'Failed to send email.');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      showAlert('error', 'An error occurred while sending the email.');
    } finally {
      setSendingEmail(false);
    }
  };

  const filteredEstimates = estimates.filter(estimate => 
    estimate.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    estimate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    estimate.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'new': 'bg-blue-50 text-blue-700 border-blue-200',
      'contacted': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'negotiating': 'bg-orange-50 text-orange-700 border-orange-200',
      'approved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'rejected': 'bg-red-50 text-red-700 border-red-200',
      'converted': 'bg-indigo-50 text-indigo-700 border-indigo-200'
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status] || styles['new']}`}>
        {status}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-[#a68a6b] mb-4" />
        <p className="text-zinc-500 uppercase tracking-widest text-sm font-semibold">Loading Estimates...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12">
      
      {/* Global Floating Alert */}
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-6 left-1/2 z-[100] px-6 py-3 rounded-full shadow-xl flex items-center gap-3 font-medium text-sm border ${
              alert.type === 'success' ? 'bg-white border-green-200 text-green-800' : 'bg-white border-red-200 text-red-800'
            }`}
          >
            {alert.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
            {alert.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between h-auto sm:h-20 py-4 sm:py-0 gap-4">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="p-2 -ml-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Estimate Requests</h1>
                <p className="text-xs text-gray-500 mt-0.5">Manage calculator leads and quotes.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#a68a6b] focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-all"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-2 pl-3 pr-8 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#a68a6b] outline-none bg-gray-50 cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="negotiating">Negotiating</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="converted">Converted</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Estimate List */}
          <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-[calc(100vh-140px)] flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Inbox</h2>
              <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{filteredEstimates.length}</span>
            </div>
            
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {filteredEstimates.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Inbox className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-900 font-medium">No estimates found</p>
                  <p className="text-sm text-gray-500 mt-1">Adjust your filters or search query.</p>
                </div>
              ) : (
                filteredEstimates.map((estimate) => (
                  <div
                    key={estimate._id}
                    onClick={() => setSelectedEstimate(estimate)}
                    className={`p-5 border-b border-gray-100 cursor-pointer transition-all ${
                      selectedEstimate?._id === estimate._id 
                        ? 'bg-blue-50/50 border-l-4 border-l-blue-500' 
                        : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className="font-bold text-gray-900 truncate">{estimate.customerName}</h3>
                      {getStatusBadge(estimate.status)}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      {estimate.projectType === 'residential' ? <Home className="w-3.5 h-3.5" /> : <Building className="w-3.5 h-3.5" />}
                      {estimate.projectType} • {estimate.builtUpArea} sq.ft
                    </div>
                    
                    {estimate.calculatedEstimate && (
                      <p className="text-[#a68a6b] font-bold text-sm mb-3">
                        {formatCurrency(estimate.calculatedEstimate.totalEstimate)}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(estimate.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteEstimate(estimate._id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete Estimate"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Detail Panel */}
          <div className="lg:col-span-7 xl:col-span-8">
            {selectedEstimate ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                key={selectedEstimate._id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
              >
                {/* Detail Header */}
                <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold">
                      {selectedEstimate.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedEstimate.customerName}</h2>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Mail className="w-3.5 h-3.5" /> {selectedEstimate.email}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowEmailModal(true)}
                    className="w-full sm:w-auto bg-slate-900 hover:bg-[#a68a6b] text-white px-5 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    Email Quote
                  </button>
                </div>
                
                {/* Detail Body */}
                <div className="p-6 md:p-8 h-[calc(100vh-270px)] overflow-y-auto custom-scrollbar">
                  
                  {/* Meta Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Phone</p>
                      <p className="text-sm font-medium text-gray-900">{selectedEstimate.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Date</p>
                      <p className="text-sm font-medium text-gray-900">{new Date(selectedEstimate.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Location</p>
                      <p className="text-sm font-medium text-gray-900">{selectedEstimate.city || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Client Budget</p>
                      <p className="text-sm font-medium text-gray-900">{selectedEstimate.customerBudget || 'Not specified'}</p>
                    </div>
                  </div>

                  {/* Project Specs */}
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Layers className="w-5 h-5 text-[#a68a6b]"/> Project Specifications</h3>
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="block text-gray-500 mb-1">Type</span>
                        <span className="font-semibold text-gray-900 capitalize">{selectedEstimate.projectType}</span>
                      </div>
                      <div>
                        <span className="block text-gray-500 mb-1">Total Area</span>
                        <span className="font-semibold text-gray-900">{selectedEstimate.builtUpArea} {selectedEstimate.areaUnit}</span>
                      </div>
                      <div>
                        <span className="block text-gray-500 mb-1">Floors</span>
                        <span className="font-semibold text-gray-900">{selectedEstimate.numberOfFloors}</span>
                      </div>
                      <div>
                        <span className="block text-gray-500 mb-1">Quality Level</span>
                        <span className="font-semibold text-gray-900 capitalize">{selectedEstimate.qualityLevel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  {selectedEstimate.calculatedEstimate && (
                    <div className="mb-8">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Calculator className="w-5 h-5 text-[#a68a6b]"/> Estimated Cost Breakdown</h3>
                      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="p-4 flex justify-between items-center border-b border-gray-100 hover:bg-gray-50">
                          <span className="text-gray-600 font-medium">Construction & Core</span>
                          <span className="font-bold text-gray-900">{formatCurrency(selectedEstimate.calculatedEstimate.breakdown.construction)}</span>
                        </div>
                        <div className="p-4 flex justify-between items-center border-b border-gray-100 hover:bg-gray-50">
                          <span className="text-gray-600 font-medium">Materials & Finishes</span>
                          <span className="font-bold text-gray-900">{formatCurrency(selectedEstimate.calculatedEstimate.breakdown.materials)}</span>
                        </div>
                        <div className="p-4 flex justify-between items-center border-b border-gray-100 hover:bg-gray-50">
                          <span className="text-gray-600 font-medium">Labor & Management</span>
                          <span className="font-bold text-gray-900">{formatCurrency(selectedEstimate.calculatedEstimate.breakdown.labor)}</span>
                        </div>
                        <div className="p-4 flex justify-between items-center border-b border-gray-100 hover:bg-gray-50">
                          <span className="text-gray-600 font-medium">Premium Features</span>
                          <span className="font-bold text-gray-900">{formatCurrency(selectedEstimate.calculatedEstimate.breakdown.features)}</span>
                        </div>
                        <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
                          <span className="font-bold uppercase tracking-wider text-sm">Total Estimated Value</span>
                          <span className="text-xl font-bold text-[#a68a6b]">
                            {formatCurrency(selectedEstimate.calculatedEstimate.totalEstimate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Features List */}
                  {selectedEstimate.features && selectedEstimate.features.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-sm font-bold text-gray-900 mb-3">Requested Features</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedEstimate.features.map(f => (
                          <span key={f} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium border border-gray-200">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Admin Controls */}
                  <div className="border-t border-gray-100 pt-8 grid md:grid-cols-2 gap-8">
                    <div>
                      <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-3">
                        <Tag className="w-3.5 h-3.5" /> Pipeline Status
                      </label>
                      <div className="relative">
                        <select
                          value={selectedEstimate.status}
                          onChange={(e) => updateStatus(selectedEstimate._id, e.target.value, selectedEstimate.adminNotes)}
                          disabled={updating === selectedEstimate._id}
                          className="w-full appearance-none bg-white border border-gray-300 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#a68a6b] cursor-pointer disabled:opacity-50"
                        >
                          <option value="new">🆕 New</option>
                          <option value="contacted">📞 Contacted</option>
                          <option value="negotiating">🤝 Negotiating</option>
                          <option value="approved">✅ Approved</option>
                          <option value="rejected">❌ Rejected</option>
                          <option value="converted">🏆 Converted</option>
                        </select>
                        {updating === selectedEstimate._id && (
                          <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-3">
                        <Edit3 className="w-3.5 h-3.5" /> Internal Notes
                      </label>
                      <textarea
                        value={selectedEstimate.adminNotes || ''}
                        onChange={(e) => {
                          const updated = { ...selectedEstimate, adminNotes: e.target.value };
                          setSelectedEstimate(updated);
                        }}
                        onBlur={(e) => updateStatus(selectedEstimate._id, selectedEstimate.status, e.target.value)}
                        placeholder="Add private notes about this quote..."
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#a68a6b] resize-none"
                        rows={3}
                      />
                      <p className="text-[10px] text-gray-400 mt-1 flex justify-end">Saves automatically on click away</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm h-[calc(100vh-140px)] flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <Calculator className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Estimate Selected</h3>
                <p className="text-gray-500 max-w-sm">
                  Select an estimate request from the inbox list on the left to view their full quote breakdown, update their status, or reply.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- EMAIL MODAL --- */}
      <AnimatePresence>
        {showEmailModal && selectedEstimate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowEmailModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-900">Compose Email Quote</h3>
                <button onClick={() => setShowEmailModal(false)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSendEmail} className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">To</label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{selectedEstimate.customerName}</span>
                    <span className="text-gray-400">&lt;{selectedEstimate.email}&gt;</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a68a6b] text-sm"
                    placeholder="Your Architecture Quote - [Project Name]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Message</label>
                  <textarea
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    required
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a68a6b] text-sm resize-none"
                    placeholder={`Hi ${selectedEstimate.customerName},\n\nThank you for reaching out regarding your ${selectedEstimate.projectType} project. Based on your inputs, the estimated cost is ${selectedEstimate.calculatedEstimate ? formatCurrency(selectedEstimate.calculatedEstimate.totalEstimate) : 'TBD'}.\n\nLet's schedule a call to discuss this further...`}
                  />
                </div>

                <div className="pt-4 flex gap-3 justify-end border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowEmailModal(false)}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingEmail}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-[#a68a6b] text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                  >
                    {sendingEmail ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                    ) : (
                      <><Send className="w-4 h-4" /> Send Email</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}