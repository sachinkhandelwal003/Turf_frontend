"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Search, Shield, User as UserIcon, Loader2, Check, AlertCircle, Save, X, Plus, Trash2, Mail, Phone, Lock, UserPlus, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
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
    role: 'user'
  });
  const [isCreating, setIsCreating] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        api.get('/auth/users'),
        api.get('/auth/roles')
      ]);

      if (usersRes.data.success) setUsers(usersRes.data.users);
      if (rolesRes.data.success) setRoles(rolesRes.data.roles);
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
      
      const res = await api.post('/auth/users', {
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        password: newUser.password,
        role: newUser.role,
        permissions
      });

      if (res.data.success) {
        setUsers([...users, res.data.user]);
        setShowAddModal(false);
        setNewUser({ name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'user' });
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
      // Create a copy of the data to modify
      const dataToSend = { ...updateData };
      
      // If password is empty, remove it so we don't send it to the backend
      if (!dataToSend.password) {
        delete dataToSend.password;
        delete dataToSend.confirmPassword;
      }

      // If role changed, update permissions accordingly
      if (dataToSend.role) {
        const selectedRole = roles.find(r => r.name === dataToSend.role);
        dataToSend.permissions = selectedRole ? selectedRole.permissions : [];
      }

      const response = await api.put(`/auth/users/${userId}/rbac`, dataToSend);
      
      if (response.data.success) {
        setUsers(users.map(u => u._id === userId ? response.data.user : u));
        toast.success(`User updated successfully`);
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
          <p className="text-gray-500">View and manage system users, roles, and account status</p>
        </div>
        {isSuperadmin && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-[#1abc60] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-black hover:bg-[#16a085] transition-all shadow-lg shadow-green-100 active:scale-95"
          >
            <UserPlus className="w-4 h-4" /> <span>Add User</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-[#1abc60] transition-all">
            <div className="pl-3 pr-1 text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 bg-transparent border-none outline-none transition-all text-sm font-medium focus:ring-0"
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
                <th className="px-6 py-4">Status</th>
                {isSuperadmin && <th className="px-6 py-4">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentUsers.map((u) => (
                <UserRow 
                  key={u._id} 
                  user={u} 
                  isSuperadmin={isSuperadmin} 
                  roles={roles}
                  isUpdating={updatingId === u._id}
                  onUpdate={handleUpdateUser}
                  onDelete={handleDeleteUser}
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
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Create New User</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-[#1abc60] transition-all">
                  <div className="pl-3 pr-1 text-gray-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input 
                    required 
                    value={newUser.name} 
                    onChange={e => setNewUser({...newUser, name: e.target.value})} 
                    className="flex-1 px-3 py-2 bg-transparent border-none outline-none transition-all text-sm font-medium focus:ring-0" 
                    placeholder="John Doe" 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Email Address</label>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-[#1abc60] transition-all">
                  <div className="pl-3 pr-1 text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input 
                    required 
                    type="email" 
                    value={newUser.email} 
                    onChange={e => setNewUser({...newUser, email: e.target.value})} 
                    className="flex-1 px-3 py-2 bg-transparent border-none outline-none transition-all text-sm font-medium focus:ring-0" 
                    placeholder="john@example.com" 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Phone Number</label>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-[#1abc60] transition-all">
                  <div className="pl-3 pr-1 text-gray-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input 
                    required 
                    value={newUser.phone} 
                    onChange={e => setNewUser({...newUser, phone: e.target.value})} 
                    className="flex-1 px-3 py-2 bg-transparent border-none outline-none transition-all text-sm font-medium focus:ring-0" 
                    placeholder="9876543210" 
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Initial Password</label>
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-[#1abc60] transition-all">
                    <div className="pl-3 pr-1 text-gray-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input 
                      required 
                      type="password" 
                      value={newUser.password} 
                      onChange={e => setNewUser({...newUser, password: e.target.value})} 
                      className="flex-1 px-3 py-2 bg-transparent border-none outline-none transition-all text-sm font-medium focus:ring-0" 
                      placeholder="••••••••" 
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Confirm Password</label>
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-[#1abc60] transition-all">
                    <div className="pl-3 pr-1 text-gray-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input 
                      required 
                      type="password" 
                      value={newUser.confirmPassword} 
                      onChange={e => setNewUser({...newUser, confirmPassword: e.target.value})} 
                      className="flex-1 px-3 py-2 bg-transparent border-none outline-none transition-all text-sm font-medium focus:ring-0" 
                      placeholder="••••••••" 
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Assign Role</label>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-[#1abc60] transition-all">
                  <div className="pl-3 pr-1 text-gray-400">
                    <Shield className="w-4 h-4" />
                  </div>
                  <select 
                    value={newUser.role} 
                    onChange={e => setNewUser({...newUser, role: e.target.value})} 
                    className="flex-1 px-3 py-2 bg-transparent border-none outline-none transition-all text-sm font-medium focus:ring-0 appearance-none"
                  >
                    {roles.map(r => <option key={r._id} value={r.name}>{r.name}</option>)}
                  </select>
                </div>
              </div>
              <button disabled={isCreating} type="submit" className="w-full bg-[#1abc60] text-white py-3 rounded-xl font-black shadow-lg shadow-green-100 flex items-center justify-center gap-2 hover:bg-[#16a085] transition-all text-sm">
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Create User Account</>}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function UserRow({ user, isSuperadmin, roles, isUpdating, onUpdate, onDelete, isCurrentUser }: { 
  user: User, 
  isSuperadmin: boolean, 
  roles: Role[],
  isUpdating: boolean,
  onUpdate: (id: string, data: any) => void,
  onDelete: (id: string) => void,
  isCurrentUser: boolean
}) {
  const [isEditing, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
    password: '',
    confirmPassword: ''
  });

  const hasChanged = JSON.stringify({
    name: editData.name,
    email: editData.email,
    phone: editData.phone,
    role: editData.role,
    isActive: editData.isActive
  }) !== JSON.stringify({
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive
  }) || (editData.password !== '');

  return (
    <tr className={`hover:bg-gray-50 transition-colors ${!user.isActive ? 'bg-gray-50/50' : ''}`}>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${user.isActive ? 'bg-green-50 text-[#1abc60]' : 'bg-gray-100 text-gray-400'} rounded-full flex items-center justify-center font-bold border border-gray-100`}>
            {user.name.charAt(0)}
          </div>
          <div>
            <div className={`font-bold ${user.isActive ? 'text-gray-900' : 'text-gray-400'}`}>
              {user.name} {isCurrentUser && <span className="text-xs text-[#1abc60] font-normal">(You)</span>}
            </div>
            <div className="text-xs text-gray-500">{user.email}</div>
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
        <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full border uppercase ${
          user.isActive 
            ? 'text-green-600 bg-green-50 border-green-100' 
            : 'text-red-600 bg-red-50 border-red-100'
        }`}>
          {user.isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      {isSuperadmin && (
        <td className="px-6 py-4">
          {!isCurrentUser && (
            <div className="flex gap-2">
              <button onClick={() => setIsModalOpen(true)} className="p-2 text-white bg-[#1abc60] hover:bg-[#16a085] rounded-lg transition-colors shadow-sm"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => onDelete(user._id)} className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm"><Trash2 className="w-4 h-4" /></button>
            </div>
          )}
        </td>
      )}

      {/* Edit User Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm text-left">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Edit User Details</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-[#1abc60] transition-all">
                  <div className="pl-3 pr-1 text-gray-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input 
                    value={editData.name} 
                    onChange={e => setEditData({...editData, name: e.target.value})} 
                    className="flex-1 px-3 py-2 bg-transparent border-none outline-none transition-all text-sm font-medium focus:ring-0" 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Email Address</label>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-[#1abc60] transition-all">
                  <div className="pl-3 pr-1 text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input 
                    value={editData.email} 
                    onChange={e => setEditData({...editData, email: e.target.value})} 
                    className="flex-1 px-3 py-2 bg-transparent border-none outline-none transition-all text-sm font-medium focus:ring-0" 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Phone Number</label>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-[#1abc60] transition-all">
                  <div className="pl-3 pr-1 text-gray-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input 
                    value={editData.phone} 
                    onChange={e => setEditData({...editData, phone: e.target.value})} 
                    className="flex-1 px-3 py-2 bg-transparent border-none outline-none transition-all text-sm font-medium focus:ring-0" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Role</label>
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-[#1abc60] transition-all">
                    <div className="pl-3 pr-1 text-gray-400">
                      <Shield className="w-4 h-4" />
                    </div>
                    <select 
                      value={editData.role} 
                      onChange={e => setEditData({...editData, role: e.target.value as any})} 
                      className="flex-1 px-3 py-2 bg-transparent border-none outline-none transition-all text-sm font-medium focus:ring-0 appearance-none"
                    >
                      {roles.map(r => <option key={r._id} value={r.name}>{r.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Account Status</label>
                  <button onClick={() => setEditData({...editData, isActive: !editData.isActive})} className={`w-full py-2 h-[42px] rounded-lg font-bold border transition-all ${editData.isActive ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                    {editData.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Change Password (Leave blank to keep current)</p>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">New Password</label>
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-[#1abc60] transition-all">
                    <div className="pl-3 pr-1 text-gray-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input 
                      type="password" 
                      value={editData.password} 
                      onChange={e => setEditData({...editData, password: e.target.value})} 
                      className="flex-1 px-3 py-2 bg-transparent border-none outline-none transition-all text-sm font-medium focus:ring-0" 
                      placeholder="••••••••" 
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Confirm New Password</label>
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-[#1abc60] transition-all">
                    <div className="pl-3 pr-1 text-gray-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input 
                      type="password" 
                      value={editData.confirmPassword} 
                      onChange={e => setEditData({...editData, confirmPassword: e.target.value})} 
                      className="flex-1 px-3 py-2 bg-transparent border-none outline-none transition-all text-sm font-medium focus:ring-0" 
                      placeholder="••••••••" 
                    />
                  </div>
                </div>
              </div>

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
                className="w-full bg-[#1abc60] text-white py-3 rounded-xl font-black shadow-lg shadow-green-100 flex items-center justify-center gap-2 hover:bg-[#16a085] transition-all text-sm"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </tr>
  );
}
