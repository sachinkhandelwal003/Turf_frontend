"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  Trophy, 
  Search, 
  Users, 
  Loader2,
  FileText,
  Eye,
  Download,
  Printer,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import api from '@/app/services/api';
import { toast } from 'sonner';
import { useAuth } from '@/app/context/AuthContext';
import Image from 'next/image';

interface Registration {
  _id: string;
  name: string;
  captain: string;
  email?: string;
  contact: string;
  altContact?: string;
  address?: string;
  status: string;
  registeredAt: string;
  tournamentTitle: string;
  tournamentId: string;
  paymentDetails?: {
    paymentId: string;
    paymentMethod: string;
    amount: number;
    paidAt?: string;
  };
}

export default function TournamentRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tournaments/registrations/all');
      if (res.data.success) {
        setRegistrations(res.data.registrations);
      }
    } catch (error) {
      toast.error('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const filteredRegistrations = registrations.filter(reg => 
    reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.captain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.tournamentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.contact.includes(searchTerm)
  );

  const handlePrint = () => {
    const printContent = invoiceRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'height=800,width=800');
    if (!printWindow) return;

    printWindow.document.write('<html><head><title>Registration Invoice</title>');
    printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">');
    printWindow.document.write('</head><body >');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    
    // Give time for CSS to load
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1abc60]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tournament Registrations</h1>
          <p className="text-gray-500 text-sm mt-1">View and manage all team registrations across tournaments</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#1abc60]/10 text-[#1abc60] px-4 py-2 rounded-lg flex items-center gap-2 font-semibold">
            <Users className="w-4 h-4" />
            {registrations.length} Total Registrations
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative group flex items-center bg-gray-50 border border-gray-300 rounded-lg focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1abc60]/20 focus-within:border-[#1abc60] transition-all">
          <div className="pl-4 pr-2 text-gray-400 group-focus-within:text-[#1abc60]">
            <Search className="w-4 h-4" />
          </div>
          <input 
            type="text"
            placeholder="Search by team, captain, tournament or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="!w-full !px-3 !py-2.5 !bg-transparent !outline-none !transition-all !text-sm !text-gray-700 placeholder:!text-gray-400 !border-none focus:!ring-0"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Team & Tournament</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Captain Details</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRegistrations.length > 0 ? (
                filteredRegistrations.map((reg) => (
                  <tr key={`${reg.tournamentId}-${reg._id}`} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-sm group-hover:text-[#1abc60] transition-colors">{reg.name}</span>
                        <span className="text-xs text-[#1abc60] font-semibold mt-0.5 flex items-center gap-1">
                          <Trophy className="w-3 h-3" />
                          {reg.tournamentTitle}
                        </span>
                        <span className="text-[10px] text-gray-400 mt-1 font-medium">
                          Reg on: {new Date(reg.registeredAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800 text-sm">{reg.captain}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {reg.contact}</span>
                          {reg.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {reg.email}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(reg.status)}`}>
                        {reg.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {reg.paymentDetails ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-gray-900">₹{reg.paymentDetails.amount.toLocaleString()}</span>
                          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">{reg.paymentDetails.paymentMethod}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 font-bold italic">No payment info</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => {
                            setSelectedReg(reg);
                            setShowInvoice(true);
                          }}
                          className="p-2 text-[#1abc60] hover:bg-[#1abc60]/10 rounded-lg transition-colors title='View Invoice'"
                        >
                          <FileText className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">
                    No registrations found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoice && selectedReg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#1abc60]" />
                Registration Invoice
              </h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrint}
                  className="!p-2 !text-gray-600 hover:!bg-gray-200 !rounded-lg !transition-colors"
                  title="Print Invoice"
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setShowInvoice(false)}
                  className="!p-2 !text-gray-400 hover:!text-gray-600 !rounded-lg !transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30" ref={invoiceRef}>
              <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
                {/* Invoice Header */}
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-10 h-10 bg-[#1abc60] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#1abc60]/20">
                        <Trophy className="w-6 h-6" />
                      </div>
                      <span className="text-2xl font-black text-gray-900 tracking-tighter uppercase">TURF<span className="text-[#1abc60]">HERO</span></span>
                    </div>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                      123 Sports Complex, Active Street<br />
                      Bangalore, Karnataka 560001<br />
                      Contact: +91 800-TURF-NOW
                    </p>
                  </div>
                  <div className="text-right">
                    <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter mb-2">INVOICE</h1>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Invoice Number</p>
                      <p className="text-sm font-black text-gray-900">#{selectedReg.paymentDetails?.paymentId?.slice(-8) || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-10" />

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-12 mb-12">
                  <div>
                    <h3 className="text-[10px] font-black text-[#1abc60] uppercase tracking-[0.2em] mb-4">Registered Team</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xl font-black text-gray-900">{selectedReg.name}</p>
                        <p className="text-sm font-bold text-[#1abc60]">{selectedReg.tournamentTitle}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                        <Calendar className="w-4 h-4 text-gray-300" />
                        <span>Reg Date: {new Date(selectedReg.registeredAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black text-[#1abc60] uppercase tracking-[0.2em] mb-4">Captain Details</h3>
                    <div className="space-y-3">
                      <p className="text-lg font-black text-gray-900">{selectedReg.captain}</p>
                      <div className="space-y-2 text-sm text-gray-500 font-medium">
                        <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-300" /> {selectedReg.contact}</p>
                        {selectedReg.email && <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-300" /> {selectedReg.email}</p>}
                        {selectedReg.address && (
                          <p className="flex items-start gap-2"><MapPin className="w-4 h-4 text-gray-300 mt-1 shrink-0" /> {selectedReg.address}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary Table */}
                <div className="rounded-2xl border border-gray-100 overflow-hidden mb-10">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      <tr>
                        <td className="px-6 py-6">
                          <p className="font-bold text-gray-900">Tournament Entry Fee</p>
                          <p className="text-xs text-gray-500 mt-1">{selectedReg.tournamentTitle} - Registration</p>
                        </td>
                        <td className="px-6 py-6 text-right font-black text-gray-900">
                          ₹{(selectedReg.paymentDetails?.amount || 0).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end mb-12">
                  <div className="w-64 space-y-4">
                    <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                      <span>Subtotal</span>
                      <span>₹{(selectedReg.paymentDetails?.amount || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                      <span>Taxes (GST 0%)</span>
                      <span>₹0</span>
                    </div>
                    <div className="h-px bg-gray-100" />
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-black text-gray-900 uppercase tracking-tighter">Total Amount</span>
                      <span className="text-2xl font-black text-[#1abc60]">₹{(selectedReg.paymentDetails?.amount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Footer */}
                <div className="bg-[#fcfcfd] rounded-2xl p-6 border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#1abc60] shadow-sm border border-gray-100">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Payment Method</p>
                      <p className="text-sm font-black text-gray-900 uppercase">{selectedReg.paymentDetails?.paymentMethod || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-[#1abc60] text-white px-6 py-3 rounded-xl shadow-lg shadow-[#1abc60]/20">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-widest">Payment Verified</span>
                  </div>
                </div>

                <div className="mt-12 text-center">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em]">Thank you for choosing TurfHero</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
