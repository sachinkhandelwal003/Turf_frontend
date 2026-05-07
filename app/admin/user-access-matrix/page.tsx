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

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-[#1abc60]" /></div>;

  return (
    <div className="space-y-6 max-w-[100vw] overflow-hidden p-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900 leading-none">
            User Access Matrix
          </h1>
          <label className="flex items-center gap-2 cursor-pointer group border-l border-gray-200 pl-4">
            <div className="w-4 h-4 rounded border border-gray-300 flex items-center justify-center group-hover:border-[#1abc60] transition-colors">
              <div className="w-2 h-2 rounded-sm bg-transparent"></div>
            </div>
            <span className="text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">Role Inherited</span>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg w-full sm:w-64 focus-within:ring-1 focus-within:ring-[#1abc60] focus-within:border-[#1abc60] transition-colors">
            <div className="pl-3 text-gray-400">
              <UserIcon className="w-4 h-4" />
            </div>
            <input 
              type="text" 
              placeholder="Search users..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="flex-1 px-3 py-2 bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg w-full sm:w-64 focus-within:ring-1 focus-within:ring-[#1abc60] focus-within:border-[#1abc60] transition-colors">
            <div className="pl-3 text-gray-400">
              <LockIcon className="w-4 h-4" />
            </div>
            <input 
              type="text" 
              placeholder="Search permissions..."
              value={permSearch}
              onChange={(e) => setPermSearch(e.target.value)}
              className="flex-1 px-3 py-2 bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400"
            />
          </div>

          <button 
            onClick={handleSaveChanges}
            disabled={saving}
            className="flex w-full sm:w-auto items-center justify-center gap-2 bg-[#1abc60] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#17a554] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="sticky left-0 z-20 bg-gray-50 p-4 text-left min-w-[250px] border-r border-gray-200">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Module Permissions</span>
                </th>
                {filteredUsers.map(user => (
                  <th key={user._id} className="p-4 min-w-[140px] border-r border-gray-200 last:border-r-0 bg-gray-50">
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm">
                          {user.profilePhoto ? (
                            <img src={user.profilePhoto.startsWith('http') ? user.profilePhoto : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${user.profilePhoto}`} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white shadow-sm ${user.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-900 truncate max-w-[120px] mb-1">{user.name}</p>
                        <span className="text-xs font-medium text-[#1abc60] bg-green-50 border border-green-100 px-2 py-0.5 rounded-md capitalize">
                          {user.role}
                        </span>
                      </div>
                      
                      {/* FIXED TOGGLE COMPONENT */}
                      <div className="mt-2 flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleToggleActive(user._id)}
                          type="button"
                          className={`!relative !flex !items-center !h-5 !w-9 !cursor-pointer !rounded-full !border-none !p-0 !transition-colors focus:!outline-none ${user.isActive ? '!bg-[#1abc60]' : '!bg-gray-300'}`}
                        >
                          <span 
                            className={`!absolute !left-[2px] !inline-block !h-4 !w-4 !transform !rounded-full !bg-white !shadow-sm !transition-transform ${user.isActive ? '!translate-x-[16px]' : '!translate-x-0'}`}
                          ></span>
                        </button>
                        <span className={`text-xs font-medium ${user.isActive ? 'text-gray-700' : 'text-gray-400'}`}>
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
                <tr key={perm._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="sticky left-0 z-10 bg-white p-4 border-r border-gray-200 flex items-center gap-3">
                    <div className="p-1.5 bg-gray-50 rounded-md border border-gray-200">
                      {perm.slug.startsWith('view') || perm.slug.startsWith('read') ? (
                        <Eye className="w-4 h-4 text-blue-500" />
                      ) : (
                        <Edit3 className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">{perm.slug}</span>
                    </div>
                  </td>
                  {filteredUsers.map(user => (
                    <td key={`${user._id}-${perm._id}`} className="p-4 text-center border-r border-gray-100 last:border-r-0">
                      <button 
                        onClick={() => handleTogglePermission(user._id, perm.slug)}
                        className="group/btn transition-transform active:scale-95 flex items-center justify-center w-full h-full"
                      >
                        {user.permissions.includes(perm.slug) ? (
                          <div className="w-5 h-5 rounded bg-[#1abc60] flex items-center justify-center">
                            <CheckSquare className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded border border-gray-300 flex items-center justify-center group-hover/btn:border-[#1abc60] transition-colors bg-white">
                            <Square className="w-4 h-4 text-transparent group-hover/btn:text-gray-200" />
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