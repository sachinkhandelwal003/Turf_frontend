"use client";

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/app/context/AuthContext';
import { Search, Shield, User as UserIcon, Loader2, Check, AlertCircle, Save, X, Plus, Trash2, Mail, Phone, Lock, UserPlus, Edit2, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
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
        <Loader2 className="w-8 h-8 animate-spin text-[#1abc60]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">View and manage users, roles, and account permissions</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[#1abc60] text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium hover:bg-[#17a554] transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" /> Add User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Created By</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
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
                  isCurrentUser={u._id === currentUser?.id}
                />
              ))}
              {currentUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">{indexOfFirstItem + 1}</span> to <span className="font-medium text-gray-900">{Math.min(indexOfLastItem, filteredUsers.length)}</span> of <span className="font-medium text-gray-900">{filteredUsers.length}</span> Users
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex gap-1 px-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`min-w-[32px] h-8 rounded-md text-sm font-medium transition-colors ${
                      currentPage === i + 1 
                        ? "bg-[#1abc60] text-white border border-[#1abc60]" 
                        : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 bg-gray-900/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.98 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] shadow-xl flex flex-col overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Create New User</h3>
                <p className="text-sm text-gray-500 mt-0.5">Add a new member to your team</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              {/* Photo Upload */}
              <div className="flex flex-col items-center justify-center pb-2">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group cursor-pointer"
                >
                  <div className="w-24 h-24 rounded-full bg-gray-100 border border-gray-300 flex flex-col items-center justify-center overflow-hidden transition-colors group-hover:border-[#1abc60]">
                    {photoFile ? (
                      <img src={URL.createObjectURL(photoFile)} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Camera className="w-6 h-6 text-gray-400 group-hover:text-[#1abc60] transition-colors" />
                        <span className="text-[10px] font-medium text-gray-500 mt-1">Upload</span>
                      </>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 p-1.5 bg-white border border-gray-200 text-gray-600 rounded-full shadow-sm group-hover:text-[#1abc60]">
                    <Plus className="w-3.5 h-3.5" />
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      required 
                      value={newUser.name} 
                      onChange={e => setNewUser({...newUser, name: e.target.value})} 
                      className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] text-sm text-gray-900 transition-colors" 
                      placeholder="John Doe" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      required 
                      value={newUser.phone} 
                      onChange={e => setNewUser({...newUser, phone: e.target.value})} 
                      className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] text-sm text-gray-900 transition-colors" 
                      placeholder="9876543210" 
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    required 
                    type="email" 
                    value={newUser.email} 
                    onChange={e => setNewUser({...newUser, email: e.target.value})} 
                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] text-sm text-gray-900 transition-colors" 
                    placeholder="john@example.com" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      required 
                      type="password" 
                      value={newUser.password} 
                      onChange={e => setNewUser({...newUser, password: e.target.value})} 
                      className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] text-sm text-gray-900 transition-colors" 
                      placeholder="••••••••" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      required 
                      type="password" 
                      value={newUser.confirmPassword} 
                      onChange={e => setNewUser({...newUser, confirmPassword: e.target.value})} 
                      className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] text-sm text-gray-900 transition-colors" 
                      placeholder="••••••••" 
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Role</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select 
                    value={newUser.role} 
                    onChange={e => setNewUser({...newUser, role: e.target.value})} 
                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] text-sm text-gray-900 appearance-none transition-colors cursor-pointer"
                  >
                    {roles.map(r => <option key={r._id} value={r.name} className="capitalize">{r.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-200 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  disabled={isCreating} 
                  type="submit" 
                  className="px-6 py-2.5 bg-[#1abc60] text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#17a554] transition-colors shadow-sm disabled:opacity-50"
                >
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Create Account
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

function UserRow({ user, isSuperadmin, roles, availablePermissions, isUpdating, onUpdate, onDelete, isCurrentUser }: { 
  user: User, 
  isSuperadmin: boolean, 
  roles: Role[],
  availablePermissions: Permission[],
  isUpdating: boolean,
  onUpdate: (id: string, data: any) => void,
  onDelete: (id: string) => void,
  isCurrentUser: boolean
}) {
  const [isEditing, setIsEditing] = useState(false);
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
      <tr className={`hover:bg-gray-50/50 transition-colors ${!user.isActive ? 'bg-gray-50/50 opacity-75' : ''}`}>
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shrink-0">
              {user.profilePhoto ? (
                <img src={getImageUrl(user.profilePhoto)} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-semibold text-gray-500 bg-gray-100">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">
                {user.name} {isCurrentUser && <span className="text-xs text-[#1abc60] font-medium ml-1 bg-green-50 px-1.5 py-0.5 rounded">(You)</span>}
              </div>
              <div className="text-xs text-gray-500 truncate">{user.email}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <span className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize border ${
            user.role === 'superadmin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
            user.role === 'admin' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-700 border-gray-200'
          }`}>
            {user.role}
          </span>
        </td>
        <td className="px-6 py-4">
          <div className="text-sm text-gray-600">{user.phone || '-'}</div>
        </td>
        <td className="px-6 py-4">
          <div className="text-sm text-gray-600">{user.createdBy?.name || 'System'}</div>
        </td>
        <td className="px-6 py-4">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
            user.isActive 
              ? 'text-green-700 bg-green-50 border-green-200' 
              : 'text-red-700 bg-red-50 border-red-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
            {user.isActive ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td className="px-6 py-4 text-right">
          {!isCurrentUser && (
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setIsEditing(true)} 
                className="p-1.5 text-gray-400 hover:text-[#1abc60] hover:bg-green-50 rounded-md transition-colors border border-transparent hover:border-green-100"
                title="Edit User"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onDelete(user._id)} 
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors border border-transparent hover:border-red-100"
                title="Delete User"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </td>
      </tr>

      {/* Edit User Modal */}
      {isEditing && createPortal(
        <div className="fixed inset-0 bg-gray-900/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm text-left">
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.98 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] shadow-xl flex flex-col overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Edit User Details</h3>
                <p className="text-sm text-gray-500 mt-0.5">Update profile and permissions</p>
              </div>
              <button 
                onClick={() => setIsEditing(false)} 
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              {/* Photo Upload */}
              <div className="flex flex-col items-center justify-center pb-2">
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
                  <div className="w-24 h-24 rounded-full bg-gray-100 border border-gray-300 flex flex-col items-center justify-center overflow-hidden transition-colors group-hover:border-[#1abc60]">
                    {editData.photoFile ? (
                      <img src={URL.createObjectURL(editData.photoFile)} alt="Preview" className="w-full h-full object-cover" />
                    ) : editData.profilePhoto ? (
                      <img src={getImageUrl(editData.profilePhoto)} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Camera className="w-6 h-6 text-gray-400 group-hover:text-[#1abc60] transition-colors" />
                        <span className="text-[10px] font-medium text-gray-500 mt-1">Change</span>
                      </>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 p-1.5 bg-white border border-gray-200 text-gray-600 rounded-full shadow-sm group-hover:text-[#1abc60]">
                    <Edit2 className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      value={editData.name} 
                      onChange={e => setEditData({...editData, name: e.target.value})} 
                      className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] text-sm text-gray-900 transition-colors" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      value={editData.phone} 
                      onChange={e => setEditData({...editData, phone: e.target.value})} 
                      className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] text-sm text-gray-900 transition-colors" 
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    value={editData.email} 
                    onChange={e => setEditData({...editData, email: e.target.value})} 
                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] text-sm text-gray-900 transition-colors" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Role</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select 
                    value={editData.role} 
                    onChange={e => setEditData({...editData, role: e.target.value as any})} 
                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] text-sm text-gray-900 appearance-none cursor-pointer transition-colors"
                  >
                    {roles.map(r => <option key={r._id} value={r.name} className="capitalize">{r.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Account Status</h4>
                  <p className={`text-xs mt-0.5 font-medium ${editData.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    Currently {editData.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <button 
                  onClick={() => setEditData({...editData, isActive: !editData.isActive})} 
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1abc60] focus:ring-offset-2 ${editData.isActive ? 'bg-[#1abc60]' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editData.isActive ? 'translate-x-6' : 'translate-x-1'}`}></span>
                </button>
              </div>

              {/* Specific Permissions */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Specific Permissions</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-4 bg-gray-50 rounded-lg border border-gray-200 custom-scrollbar">
                  {availablePermissions.map(p => (
                    <label key={p._id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      editData.permissions.includes(p.slug) 
                        ? 'bg-white border-[#1abc60] text-[#1abc60] shadow-sm' 
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}>
                      <input 
                        type="checkbox" 
                        checked={editData.permissions.includes(p.slug)} 
                        onChange={() => togglePermission(p.slug)}
                        className="mt-0.5 accent-[#1abc60] w-4 h-4 rounded border-gray-300 text-[#1abc60] focus:ring-[#1abc60]"
                      />
                      <span className="text-sm font-medium">{p.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Password Updates */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900">Security Updates</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="password" 
                        value={editData.password} 
                        onChange={e => setEditData({...editData, password: e.target.value})} 
                        className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] text-sm text-gray-900 transition-colors" 
                        placeholder="Leave blank to keep current" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="password" 
                        value={editData.confirmPassword} 
                        onChange={e => setEditData({...editData, confirmPassword: e.target.value})} 
                        className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] text-sm text-gray-900 transition-colors" 
                        placeholder="••••••••" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 mt-2 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsEditing(false);
                    setEditData(prev => ({ ...prev, password: '', confirmPassword: '' }));
                  }}
                  className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    if (editData.password && editData.password !== editData.confirmPassword) {
                      return toast.error('Passwords do not match');
                    }
                    onUpdate(user._id, editData);
                    setIsEditing(false);
                    setEditData(prev => ({ ...prev, password: '', confirmPassword: '' }));
                  }} 
                  disabled={!hasChanged || isUpdating} 
                  className="px-6 py-2.5 bg-[#1abc60] text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#17a554] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Update Account
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