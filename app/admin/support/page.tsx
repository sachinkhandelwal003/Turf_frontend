'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import api from '@/app/services/api';
import { toast } from 'sonner';
import { 
  Mail, Shield, Search, Loader2, MessageSquare, Check, Clock, User, FileText, ChevronRight, X
} from 'lucide-react';

interface SupportTicket {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'resolved';
  createdAt: string;
}

export default function SupportTicketsPage() {
  const { isSuperadmin } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/support');
      if (res.data.success) {
        setTickets(res.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to fetch support tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperadmin) {
      fetchTickets();
    }
  }, [isSuperadmin]);

  const handleResolve = async (ticketId: string) => {
    setResolvingId(ticketId);
    try {
      const res = await api.put(`/support/${ticketId}/resolve`);
      if (res.data.success) {
        toast.success('Ticket marked as resolved');
        setTickets(prev => prev.map(t => t._id === ticketId ? { ...t, status: 'resolved' } : t));
        if (selectedTicket?._id === ticketId) {
          setSelectedTicket(prev => prev ? { ...prev, status: 'resolved' } : null);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to resolve ticket');
    } finally {
      setResolvingId(null);
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isSuperadmin) {
    return (
      <div className="!w-full !font-sans !bg-white !rounded-[24px] !border !border-slate-200/80 !shadow-sm !p-6 md:!p-8 !flex !items-center !justify-center !min-h-[400px]">
        <div className="!text-center !max-w-md !w-full">
          <div className="!w-20 !h-20 !bg-red-50 !rounded-full !flex !items-center !justify-center !mx-auto !mb-6 !border !border-red-100">
            <Shield className="!w-10 !h-10 !text-red-500" />
          </div>
          <h1 className="!text-2xl !font-bold !text-slate-900 !tracking-tight !mb-2 !m-0">Access Denied</h1>
          <p className="!text-slate-500 !text-sm !font-medium !m-0">Only Super Admins possess the clearance to view support tickets.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="!w-full !font-sans !bg-white !rounded-[24px] !border !border-slate-200/80 !shadow-sm !p-6 md:!p-8">
      {/* Header */}
      <div className="!flex !flex-col md:!flex-row !justify-between !items-start md:!items-center !gap-4 !mb-8">
        <div>
          <h1 className="!text-2xl !font-bold !text-slate-900 !tracking-tight !mb-1.5 !m-0">Contact Support Tickets</h1>
          <p className="!text-slate-500 !text-sm !font-medium !m-0">Manage and resolve user queries submitted via the contact support form.</p>
        </div>
        <div className="!flex !items-center !gap-3 !w-full md:!w-auto">
          <div className="!relative !flex-1 md:!w-72">
            <Search className="!absolute !left-3.5 !top-1/2 -!translate-y-1/2 !w-4 !h-4 !text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, subject..."
              className="!w-full !pl-10 !pr-4 !py-2.5 !bg-slate-50 hover:!bg-slate-100/70 focus:!bg-white !border !border-slate-200 focus:!border-emerald-500 !rounded-xl !text-sm focus:!outline-none !transition-all"
            />
          </div>
        </div>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="!flex !items-center !justify-center !min-h-[300px]">
          <Loader2 className="!w-8 !h-8 !animate-spin !text-emerald-500" />
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="!flex !flex-col !items-center !justify-center !min-h-[300px] !text-center !p-6">
          <div className="!w-16 !h-16 !bg-slate-50 !rounded-2xl !flex !items-center !justify-center !mb-4">
            <MessageSquare className="!w-8 !h-8 !text-slate-400" />
          </div>
          <h3 className="!text-lg !font-bold !text-slate-800 !mb-1 !m-0">No tickets found</h3>
          <p className="!text-slate-500 !text-sm !m-0">No contact queries matched your search parameters.</p>
        </div>
      ) : (
        <div className="!overflow-x-auto">
          <table className="!w-full !border-collapse !text-left">
            <thead>
              <tr className="!border-b !border-slate-100 !text-slate-400 !text-xs !font-bold !uppercase !tracking-wider">
                <th className="!pb-4 !px-4">User</th>
                <th className="!pb-4 !px-4">Subject</th>
                <th className="!pb-4 !px-4">Date</th>
                <th className="!pb-4 !px-4">Status</th>
                <th className="!pb-4 !px-4 !text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="!divide-y !divide-slate-50">
              {filteredTickets.map((ticket) => (
                <tr key={ticket._id} className="hover:!bg-slate-50/50 !transition-colors">
                  <td className="!py-4 !px-4">
                    <div className="!flex !items-center !gap-3">
                      <div className="!w-10 !h-10 !bg-emerald-50 !text-emerald-600 !rounded-full !flex !items-center !justify-center !font-bold !text-sm">
                        {ticket.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="!text-sm !font-bold !text-slate-800">{ticket.name}</div>
                        <div className="!text-xs !text-slate-400">{ticket.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="!py-4 !px-4 !max-w-xs !truncate">
                    <span className="!text-sm !font-semibold !text-slate-700">{ticket.subject}</span>
                  </td>
                  <td className="!py-4 !px-4">
                    <span className="!text-xs !text-slate-500">
                      {new Date(ticket.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </td>
                  <td className="!py-4 !px-4">
                    <span className={`!inline-flex !items-center !gap-1 !px-2.5 !py-1 !rounded-full !text-xs !font-bold ${
                      ticket.status === 'resolved' 
                        ? '!bg-green-50 !text-green-600' 
                        : '!bg-amber-50 !text-amber-600'
                    }`}>
                      {ticket.status === 'resolved' ? (
                        <>
                          <Check className="!w-3 !h-3" /> Resolved
                        </>
                      ) : (
                        <>
                          <Clock className="!w-3 !h-3" /> Pending
                        </>
                      )}
                    </span>
                  </td>
                  <td className="!py-4 !px-4 !text-right">
                    <div className="!flex !items-center !justify-end !gap-2">
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="!px-3 !py-1.5 !bg-slate-100 hover:!bg-slate-200 !text-slate-700 !rounded-lg !text-xs !font-bold !cursor-pointer !transition-colors !border-none"
                      >
                        View Details
                      </button>
                      {ticket.status === 'pending' && (
                        <button
                          disabled={resolvingId === ticket._id}
                          onClick={() => handleResolve(ticket._id)}
                          className="!p-1.5 !bg-green-50 hover:!bg-green-100 !text-green-600 !rounded-lg !cursor-pointer !transition-all !border-none disabled:!opacity-50"
                          title="Mark Resolved"
                        >
                          {resolvingId === ticket._id ? (
                            <Loader2 className="!w-4 !h-4 !animate-spin" />
                          ) : (
                            <Check className="!w-4 !h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="!fixed !inset-0 !bg-black/60 !backdrop-blur-sm !flex !items-center !justify-center !z-50 !p-4">
          <div className="!bg-white !rounded-[24px] !shadow-xl !max-w-xl !w-full !overflow-hidden !border !border-slate-100">
            {/* Modal Header */}
            <div className="!bg-slate-50 !px-6 !py-4 !flex !justify-between !items-center !border-b !border-slate-100">
              <div className="!flex !items-center !gap-2.5">
                <MessageSquare className="!w-5 !h-5 !text-emerald-500" />
                <span className="!font-bold !text-slate-800 !text-base">Support Ticket Details</span>
              </div>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="!text-slate-400 hover:!text-slate-600 !p-1 !rounded-lg hover:!bg-slate-100 !transition-all !border-none !cursor-pointer"
              >
                <X className="!w-5 !h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="!p-6 !space-y-6">
              <div className="!grid !grid-cols-2 !gap-4">
                <div>
                  <label className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-wider">From User</label>
                  <div className="!flex !items-center !gap-2 !mt-1">
                    <User className="!w-4 !h-4 !text-slate-400" />
                    <span className="!text-sm !font-bold !text-slate-800">{selectedTicket.name}</span>
                  </div>
                </div>
                <div>
                  <label className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-wider">Email Address</label>
                  <div className="!flex !items-center !gap-2 !mt-1">
                    <Mail className="!w-4 !h-4 !text-slate-400" />
                    <a href={`mailto:${selectedTicket.email}`} className="!text-sm !font-bold !text-emerald-600 hover:!underline">{selectedTicket.email}</a>
                  </div>
                </div>
              </div>

              <div>
                <label className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-wider">Subject</label>
                <div className="!flex !items-center !gap-2 !mt-1">
                  <FileText className="!w-4 !h-4 !text-slate-400" />
                  <span className="!text-sm !font-bold !text-slate-800">{selectedTicket.subject}</span>
                </div>
              </div>

              <div>
                <label className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-wider">Query Message</label>
                <div className="!mt-1.5 !p-4 !bg-slate-50 !rounded-xl !border !border-slate-150">
                  <p className="!text-sm !text-slate-600 !leading-relaxed !m-0 !whitespace-pre-wrap">{selectedTicket.message}</p>
                </div>
              </div>

              <div className="!flex !justify-between !items-center !pt-4 !border-t !border-slate-100">
                <div className="!text-[11px] !text-slate-400 !font-semibold">
                  Submitted: {new Date(selectedTicket.createdAt).toLocaleString('en-IN')}
                </div>
                <div className="!flex !gap-2">
                  {selectedTicket.status === 'pending' && (
                    <button
                      disabled={resolvingId === selectedTicket._id}
                      onClick={() => handleResolve(selectedTicket._id)}
                      className="!px-4 !py-2 !bg-green-600 hover:!bg-green-700 !text-white !rounded-xl !text-xs !font-bold !cursor-pointer !transition-colors !border-none !flex !items-center !gap-1.5"
                    >
                      {resolvingId === selectedTicket._id ? (
                        <Loader2 className="!w-3.5 !h-3.5 !animate-spin" />
                      ) : (
                        <Check className="!w-3.5 !h-3.5" />
                      )}
                      Mark Resolved
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="!px-4 !py-2 !bg-slate-100 hover:!bg-slate-200 !text-slate-700 !rounded-xl !text-xs !font-bold !cursor-pointer !transition-colors !border-none"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
