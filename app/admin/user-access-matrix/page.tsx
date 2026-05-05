"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { 
  Loader2, 
  Search, 
  Save, 
  User as UserIcon, 
  Shield, 
  CheckSquare, 
  Square,
  Eye,
  Edit3,
  ToggleLeft,
  ToggleRight,
  Lock as LockIcon
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
        setUsers(usersRes.data.users);
        setModifiedUsers(usersRes.data.users);
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
      // Only send changed users to optimize
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

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#1abc60]" /></div>;

  return (
    <div className="space-y-4 max-w-[100vw] overflow-hidden p-2">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-black text-[#1abc60] leading-none">
            User Access Matrix
          </h1>
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="w-4 h-4 rounded border border-gray-200 flex items-center justify-center group-hover:border-[#1abc60] transition-colors">
              <div className="w-2 h-2 rounded-sm bg-transparent"></div>
            </div>
            <span className="text-[11px] font-bold text-gray-400 group-hover:text-gray-600 transition-colors">Role Inherited</span>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-[#f8f9fa] border border-gray-100 rounded-md w-64 group">
            <div className="pl-3 text-gray-400">
              <UserIcon className="w-4 h-4" />
            </div>
            <input 
              type="text" 
              placeholder="Search users..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="flex-1 px-3 py-2 bg-transparent border-none outline-none text-xs font-medium text-gray-600 placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-center bg-[#f8f9fa] border border-gray-100 rounded-md w-64 group">
            <div className="pl-3 text-gray-400">
              <LockIcon className="w-4 h-4" />
            </div>
            <input 
              type="text" 
              placeholder="Search permissions..."
              value={permSearch}
              onChange={(e) => setPermSearch(e.target.value)}
              className="flex-1 px-3 py-2 bg-transparent border-none outline-none text-xs font-medium text-gray-600 placeholder:text-gray-400"
            />
          </div>

          <button 
            onClick={handleSaveChanges}
            disabled={saving}
            className="flex items-center gap-2 bg-[#00a859] text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-[#008f48] transition-all shadow-sm disabled:opacity-50 active:scale-95"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-white fill-white/20" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                <th className="sticky left-0 z-20 bg-white p-4 text-left min-w-[250px] border-r border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Module Permissions</span>
                </th>
                {filteredUsers.map(user => (
                  <th key={user._id} className="p-4 min-w-[140px] border-r border-gray-100 last:border-r-0 bg-white">
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
                          {user.profilePhoto ? (
                            <img src={user.profilePhoto.startsWith('http') ? user.profilePhoto : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${user.profilePhoto}`} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="w-6 h-6 text-gray-300" />
                          )}
                        </div>
                        <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${user.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      </div>
                      <div className="text-center">
                        <p className="text-[11px] font-black text-gray-900 truncate max-w-[120px] leading-tight mb-1">{user.name}</p>
                        <span className="text-[9px] font-black text-[#1abc60] bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {user.role}
                        </span>
                      </div>
                      
                      <div className="mt-1 flex flex-col items-center gap-1">
                        <button 
                          onClick={() => handleToggleActive(user._id)}
                          className={`w-8 h-4 rounded-full transition-all relative ${user.isActive ? 'bg-[#1abc60]' : 'bg-gray-200'}`}
                        >
                          <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${user.isActive ? 'left-4.5' : 'left-0.5'}`}></div>
                        </button>
                        <span className={`text-[8px] font-black uppercase tracking-tighter ${user.isActive ? 'text-[#1abc60]' : 'text-gray-400'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPermissions.map((perm) => (
                <tr key={perm._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors group">
                  <td className="sticky left-0 z-10 bg-white p-4 border-r border-gray-100 flex items-center gap-3">
                    <div className="p-1.5 bg-gray-50 rounded-md border border-gray-100">
                      {perm.slug.startsWith('view') || perm.slug.startsWith('read') ? (
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                      ) : (
                        <Edit3 className="w-3.5 h-3.5 text-orange-400" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-gray-700">{perm.slug}</span>
                    </div>
                  </td>
                  {filteredUsers.map(user => (
                    <td key={`${user._id}-${perm._id}`} className="p-4 text-center border-r border-gray-100 last:border-r-0">
                      <button 
                        onClick={() => handleTogglePermission(user._id, perm.slug)}
                        className="group/btn transition-transform active:scale-90"
                      >
                        {user.permissions.includes(perm.slug) ? (
                          <div className="w-6 h-6 rounded-md bg-[#1abc60] flex items-center justify-center shadow-lg shadow-green-100">
                            <CheckSquare className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-md border-2 border-gray-200 flex items-center justify-center hover:border-[#1abc60] transition-colors bg-white">
                            <Square className="w-4 h-4 text-transparent group-hover/btn:text-gray-100" />
                          </div>
                        )}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
