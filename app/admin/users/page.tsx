"use client";

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/app/context/AuthContext';
import { Search, Shield, User as UserIcon, Loader2, Check, AlertCircle, Save, X, Plus, Trash2, Mail, Phone, Lock, UserPlus, Edit2, ChevronLeft, ChevronRight, Camera, LogIn } from 'lucide-react';

// ... inside AdminUsersPage ...
  const handleImpersonate = async (userId: string) => {
    try {
      const res = await api.post('/auth/impersonate', { userId });
      if (res.data.token) {
        // Save current session so we can go back later if needed
        const currentToken = localStorage.getItem('token');
        const currentUserData = localStorage.getItem('user');
        
        if (currentToken && currentUserData) {
          localStorage.setItem('impersonator_token', currentToken);
          localStorage.setItem('impersonator_user', currentUserData);
        }

        // Set new session
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        
        toast.success(`Now logged in as ${res.data.user.name}`);
        
        // Refresh page to apply new permissions
        window.location.href = '/admin/dashboard';
      }
    } catch (error: any) {
      toast.error(error.response?.data?.msg || 'Impersonation failed');
    }
  };
// ... pass handleImpersonate to UserRow ...
import { motion } from 'framer-motion';
import api from '@/app/services/api';
import { toast } from 'sonner';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin' | 'superadmin';
  permissions: string[];
  isActive: boolean;
  profilePhoto?: string;
  createdBy?: {
    _id: string;
    name: string;
  };
}

interface Permission {
  _id: string;
  name: string;
  slug: string;
}

interface Role {
  _id: string;
  name: string;
  permissions: string[];
}

export default function AdminUsersPage() {
  const { user: currentUser, isSuperadmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // New User Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    password: '', 
    confirmPassword: '',
    role: 'user',
    profilePhoto: ''
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, rolesRes, permsRes] = await Promise.all([
        api.get('/auth/users'),
        api.get('/auth/roles'),
        api.get('/auth/permissions')
      ]);

      if (usersRes.data.success) setUsers(usersRes.data.users);
      if (rolesRes.data.success) setRoles(rolesRes.data.roles);
      if (permsRes.data.success) setAvailablePermissions(permsRes.data.permissions);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load user management data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newUser.password !== newUser.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setIsCreating(true);
    try {
      const selectedRoleData = roles.find(r => r.name === newUser.role);
      const permissions = selectedRoleData ? selectedRoleData.permissions : [];
      
      const formData = new FormData();
      formData.append('name', newUser.name);
      formData.append('email', newUser.email);
      formData.append('phone', newUser.phone);
      formData.append('password', newUser.password);
      formData.append('role', newUser.role);
      formData.append('permissions', JSON.stringify(permissions));
      
      if (photoFile) {
        formData.append('profilePhoto', photoFile);
      } else if (newUser.profilePhoto) {
        formData.append('profilePhoto', newUser.profilePhoto);
      }

      const res = await api.post('/auth/users', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setUsers([...users, res.data.user]);
        setShowAddModal(false);
        setNewUser({ 
          name: '', 
          email: '', 
          phone: '', 
          password: '', 
          confirmPassword: '', 
          role: 'user',
          profilePhoto: ''
        });
        setPhotoFile(null);
        toast.success('User created successfully');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.msg || 'Failed to create user');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await api.delete(`/auth/users/${userId}`);
      if (res.data.success) {
        setUsers(users.filter(u => u._id !== userId));
        toast.success('User deleted successfully');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.msg || 'Failed to delete user');
    }
  };

  const handleUpdateUser = async (userId: string, updateData: any) => {
    setUpdatingId(userId);
    try {
      const formData = new FormData();
      
      // If password is empty, remove it
      if (!updateData.password) {
        delete updateData.password;
        delete updateData.confirmPassword;
      }

      // If role changed, update permissions accordingly
      if (updateData.role) {
        const selectedRole = roles.find(r => r.name === updateData.role);
        updateData.permissions = selectedRole ? selectedRole.permissions : [];
      }

      // Append all fields to FormData
      Object.keys(updateData).forEach(key => {
        if (key === 'permissions') {
          formData.append(key, JSON.stringify(updateData[key]));
        } else if (key === 'photoFile' && updateData[key]) {
          formData.append('profilePhoto', updateData[key]);
        } else if (key !== 'photoFile') {
          formData.append(key, updateData[key]);
        }
      });

      const res = await api.put(`/auth/users/${userId}/rbac`, formData, {
         headers: { 'Content-Type': 'multipart/form-data' }
       });
      
      if (res.data.success) {
        setUsers(users.map(u => u._id === userId ? res.data.user : u));
        toast.success('User updated successfully');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.msg || 'Failed to update user');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500">View and manage users, roles, and account permissions</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[#1abc60] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-black hover:bg-[#16a085] transition-all shadow-lg shadow-green-100 active:scale-95"
        >
          <UserPlus className="w-4 h-4" /> <span>Add User</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl focus-within:ring-4 focus-within:ring-green-50 focus-within:border-[#1abc60] transition-all group max-w-md">
            <div className="pl-3 text-gray-400 group-focus-within:text-[#1abc60]">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2.5 bg-transparent border-none outline-none transition-all text-sm font-bold text-gray-700 placeholder:text-gray-300"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Created By</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentUsers.map((u) => (
                <UserRow 
                  key={u._id} 
                  user={u} 
                  isSuperadmin={isSuperadmin} 
                  roles={roles}
                  availablePermissions={availablePermissions}
                  isUpdating={updatingId === u._id}
                  onUpdate={handleUpdateUser}
                  onDelete={handleDeleteUser}
                  onImpersonate={handleImpersonate}
                  isCurrentUser={u._id === currentUser?.id}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} Users
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-[#1abc60] disabled:opacity-50 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      currentPage === i + 1 
                        ? "bg-[#1abc60] text-white shadow-sm" 
                        : "bg-white text-gray-400 border border-gray-200 hover:border-[#1abc60]/30"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-[#1abc60] disabled:opacity-50 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 bg-[#1e293b]/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            className="bg-white rounded-[40px] w-full max-w-2xl h-[90vh] shadow-2xl overflow-hidden border border-white/20 flex flex-col"
          >
            <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
              <div>
                <h3 className="text-3xl font-black text-[#1e293b]">Create New User</h3>
                <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mt-2">Add a new member to your team</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all text-gray-400 hover:text-gray-600 active:scale-95"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-10 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
              <div className="flex flex-col items-center justify-center pb-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group cursor-pointer"
                >
                  <div className="w-32 h-32 rounded-[32px] bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-[#1abc60] group-hover:bg-green-50/30">
                    {photoFile ? (
                      <img src={URL.createObjectURL(photoFile)} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Camera className="w-8 h-8 text-gray-300 group-hover:text-[#1abc60] transition-colors" />
                        <span className="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-widest group-hover:text-[#1abc60]">Upload Photo</span>
                      </>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 p-2 bg-[#1abc60] text-white rounded-xl shadow-lg shadow-green-100 group-hover:scale-110 transition-transform">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setPhotoFile(file);
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl focus-within:ring-4 focus-within:ring-green-50 focus-within:border-[#1abc60] transition-all group">
                    <div className="pl-4 text-gray-400 group-focus-within:text-[#1abc60]">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input 
                      required 
                      value={newUser.name} 
                      onChange={e => setNewUser({...newUser, name: e.target.value})} 
                      className="flex-1 px-4 py-3.5 bg-transparent border-none outline-none text-sm font-bold text-gray-700 placeholder:text-gray-300" 
                      placeholder="John Doe" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-2xl focus-within:ring-4 focus-within:ring-green-50 focus-within:border-[#1abc60] transition-all group">
                    <div className="pl-4 text-gray-400 group-focus-within:text-[#1abc60]">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input 
                      required 
                      value={newUser.phone} 
                      onChange={e => setNewUser({...newUser, phone: e.target.value})} 
                      className="flex-1 px-4 py-3.5 bg-transparent border-none outline-none text-sm font-bold text-gray-700 placeholder:text-gray-300" 
                      placeholder="9876543210" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-2xl focus-within:ring-4 focus-within:ring-green-50 focus-within:border-[#1abc60] transition-all group">
                  <div className="pl-4 text-gray-400 group-focus-within:text-[#1abc60]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input 
                    required 
                    type="email" 
                    value={newUser.email} 
                    onChange={e => setNewUser({...newUser, email: e.target.value})} 
                    className="flex-1 px-4 py-3.5 bg-transparent border-none outline-none text-sm font-bold text-gray-700 placeholder:text-gray-300" 
                    placeholder="john@example.com" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-2xl focus-within:ring-4 focus-within:ring-green-50 focus-within:border-[#1abc60] transition-all group">
                    <div className="pl-4 text-gray-400 group-focus-within:text-[#1abc60]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input 
                      required 
                      type="password" 
                      value={newUser.password} 
                      onChange={e => setNewUser({...newUser, password: e.target.value})} 
                      className="flex-1 px-4 py-3.5 bg-transparent border-none outline-none text-sm font-bold text-gray-700 placeholder:text-gray-300" 
                      placeholder="••••••••" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm Password</label>
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-2xl focus-within:ring-4 focus-within:ring-green-50 focus-within:border-[#1abc60] transition-all group">
                    <div className="pl-4 text-gray-400 group-focus-within:text-[#1abc60]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input 
                      required 
                      type="password" 
                      value={newUser.confirmPassword} 
                      onChange={e => setNewUser({...newUser, confirmPassword: e.target.value})} 
                      className="flex-1 px-4 py-3.5 bg-transparent border-none outline-none text-sm font-bold text-gray-700 placeholder:text-gray-300" 
                      placeholder="••••••••" 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assign Role</label>
                  <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl focus-within:ring-4 focus-within:ring-green-50 focus-within:border-[#1abc60] transition-all group">
                    <div className="pl-4 text-gray-400 group-focus-within:text-[#1abc60]">
                      <Shield className="w-4 h-4" />
                    </div>
                    <select 
                      value={newUser.role} 
                      onChange={e => setNewUser({...newUser, role: e.target.value})} 
                      className="flex-1 px-4 py-3.5 bg-transparent border-none outline-none text-sm font-bold text-gray-700 appearance-none cursor-pointer"
                    >
                      {roles.map(r => <option key={r._id} value={r.name}>{r.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  disabled={isCreating} 
                  type="submit" 
                  className="w-full bg-[#1abc60] text-white py-4 rounded-2xl font-black shadow-xl shadow-green-100 flex items-center justify-center gap-3 hover:bg-[#16a085] transition-all text-sm uppercase tracking-widest active:scale-[0.98] disabled:opacity-50"
                >
                  {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> Create Account</>}
                </button>
              </div>
            </form>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
}

function UserRow({ 
  user, 
  isSuperadmin, 
  roles, 
  availablePermissions, 
  isUpdating, 
  onUpdate, 
  onDelete, 
  onImpersonate,
  isCurrentUser 
}: { 
  user: User, 
  isSuperadmin: boolean, 
  roles: Role[], 
  availablePermissions: Permission[],
  isUpdating: boolean,
  onUpdate: (id: string, data: any) => void,
  onDelete: (id: string) => void,
  onImpersonate: (id: string) => void,
  isCurrentUser: boolean
}) {
  const [isEditing, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    permissions: user.permissions || [],
    isActive: user.isActive,
    profilePhoto: user.profilePhoto || '',
    photoFile: null as File | null,
    password: '',
    confirmPassword: ''
  });

  const hasChanged = JSON.stringify({
    name: editData.name,
    email: editData.email,
    phone: editData.phone,
    role: editData.role,
    permissions: editData.permissions,
    isActive: editData.isActive,
    profilePhoto: editData.profilePhoto
  }) !== JSON.stringify({
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    permissions: user.permissions || [],
    isActive: user.isActive,
    profilePhoto: user.profilePhoto || ''
  }) || (editData.password !== '');

  const togglePermission = (slug: string) => {
    setEditData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(slug)
        ? prev.permissions.filter(p => p !== slug)
        : [...prev.permissions, slug]
    }));
  };

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5001';
    return `${baseUrl}${path}`;
  };

  return (
    <>
      <tr className={`hover:bg-gray-50 transition-colors ${!user.isActive ? 'bg-gray-50/50' : ''}`}>
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100">
              {user.profilePhoto ? (
                <img src={getImageUrl(user.profilePhoto)} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full flex items-center justify-center font-bold ${user.isActive ? 'bg-green-50 text-[#1abc60]' : 'bg-gray-100 text-gray-400'}`}>
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <div className={`text-sm font-black ${user.isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                {user.name} {isCurrentUser && <span className="text-xs text-[#1abc60] font-normal">(You)</span>}
              </div>
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{user.email}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            user.role === 'superadmin' ? 'bg-purple-100 text-purple-600' :
            user.role === 'admin' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
          }`}>
            {user.role}
          </span>
        </td>
        <td className="px-6 py-4">
          <div className="text-xs text-gray-600 font-medium">{user.phone || 'N/A'}</div>
        </td>
        <td className="px-6 py-4">
          <div className="text-xs text-gray-600 font-medium">{user.createdBy?.name || 'System'}</div>
        </td>
        <td className="px-6 py-4">
          <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full border uppercase ${
            user.isActive 
              ? 'text-green-600 bg-green-50 border-green-100' 
              : 'text-red-600 bg-red-50 border-red-100'
          }`}>
            {user.isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            {user.isActive ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td className="px-6 py-4">
          {!isCurrentUser && (
            <div className="flex gap-2">
              {isSuperadmin && (
                <button 
                  onClick={() => onImpersonate(user._id)} 
                  className="p-2 text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors shadow-sm"
                  title="Login as User"
                >
                  <LogIn className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => setIsModalOpen(true)} className="p-2 text-white bg-[#1abc60] hover:bg-[#16a085] rounded-lg transition-colors shadow-sm"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => onDelete(user._id)} className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm"><Trash2 className="w-4 h-4" /></button>
            </div>
          )}
        </td>
      </tr>

      {/* Edit User Modal */}
      {isEditing && createPortal(
        <div className="fixed inset-0 bg-[#1e293b]/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md text-left">
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            className="bg-white rounded-[40px] w-full max-w-2xl h-[90vh] shadow-2xl overflow-hidden border border-white/20 flex flex-col"
          >
            <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
              <div>
                <h3 className="text-3xl font-black text-[#1e293b]">Edit User Details</h3>
                <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mt-2">Update profile and permissions</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all text-gray-400 hover:text-gray-600 active:scale-95"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-10 space-y-8 overflow-y-auto flex-1 custom-scrollbar text-left">
              <div className="flex flex-col items-center justify-center pb-4">
                <div 
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e: any) => {
                      const file = e.target.files[0];
                      if (file) {
                        setEditData(prev => ({ ...prev, photoFile: file, profilePhoto: file.name }));
                      }
                    };
                    input.click();
                  }}
                  className="relative group cursor-pointer"
                >
                  <div className="w-32 h-32 rounded-[32px] bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-[#1abc60] group-hover:bg-green-50/30">
                    {editData.photoFile ? (
                      <img src={URL.createObjectURL(editData.photoFile)} alt="Preview" className="w-full h-full object-cover" />
                    ) : editData.profilePhoto ? (
                      <img src={getImageUrl(editData.profilePhoto)} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Camera className="w-8 h-8 text-gray-300 group-hover:text-[#1abc60] transition-colors" />
                        <span className="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-widest group-hover:text-[#1abc60]">Change Photo</span>
                      </>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 p-2 bg-[#1abc60] text-white rounded-xl shadow-lg shadow-green-100 group-hover:scale-110 transition-transform">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl focus-within:ring-4 focus-within:ring-green-50 focus-within:border-[#1abc60] transition-all group">
                    <div className="pl-4 text-gray-400 group-focus-within:text-[#1abc60]">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input 
                      value={editData.name} 
                      onChange={e => setEditData({...editData, name: e.target.value})} 
                      className="flex-1 px-4 py-3.5 bg-transparent border-none outline-none text-sm font-bold text-gray-700" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl focus-within:ring-4 focus-within:ring-green-50 focus-within:border-[#1abc60] transition-all group">
                    <div className="pl-4 text-gray-400 group-focus-within:text-[#1abc60]">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input 
                      value={editData.phone} 
                      onChange={e => setEditData({...editData, phone: e.target.value})} 
                      className="flex-1 px-4 py-3.5 bg-transparent border-none outline-none text-sm font-bold text-gray-700" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-2xl focus-within:ring-4 focus-within:ring-green-50 focus-within:border-[#1abc60] transition-all group">
                  <div className="pl-4 text-gray-400 group-focus-within:text-[#1abc60]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input 
                    value={editData.email} 
                    onChange={e => setEditData({...editData, email: e.target.value})} 
                    className="flex-1 px-4 py-3.5 bg-transparent border-none outline-none text-sm font-bold text-gray-700" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assign Role</label>
                  <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl focus-within:ring-4 focus-within:ring-green-50 focus-within:border-[#1abc60] transition-all group">
                    <div className="pl-4 text-gray-400 group-focus-within:text-[#1abc60]">
                      <Shield className="w-4 h-4" />
                    </div>
                    <select 
                      value={editData.role} 
                      onChange={e => setEditData({...editData, role: e.target.value as any})} 
                      className="flex-1 px-4 py-3.5 bg-transparent border-none outline-none text-sm font-bold text-gray-700 appearance-none cursor-pointer"
                    >
                      {roles.map(r => <option key={r._id} value={r.name}>{r.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Status</span>
                  <span className={`text-xs font-bold mt-0.5 ${editData.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    Currently {editData.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <button 
                  onClick={() => setEditData({...editData, isActive: !editData.isActive})} 
                  className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    editData.isActive 
                      ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100' 
                      : 'bg-green-50 text-green-600 border border-green-100 hover:bg-green-100'
                  }`}
                >
                  {editData.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Specific Permissions</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-4 bg-gray-50 rounded-2xl border border-gray-100 custom-scrollbar">
                  {availablePermissions.map(p => (
                    <label key={p._id} className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                      editData.permissions.includes(p.slug) 
                        ? 'bg-white border-[#1abc60] text-[#1abc60] shadow-sm' 
                        : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                    }`}>
                      <input 
                        type="checkbox" 
                        checked={editData.permissions.includes(p.slug)} 
                        onChange={() => togglePermission(p.slug)}
                        className="accent-[#1abc60] w-4 h-4"
                      />
                      <span className="text-[10px] font-black uppercase tracking-tight">{p.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Security Updates</p>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-2xl focus-within:ring-4 focus-within:ring-green-50 focus-within:border-[#1abc60] transition-all group">
                      <div className="pl-4 text-gray-400 group-focus-within:text-[#1abc60]">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input 
                        type="password" 
                        value={editData.password} 
                        onChange={e => setEditData({...editData, password: e.target.value})} 
                        className="flex-1 px-4 py-3.5 bg-transparent border-none outline-none text-sm font-bold text-gray-700 placeholder:text-gray-300" 
                        placeholder="••••••••" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm Password</label>
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-2xl focus-within:ring-4 focus-within:ring-green-50 focus-within:border-[#1abc60] transition-all group">
                      <div className="pl-4 text-gray-400 group-focus-within:text-[#1abc60]">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input 
                        type="password" 
                        value={editData.confirmPassword} 
                        onChange={e => setEditData({...editData, confirmPassword: e.target.value})} 
                        className="flex-1 px-4 py-3.5 bg-transparent border-none outline-none text-sm font-bold text-gray-700 placeholder:text-gray-300" 
                        placeholder="••••••••" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={() => {
                    if (editData.password && editData.password !== editData.confirmPassword) {
                      return toast.error('Passwords do not match');
                    }
                    onUpdate(user._id, editData);
                    setIsModalOpen(false);
                    setEditData(prev => ({ ...prev, password: '', confirmPassword: '' }));
                  }} 
                  disabled={!hasChanged || isUpdating} 
                  className="w-full bg-[#1abc60] text-white py-4 rounded-2xl font-black shadow-xl shadow-green-100 flex items-center justify-center gap-3 hover:bg-[#16a085] transition-all text-sm uppercase tracking-widest active:scale-[0.98] disabled:opacity-50"
                >
                  {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Update Account</>}
                </button>
              </div>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </>
  );
}
