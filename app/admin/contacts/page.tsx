"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Phone, Calendar, Trash2, Search, 
  ArrowLeft, Loader2, Send, X, Inbox, User, Tag, Wallet,
  CheckCircle, AlertCircle, Clock, Edit3, MessageSquare
} from 'lucide-react';
import Link from 'next/link';

interface Contact {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  imageUrl?: string;
  projectType?: string;
  budget?: string;
  status: 'new' | 'contacted' | 'in-progress' | 'completed' | 'closed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [updating, setUpdating] = useState<string | null>(null);
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
    fetchContacts();
  }, [statusFilter]);

  const fetchContacts = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const query = statusFilter ? `?status=${statusFilter}` : '';
      const response = await fetch(`${API_URL}/api/contact${query}`);
      const data = await response.json();
      if (data.success) {
        setContacts(data.data);
        // If a contact was selected, update its data too
        if (selectedContact) {
          const updated = data.data.find((c: Contact) => c._id === selectedContact._id);
          if (updated) setSelectedContact(updated);
        }
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      showAlert('error', 'Failed to load contacts.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string, notes?: string) => {
    setUpdating(id);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/contact/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      });
      const data = await response.json();
      if (data.success) {
        const updatedContact = data.data;
        setContacts(contacts.map(c => c._id === id ? updatedContact : c));
        setSelectedContact(updatedContact);
        showAlert('success', 'Contact updated successfully.');
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      showAlert('error', 'Failed to update contact.');
    } finally {
      setUpdating(null);
    }
  };

  const deleteContact = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inquiry? This cannot be undone.')) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/contact/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        setContacts(contacts.filter(c => c._id !== id));
        if (selectedContact?._id === id) setSelectedContact(null);
        showAlert('success', 'Inquiry deleted successfully.');
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      showAlert('error', 'Failed to delete inquiry.');
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact || !emailSubject || !emailMessage) return;

    setSendingEmail(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/contact/${selectedContact._id}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: emailSubject,
          message: emailMessage
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showAlert('success', `Email sent to ${selectedContact.email}`);
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

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'new': 'bg-blue-50 text-blue-700 border-blue-200',
      'contacted': 'bg-amber-50 text-amber-700 border-amber-200',
      'in-progress': 'bg-purple-50 text-purple-700 border-purple-200',
      'completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'closed': 'bg-zinc-100 text-zinc-600 border-zinc-200'
    };
    const labels: Record<string, string> = {
      'new': 'New', 'contacted': 'Contacted', 'in-progress': 'In Progress', 'completed': 'Completed', 'closed': 'Closed'
    };
    
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status] || styles['new']}`}>
        {labels[status] || 'New'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-[#a68a6b] mb-4" />
        <p className="text-zinc-500 uppercase tracking-widest text-sm font-semibold">Loading Inquiries...</p>
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
                <h1 className="text-xl font-bold text-gray-900">Inquiries</h1>
                <p className="text-xs text-gray-500 mt-0.5">Manage client requests and messages.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search name, email, subject..."
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
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Contact List */}
          <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-[calc(100vh-140px)] flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Inbox</h2>
              <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{filteredContacts.length}</span>
            </div>
            
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {filteredContacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Inbox className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-900 font-medium">No inquiries found</p>
                  <p className="text-sm text-gray-500 mt-1">Adjust your filters or search query.</p>
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <div
                    key={contact._id}
                    onClick={() => setSelectedContact(contact)}
                    className={`p-5 border-b border-gray-100 cursor-pointer transition-all ${
                      selectedContact?._id === contact._id 
                        ? 'bg-blue-50/50 border-l-4 border-l-blue-500' 
                        : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className="font-bold text-gray-900 truncate">{contact.name}</h3>
                      {getStatusBadge(contact.status)}
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1 truncate">{contact.subject}</p>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">{contact.message}</p>
                    
                    <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(contact.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteContact(contact._id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete Inquiry"
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
            {selectedContact ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                key={selectedContact._id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
              >
                {/* Detail Header */}
                <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
                      {selectedContact.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedContact.name}</h2>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Mail className="w-3.5 h-3.5" /> {selectedContact.email}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowEmailModal(true)}
                    className="w-full sm:w-auto bg-slate-900 hover:bg-[#a68a6b] text-white px-5 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    Reply via Email
                  </button>
                </div>
                
                {/* Detail Body */}
                <div className="p-6 md:p-8">
                  {/* Meta Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Phone</p>
                      <p className="text-sm font-medium text-gray-900">{selectedContact.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Date Received</p>
                      <p className="text-sm font-medium text-gray-900">{new Date(selectedContact.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Project Type</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">{selectedContact.projectType || 'General'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Budget</p>
                      <p className="text-sm font-medium text-gray-900">{selectedContact.budget || 'Not specified'}</p>
                    </div>
                  </div>

                  {/* Message Box */}
                  <div className="mb-8">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-3">Inquiry Message</p>
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                      <h4 className="font-bold text-gray-900 mb-2">{selectedContact.subject}</h4>
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                        {selectedContact.message}
                      </p>
                    </div>
                  </div>

                  {/* Reference Image */}
                  {selectedContact.imageUrl && (
                    <div className="mb-8">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-3">Reference Image</p>
                      <a href={selectedContact.imageUrl} target="_blank" rel="noreferrer">
                        <img 
                          src={selectedContact.imageUrl} 
                          alt="Reference" 
                          className="w-48 h-48 object-cover rounded-lg border border-gray-200 shadow-sm hover:opacity-90 transition-opacity"
                        />
                      </a>
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
                          value={selectedContact.status}
                          onChange={(e) => updateStatus(selectedContact._id, e.target.value, selectedContact.notes)}
                          disabled={updating === selectedContact._id}
                          className="w-full appearance-none bg-white border border-gray-300 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#a68a6b] cursor-pointer disabled:opacity-50"
                        >
                          <option value="new">🆕 New</option>
                          <option value="contacted">📞 Contacted</option>
                          <option value="in-progress">⏳ In Progress</option>
                          <option value="completed">✅ Completed</option>
                          <option value="closed">📁 Closed</option>
                        </select>
                        {updating === selectedContact._id && (
                          <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-3">
                        <Edit3 className="w-3.5 h-3.5" /> Internal Notes
                      </label>
                      <textarea
                        value={selectedContact.notes || ''}
                        onChange={(e) => {
                          const updated = { ...selectedContact, notes: e.target.value };
                          setSelectedContact(updated);
                        }}
                        onBlur={(e) => updateStatus(selectedContact._id, selectedContact.status, e.target.value)}
                        placeholder="Add private notes about this client..."
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
                  <MessageSquare className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Inquiry Selected</h3>
                <p className="text-gray-500 max-w-sm">
                  Select a contact from the inbox list on the left to view their full message, update their status, or reply.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- EMAIL MODAL --- */}
      <AnimatePresence>
        {showEmailModal && selectedContact && (
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
                <h3 className="text-lg font-bold text-gray-900">Compose Email</h3>
                <button onClick={() => setShowEmailModal(false)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSendEmail} className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">To</label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{selectedContact.name}</span>
                    <span className="text-gray-400">&lt;{selectedContact.email}&gt;</span>
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
                    placeholder="Regarding your inquiry: [Subject]"
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
                    placeholder="Type your response here..."
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