"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { 
  Loader2, 
  Search, 
  Save, 
  User as UserIcon, 
  Eye,
  Edit3,
  Lock as LockIcon,
  Check,
  ShieldCheck
} from 'lucide-react';
import api from '@/app/services/api';
import { toast } from 'sonner';

interface User {
  _id: string;
  name: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  profilePhoto?: string;
}

interface Permission {
  _id: string;
  name: string;
  slug: string;
}

export default function UserAccessMatrixPage() {
  const { isSuperadmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [permSearch, setPermSearch] = useState('');
  
  // Local state for modifications before saving
  const [modifiedUsers, setModifiedUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, permsRes] = await Promise.all([
        api.get('/auth/users'),
        api.get('/auth/permissions')
      ]);
      if (usersRes.data.success) {
        const adminUsers = usersRes.data.users.filter((u: User) => u.role === 'admin' || u.role === 'superadmin');
        setUsers(adminUsers);
        setModifiedUsers(adminUsers);
      }
      if (permsRes.data.success) {
        setPermissions(permsRes.data.permissions);
      }
    } catch (error) {
      toast.error('Failed to load access matrix data');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = (userId: string, permSlug: string) => {
    setModifiedUsers(prev => prev.map(user => {
      if (user._id === userId) {
        const hasPerm = user.permissions.includes(permSlug);
        return {
          ...user,
          permissions: hasPerm 
            ? user.permissions.filter(p => p !== permSlug)
            : [...user.permissions, permSlug]
        };
      }
      return user;
    }));
  };

  const handleToggleActive = (userId: string) => {
    setModifiedUsers(prev => prev.map(user => {
      if (user._id === userId) {
        return { ...user, isActive: !user.isActive };
      }
      return user;
    }));
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const updates = modifiedUsers.map(user => ({
        userId: user._id,
        permissions: user.permissions,
        isActive: user.isActive,
        role: user.role
      }));

      const res = await api.post('/auth/users/batch', { updates });
      if (res.data.success) {
        toast.success('Access matrix updated successfully');
        setUsers(modifiedUsers);
      }
    } catch (error) {
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = modifiedUsers.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredPermissions = permissions.filter(p => 
    p.name.toLowerCase().includes(permSearch.toLowerCase()) ||
    p.slug.toLowerCase().includes(permSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="!min-h-[60vh] !flex !items-center !justify-center">
        <Loader2 className="!w-10 !h-10 !animate-spin !text-[#1abc60]" />
      </div>
    );
  }

  return (
    <div className="!w-full !max-w-[1600px] !mx-auto !font-sans">
      
      {/* SINGLE UNIFIED CONTAINER */}
      <div className="!bg-white sm:!rounded-[24px] !border !border-slate-200 !shadow-sm !overflow-hidden">
        
        {/* --- HEADER --- */}
        <div className="!p-6 md:!p-8 !border-b !border-slate-200 !flex !flex-col xl:!flex-row xl:!items-center !justify-between !gap-6 !bg-white">
          <div>
            <h1 className="!text-2xl md:!text-3xl !font-black !text-slate-900 !m-0 !mb-1">
              Access Matrix
            </h1>
            <p className="!text-sm !font-medium !text-slate-500 !m-0">Manage module permissions and account status for all users</p>
          </div>

          <div className="!flex !flex-col sm:!flex-row !gap-4 !items-center !w-full xl:!w-auto">
            {/* Search Users */}
            <div className="!relative !w-full sm:!w-60">
              <UserIcon className="!absolute !left-3.5 !top-1/2 !-translate-y-1/2 !w-4 !h-4 !text-slate-400 !z-10" />
              <input 
                type="text" 
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="!w-full !pl-10 !pr-4 !py-2.5 !bg-slate-50 !border !border-slate-200 focus:!bg-white focus:!outline-none focus:!border-[#1abc60] focus:!ring-1 focus:!ring-[#1abc60] !rounded-xl !text-sm !text-slate-900 !transition-all"
              />
            </div>

            {/* Search Modules */}
            <div className="!relative !w-full sm:!w-60">
              <LockIcon className="!absolute !left-3.5 !top-1/2 !-translate-y-1/2 !w-4 !h-4 !text-slate-400 !z-10" />
              <input 
                type="text" 
                placeholder="Search modules..."
                value={permSearch}
                onChange={(e) => setPermSearch(e.target.value)}
                className="!w-full !pl-10 !pr-4 !py-2.5 !bg-slate-50 !border !border-slate-200 focus:!bg-white focus:!outline-none focus:!border-[#1abc60] focus:!ring-1 focus:!ring-[#1abc60] !rounded-xl !text-sm !text-slate-900 !transition-all"
              />
            </div>

            {/* Save Button */}
            <div 
              onClick={saving ? undefined : handleSaveChanges}
              style={{ backgroundColor: '#1abc60' }}
              className={`!w-full sm:!w-auto !flex !items-center !justify-center !gap-2 !text-white !px-6 !py-2.5 !rounded-xl !text-sm !font-bold !shadow-md !transition-opacity ${saving ? '!opacity-50 !cursor-not-allowed' : '!cursor-pointer hover:!opacity-90'}`}
            >
              {saving ? <Loader2 className="!w-4 !h-4 !animate-spin" /> : <Save className="!w-4 !h-4" />}
              Save Matrix
            </div>
          </div>
        </div>

        {/* --- TABLE --- */}
        <div className="!overflow-x-auto !custom-scrollbar">
          <table className="!w-full !border-collapse">
            
            {/* TABLE HEAD */}
            <thead>
              <tr>
                {/* Sticky Top-Left Corner */}
                <th className="!sticky !left-0 !top-0 !z-30 !bg-slate-50 !p-5 !text-left !min-w-[250px] !border-r !border-b !border-slate-200">
                  <div className="!flex !items-center !gap-3">
                    <div className="!w-10 !h-10 !rounded-lg !bg-white !border !border-slate-200 !flex !items-center !justify-center !shadow-sm">
                      <ShieldCheck className="!w-5 !h-5 !text-slate-600" />
                    </div>
                    <div>
                      <span className="!text-[11px] !font-bold !text-slate-400 !uppercase !tracking-widest !block">System</span>
                      <span className="!text-sm !font-bold !text-slate-900">Permissions</span>
                    </div>
                  </div>
                </th>
                
                {/* User Headers */}
                {filteredUsers.map(user => (
                  <th key={user._id} className="!sticky !top-0 !z-20 !p-5 !min-w-[160px] !border-r !border-b !border-slate-200 last:!border-r-0 !bg-slate-50">
                    <div className="!flex !flex-col !items-center !gap-3">
                      
                      {/* Profile Image */}
                      <div className="!w-12 !h-12 !rounded-full !bg-white !flex !items-center !justify-center !overflow-hidden !border !border-slate-200 !shadow-sm">
                        {user.profilePhoto ? (
                          <img src={user.profilePhoto.startsWith('http') ? user.profilePhoto : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${user.profilePhoto}`} alt={user.name} className="!w-full !h-full !object-cover" />
                        ) : (
                          <span className="!font-black !text-[#1abc60] !text-lg">{user.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      
                      {/* User Name & Role */}
                      <div className="!text-center">
                        <p className="!text-sm !font-bold !text-slate-900 !truncate !max-w-[140px] !mb-1" title={user.name}>{user.name}</p>
                        <span className="!inline-block !px-2 !py-0.5 !rounded !bg-white !border !border-slate-200 !text-[10px] !font-bold !text-slate-600 !uppercase !tracking-wider">
                          {user.role}
                        </span>
                      </div>
                      
                      {/* Active Toggle Switch */}
                      <div className="!flex !items-center !gap-2 !mt-1 !bg-white !px-3 !py-1.5 !rounded-lg !border !border-slate-200 !shadow-sm">
                        <div 
                          onClick={() => handleToggleActive(user._id)}
                          className={`!relative !flex !items-center !w-9 !h-5 !rounded-full !cursor-pointer !transition-colors ${user.isActive ? '!bg-[#1abc60]' : '!bg-slate-300'}`}
                        >
                          <div className={`!w-3.5 !h-3.5 !bg-white !rounded-full !shadow-sm !transform !transition-transform ${user.isActive ? '!translate-x-[18px]' : '!translate-x-1'}`}></div>
                        </div>
                        <span className={`!text-[10px] !font-black !uppercase !tracking-wider ${user.isActive ? '!text-[#1abc60]' : '!text-slate-400'}`}>
                          {user.isActive ? 'ON' : 'OFF'}
                        </span>
                      </div>

                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            {/* TABLE BODY */}
            <tbody className="!divide-y !divide-slate-100">
              {filteredPermissions.map((perm) => (
                <tr key={perm._id} className="hover:!bg-slate-50/50 !transition-colors !group">
                  
                  {/* Permission Details (Sticky Left) */}
                  <td className="!sticky !left-0 !z-10 !bg-white group-hover:!bg-slate-50/95 !p-5 !border-r !border-slate-200">
                    <div className="!flex !items-center !gap-3">
                      <div className="!w-8 !h-8 !rounded-lg !bg-slate-50 !border !border-slate-200 !flex !items-center !justify-center !shrink-0">
                        {perm.slug.startsWith('view') || perm.slug.startsWith('read') ? (
                          <Eye className="!w-4 !h-4 !text-blue-500" />
                        ) : (
                          <Edit3 className="!w-4 !h-4 !text-orange-500" />
                        )}
                      </div>
                      <div className="!flex !flex-col">
                        <span className="!text-sm !font-bold !text-slate-900 !leading-tight">{perm.name}</span>
                        <span className="!text-[10px] !font-medium !text-slate-400 !mt-0.5">{perm.slug}</span>
                      </div>
                    </div>
                  </td>
                  
                  {/* Checkboxes per User */}
                  {filteredUsers.map(user => {
                    const isGranted = user.permissions.includes(perm.slug);
                    return (
                      <td key={`${user._id}-${perm._id}`} className="!p-0 !text-center !border-r !border-slate-100 last:!border-r-0">
                        <div 
                          onClick={() => handleTogglePermission(user._id, perm.slug)}
                          className={`!w-full !h-full !min-h-[70px] !flex !items-center !justify-center !cursor-pointer !transition-colors hover:!bg-slate-100/50 ${isGranted ? '!bg-emerald-50/20' : ''}`}
                        >
                          <div className={`!w-6 !h-6 !rounded-[6px] !flex !items-center !justify-center !transition-all ${
                            isGranted 
                              ? '!bg-[#1abc60] !shadow-md !shadow-[#1abc60]/30' 
                              : '!bg-white !border-2 !border-slate-300 hover:!border-[#1abc60]'
                          }`}>
                            {isGranted && <Check className="!w-4 !h-4 !text-white !stroke-[3]" />}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
              
              {filteredPermissions.length === 0 && (
                <tr>
                  <td colSpan={filteredUsers.length + 1} className="!p-16 !text-center !bg-white">
                    <div className="!w-14 !h-14 !bg-slate-50 !rounded-full !flex !items-center !justify-center !mx-auto !mb-3 !border !border-slate-200">
                      <LockIcon className="!w-6 !h-6 !text-slate-300" />
                    </div>
                    <p className="!text-base !font-bold !text-slate-900 !m-0">No modules found</p>
                    <p className="!text-sm !text-slate-500 !mt-1">Try adjusting your search query.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}