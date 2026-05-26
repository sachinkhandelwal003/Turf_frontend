'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import api from '@/app/services/api';
import { toast } from 'sonner';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Search, 
  Loader2, 
  ExternalLink,
  Lock,
  Settings,
  X,
  Check
} from 'lucide-react';

interface AdminAccount {
  _id: string;
  name: string;
  email: string;
  phone: string;
  turfName: string;
  turfCity: string;
  isActive: boolean;
  role: string;
}

export default function AdminAccountsPage() {
  const { isSuperadmin } = useAuth();
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchAccounts = async () => {
    try {
      const res = await api.get('/auth/admin-accounts');
      if (res.data.success) {
        setAccounts(res.data.accounts);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.msg || 'Failed to fetch admin accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperadmin) {
      fetchAccounts();
    }
  }, [isSuperadmin]);

  const handleResetPassword = async (userId: string) => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsUpdating(true);
    try {
      const res = await api.post('/auth/reset-password-admin', { userId, newPassword });
      if (res.data.success) {
        toast.success('Password updated successfully');
        setResettingId(null);
        setNewPassword('');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.msg || 'Failed to reset password');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredAccounts = accounts.filter(acc => 
    acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    acc.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    acc.turfName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    acc.phone.includes(searchQuery)
  );

  if (!isSuperadmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fcfcfd]">
        <div className="text-center bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm max-w-md w-full mx-4">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
            <Shield className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Access Denied</h1>
          <p className="text-gray-500 text-sm font-medium">Only Super Admins possess the clearance to view this module.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-20">
      {/* Sticky Glassmorphic Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 transition-all duration-300">
        <div className="max-w-[1600px] mx-auto px-6 py-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                Admin Accounts
              </h1>
              <p className="text-gray-500 text-sm font-medium mt-1">
                View and manage all venue administrators and their credentials.
              </p>
            </div>
            
            {/* Professional SaaS-style Search Bar */}
            <div className="relative w-full lg:max-w-md group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 group-focus-within:text-gray-600 transition-colors" />
              </div>
              
              <input
                type="text"
                placeholder="Search accounts, emails, or venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full !pl-12 pr-16 py-2.5 bg-gray-50/50 hover:bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-gray-100 focus:border-gray-300 transition-all shadow-sm"
              />
              
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                {searchQuery ? (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : (
                  <div className="hidden sm:flex items-center justify-center px-2 py-0.5 border border-gray-200 rounded-md bg-white shadow-sm">
                    <span className="text-[10px] font-bold text-gray-400">⌘K</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1600px] mx-auto px-6 mt-8">
        <div className="bg-white rounded-[24px] border border-gray-200 shadow-sm overflow-hidden">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-10 h-10 text-gray-300 animate-spin mb-4" />
              <p className="text-gray-500 font-medium text-sm">Syncing Accounts...</p>
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="text-center py-32">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-gray-900 font-bold text-lg mb-1">No Records Found</h3>
              <p className="text-gray-500 text-sm max-w-[280px] mx-auto">
                Try adjusting your search parameters to find the account.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin Profile</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Identity</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Venue Designation</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Security Control</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">System Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAccounts.map((account) => (
                    <tr key={account._id} className="hover:bg-gray-50 transition-colors group">
                      {/* Admin Profile */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#1abc60]/10 flex items-center justify-center text-[#1abc60] font-bold text-lg border border-[#1abc60]/20">
                            {account.name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{account.name}</p>
                            <p className="text-xs text-gray-500 font-medium mt-0.5 capitalize">{account.role}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="px-6 py-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <span>{account.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            <span>{account.phone}</span>
                          </div>
                        </div>
                      </td>

                      {/* Venue / Turf */}
                      <td className="px-6 py-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                            <ExternalLink className="w-3.5 h-3.5 text-[#1abc60]" />
                            <span className="truncate max-w-[180px]">{account.turfName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            <span>{account.turfCity}</span>
                          </div>
                        </div>
                      </td>

                      {/* Security Control (Password Reset) */}
                      <td className="px-6 py-4">
                        {resettingId === account._id ? (
                          <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm max-w-[200px]">
                            <input
                              type="text"
                              placeholder="New Pwd"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full min-w-0 px-2 py-1.5 text-xs font-medium border-none outline-none focus:ring-0 bg-transparent placeholder:text-gray-400"
                              autoFocus
                            />
                            <div className="flex items-center gap-1 shrink-0">
                              <button 
                                disabled={isUpdating}
                                onClick={() => handleResetPassword(account._id)}
                                className="p-1.5 bg-[#1abc60] text-white rounded hover:bg-[#16a085] transition-colors disabled:opacity-50 flex items-center justify-center"
                              >
                                {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                              </button>
                              <button 
                                onClick={() => { setResettingId(null); setNewPassword(''); }}
                                className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                              <Lock className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-[10px] font-mono text-gray-400 tracking-[0.2em] pt-0.5">
                                ••••••••
                              </span>
                            </div>
                            <button 
                              onClick={() => setResettingId(account._id)}
                              className="p-2 text-white bg-[#1abc60] hover:bg-[#16a085] rounded-lg transition-all"
                              title="Reset Password"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          account.isActive 
                            ? 'bg-green-50 text-[#1abc60] border border-green-200/60' 
                            : 'bg-gray-50 text-gray-600 border border-gray-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${account.isActive ? 'bg-[#1abc60]' : 'bg-gray-400'}`}></span>
                          {account.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}