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
      <div className="!w-full !font-sans !bg-white !rounded-[24px] !border !border-slate-200/80 !shadow-sm !p-6 md:!p-8 !flex !items-center !justify-center !min-h-[400px]">
        <div className="!text-center !max-w-md !w-full">
          <div className="!w-20 !h-20 !bg-red-50 !rounded-full !flex !items-center !justify-center !mx-auto !mb-6 !border !border-red-100">
            <Shield className="!w-10 !h-10 !text-red-500" />
          </div>
          <h1 className="!text-2xl !font-bold !text-slate-900 !tracking-tight !mb-2 !m-0">Access Denied</h1>
          <p className="!text-slate-500 !text-sm !font-medium !m-0">Only Super Admins possess the clearance to view this module.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="!w-full !font-sans !bg-white !rounded-[24px] !border !border-slate-200/80 !shadow-sm !p-6 md:!p-8 !space-y-6">
      {/* Header Section */}
      <div className="!flex !flex-col sm:!flex-row sm:!items-center !justify-between !gap-4 !pb-6 !border-b !border-slate-100">
        <div>
          <h1 className="!text-2xl md:!text-3xl !font-black !text-slate-900 !tracking-tight !m-0 !mb-1.5">Admin Accounts</h1>
          <p className="!text-sm !font-medium !text-slate-500 !m-0">View and manage all venue administrators and their credentials</p>
        </div>
        
        {/* Search Bar */}
        <div className="!relative !w-full sm:!max-w-md">
          <Search className="!absolute !left-4 !top-1/2 !-translate-y-1/2 !w-4 !h-4 !text-slate-400 !z-10" />
          <input
            type="text"
            placeholder="Search accounts, emails, or venues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="!w-full !pl-11 !pr-4 !py-3.5 !bg-slate-50 hover:!bg-slate-100 !border !border-slate-200 focus:!bg-white focus:!outline-none focus:!border-[#1abc60] focus:!ring-1 focus:!ring-[#1abc60] !rounded-xl !text-sm !font-medium !text-slate-900 !transition-all placeholder:!text-slate-400"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="!absolute !right-4 !top-1/2 !-translate-y-1/2 !p-1 !text-slate-400 hover:!text-slate-600 !rounded-full !transition-colors !cursor-pointer !border-none !bg-transparent"
            >
              <X className="!w-4 !h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Data Table Section */}
      <div className="!border !border-slate-200/60 !rounded-2xl !overflow-hidden">
        {loading ? (
          <div className="!flex !flex-col !items-center !justify-center !py-20">
            <Loader2 className="!w-10 !h-10 !text-slate-300 !animate-spin !mb-4" />
            <p className="!text-slate-500 !font-medium !text-sm !m-0">Syncing Accounts...</p>
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="!text-center !py-20">
            <div className="!w-16 !h-16 !bg-slate-50 !rounded-full !flex !items-center !justify-center !mx-auto !mb-4 !border !border-slate-200">
              <Search className="!w-6 !h-6 !text-slate-400" />
            </div>
            <h3 className="!text-slate-900 !font-bold !text-lg !mb-1 !m-0">No Records Found</h3>
            <p className="!text-slate-500 !text-sm !max-w-[280px] !mx-auto !m-0">
              Try adjusting your search parameters to find the account.
            </p>
          </div>
        ) : (
          <div className="!overflow-x-auto !custom-scrollbar">
            <table className="!w-full !text-left !border-collapse !min-w-[900px]">
              <thead className="!bg-slate-50 !text-slate-500 !text-[10px] !font-black !uppercase !tracking-widest !border-b !border-slate-200">
                <tr>
                  <th className="!px-6 md:!px-8 !py-4">Admin Profile</th>
                  <th className="!px-6 md:!px-8 !py-4">Contact Identity</th>
                  <th className="!px-6 md:!px-8 !py-4">Venue Designation</th>
                  <th className="!px-6 md:!px-8 !py-4">Security Control</th>
                  <th className="!px-6 md:!px-8 !py-4 !text-right">System Status</th>
                </tr>
              </thead>
              <tbody className="!divide-y !divide-slate-100">
                {filteredAccounts.map((account) => (
                  <tr key={account._id} className="hover:!bg-slate-50/50 !transition-colors !group">
                    {/* Admin Profile */}
                    <td className="!px-6 md:!px-8 !py-4">
                      <div className="!flex !items-center !gap-3">
                        <div className="!w-10 !h-10 !rounded-xl !bg-[#1abc60]/10 !flex !items-center !justify-center !text-[#1abc60] !font-bold !text-lg !border !border-[#1abc60]/20">
                          {account.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="!text-sm !font-semibold !text-slate-900 !m-0">{account.name}</p>
                          <p className="!text-xs !text-slate-500 !font-medium !mt-0.5 !m-0 !capitalize">{account.role}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="!px-6 md:!px-8 !py-4">
                      <div className="!space-y-1.5">
                        <div className="!flex !items-center !gap-2 !text-sm !text-slate-600">
                          <Mail className="!w-3.5 !h-3.5 !text-slate-400" />
                          <span>{account.email}</span>
                        </div>
                        <div className="!flex !items-center !gap-2 !text-sm !text-slate-600">
                          <Phone className="!w-3.5 !h-3.5 !text-slate-400" />
                          <span>{account.phone}</span>
                        </div>
                      </div>
                    </td>

                    {/* Venue / Turf */}
                    <td className="!px-6 md:!px-8 !py-4">
                      <div className="!space-y-1.5">
                        <div className="!flex !items-center !gap-2 !text-sm !font-semibold !text-slate-900">
                          <ExternalLink className="!w-3.5 !h-3.5 !text-[#1abc60]" />
                          <span className="!truncate !max-w-[180px]">{account.turfName}</span>
                        </div>
                        <div className="!flex !items-center !gap-2 !text-xs !text-slate-500 !font-medium">
                          <MapPin className="!w-3.5 !h-3.5 !text-slate-400" />
                          <span>{account.turfCity}</span>
                        </div>
                      </div>
                    </td>

                    {/* Security Control (Password Reset) */}
                    <td className="!px-6 md:!px-8 !py-4">
                      {resettingId === account._id ? (
                        <div className="!flex !items-center !gap-2 !bg-white !p-1 !rounded-lg !border !border-slate-200 !shadow-sm !max-w-[200px]">
                          <input
                            type="text"
                            placeholder="New Pwd"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="!w-full !min-w-0 !px-2 !py-1.5 !text-xs !font-medium !border-none !outline-none focus:!ring-0 !bg-transparent placeholder:!text-slate-400"
                            autoFocus
                          />
                          <div className="!flex !items-center !gap-1 !shrink-0">
                            <button 
                              disabled={isUpdating}
                              onClick={() => handleResetPassword(account._id)}
                              className="!p-1.5 !bg-[#1abc60] !text-white !rounded hover:!bg-[#16a085] !transition-colors disabled:!opacity-50 !flex !items-center !justify-center !cursor-pointer !border-none"
                            >
                              {isUpdating ? <Loader2 className="!w-3.5 !h-3.5 !animate-spin" /> : <Check className="!w-3.5 !h-3.5" />}
                            </button>
                            <button 
                              onClick={() => { setResettingId(null); setNewPassword(''); }}
                              className="!p-1.5 !bg-slate-100 !text-slate-600 !rounded hover:!bg-slate-200 !transition-colors !cursor-pointer !border-none"
                            >
                              <X className="!w-3.5 !h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="!flex !items-center !gap-3">
                          <div className="!flex !items-center !gap-2 !px-3 !py-1.5 !bg-slate-50 !rounded-lg !border !border-slate-200">
                            <Lock className="!w-3.5 !h-3.5 !text-slate-400" />
                            <span className="!text-[10px] !font-mono !text-slate-400 !tracking-[0.2em] !pt-0.5">
                              ••••••••
                            </span>
                          </div>
                          <button 
                            onClick={() => setResettingId(account._id)}
                            className="!p-2 !text-white !bg-[#1abc60] hover:!bg-[#16a085] !rounded-lg !transition-all !cursor-pointer !border-none"
                            title="Reset Password"
                          >
                            <Settings className="!w-4 !h-4" />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="!px-6 md:!px-8 !py-4 !text-right">
                      <span className={`!inline-flex !items-center !px-2.5 !py-1 !rounded-full !text-xs !font-semibold ${
                        account.isActive 
                          ? '!bg-emerald-50 !text-[#1abc60] !border !border-emerald-200/60' 
                          : '!bg-slate-50 !text-slate-600 !border !border-slate-200'
                      }`}>
                        <span className={`!w-1.5 !h-1.5 !rounded-full !mr-1.5 ${account.isActive ? '!bg-[#1abc60]' : '!bg-slate-400'}`}></span>
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
  );
}