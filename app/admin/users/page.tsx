"use client";

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Search, Shield, ShieldCheck, Users, User as UserIcon, Loader2, Check, AlertCircle, Save, X, Plus, Trash2, Mail, Phone, Lock, UserPlus, Edit2, ChevronLeft, ChevronRight, Camera, Award, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/app/services/api';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import VenueForm from '@/app/components/admin/venues/VenueForm';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin' | 'superadmin';
  permissions: string[];
  isActive: boolean;
  coins?: number;
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
  const [turfs, setTurfs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // New User Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddTurfModal, setShowAddTurfModal] = useState(false);
  const [newUser, setNewUser] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    password: '', 
    confirmPassword: '',
    role: 'admin',
    profilePhoto: '',
    turfId: ''
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCreating, setIsCreating] = useState(false);
 
  // Edit User Form State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    permissions: [] as string[],
    isActive: true,
    profilePhoto: '',
    photoFile: null as File | null,
    password: '',
    confirmPassword: '',
    turfId: ''
  });
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, rolesRes, permsRes, turfsRes] = await Promise.all([
        api.get('/auth/users'),
        api.get('/auth/roles'),
        api.get('/auth/permissions'),
        api.get('/turfs/my/all')
      ]);

      if (usersRes.data.success) setUsers(usersRes.data.users);
      if (rolesRes.data.success) setRoles(rolesRes.data.roles);
      if (permsRes.data.success) setAvailablePermissions(permsRes.data.permissions);
      if (turfsRes.data?.success) setTurfs(turfsRes.data.turfs || []);
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

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      return toast.error("Please enter a valid email address.");
    }

    // Phone validation (minimum 10 digits)
    const digitsOnly = newUser.phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      return toast.error("Please enter a valid phone number (minimum 10 digits).");
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
      if (newUser.role === 'admin' && newUser.turfId) {
        formData.append('turfId', newUser.turfId);
      }
      
      if (photoFile) {
        formData.append('profilePhoto', photoFile);
      } else if (newUser.profilePhoto) {
        formData.append('profilePhoto', newUser.profilePhoto);
      }

      const res = await api.post('/auth/users', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        toast.success('Admin created successfully');
        fetchData();
        setShowAddModal(false);
        setNewUser({ 
          name: '', 
          email: '', 
          phone: '', 
          password: '', 
          confirmPassword: '', 
          role: 'admin',
          profilePhoto: '',
          turfId: ''
        });
        setPhotoFile(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.msg || 'Failed to create user');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This user account will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        const res = await api.delete(`/auth/users/${userId}`);
        if (res.data.success) {
          setUsers(users.filter(u => u._id !== userId));
          Swal.fire({
            title: "Deleted!",
            text: "User has been deleted.",
            icon: "success",
            confirmButtonColor: "#1abc60"
          });
        }
      } catch (error: any) {
        Swal.fire({
          title: "Error!",
          text: error.response?.data?.msg || "Failed to delete user",
          icon: "error",
          confirmButtonColor: "#1abc60"
        });
      }
    }
  };

  const handleEditClick = (user: User) => {
    const userTurf = turfs.find(t => t.owner?._id === user._id || t.owner === user._id);
    setEditingUser(user);
    setEditData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      permissions: user.permissions || [],
      isActive: user.isActive,
      profilePhoto: user.profilePhoto || '',
      photoFile: null,
      password: '',
      confirmPassword: '',
      turfId: userTurf ? userTurf._id : ''
    });
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    if (editData.password && editData.password !== editData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setUpdatingId(editingUser._id);
    try {
      const formData = new FormData();
      
      if (!editData.password) {
        delete (editData as any).password;
        delete (editData as any).confirmPassword;
      }

      if (editData.role) {
        const selectedRole = roles.find(r => r.name === editData.role);
        editData.permissions = selectedRole ? selectedRole.permissions : [];
      }

      Object.keys(editData).forEach(key => {
        if (key === 'permissions') {
          formData.append(key, JSON.stringify((editData as any)[key]));
        } else if (key === 'photoFile' && (editData as any)[key]) {
          formData.append('profilePhoto', (editData as any)[key]);
        } else if (key !== 'photoFile') {
          formData.append(key, (editData as any)[key]);
        }
      });

      const res = await api.put(`/auth/users/${editingUser._id}/rbac`, formData, {
         headers: { 'Content-Type': 'multipart/form-data' }
       });
      
      if (res.data.success) {
        toast.success('User updated successfully');
        fetchData();
        setEditingUser(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.msg || 'Failed to update user');
    } finally {
      setUpdatingId(null);
    }
  };

  const togglePermission = (slug: string) => {
    setEditData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(slug)
        ? prev.permissions.filter(p => p !== slug)
        : [...prev.permissions, slug]
    }));
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Derived Headcount Metrics
  const totalUsersCount = users.length;
  const adminCount = users.filter(u => u.role === 'admin' || u.role === 'superadmin').length;
  const regularUserCount = users.filter(u => u.role === 'user').length;

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5001';
    return `${baseUrl}${path}`;
  };

  const editingUserTurf = turfs.find(t => t.owner?._id === editingUser?._id || t.owner === editingUser?._id);
  const editingUserTurfId = editingUserTurf ? editingUserTurf._id : '';

  const editHasChanged = editingUser ? (
    JSON.stringify({
      name: editData.name,
      email: editData.email,
      phone: editData.phone,
      role: editData.role,
      permissions: editData.permissions,
      isActive: editData.isActive,
      profilePhoto: editData.profilePhoto,
      turfId: editData.turfId
    }) !== JSON.stringify({
      name: editingUser.name,
      email: editingUser.email,
      phone: editingUser.phone,
      role: editingUser.role,
      permissions: editingUser.permissions || [],
      isActive: editingUser.isActive,
      profilePhoto: editingUser.profilePhoto || '',
      turfId: editingUserTurfId
    }) || (editData.password !== '') || (editData.photoFile !== null)
  ) : false;

  if (loading) {
    return (
      <div className="!min-h-[60vh] !flex !items-center !justify-center">
        <Loader2 className="!w-10 !h-10 !animate-spin !text-[#1abc60]" />
      </div>
    );
  }

  return (
    <div className="!w-full !font-sans !bg-white !rounded-[24px] !border !border-slate-200/80 !shadow-sm !p-6 md:!p-8 !space-y-6">
      
      {/* Header Section */}
      <div className="!flex !flex-col sm:!flex-row sm:!items-center !justify-between !gap-4 !pb-6 !border-b !border-slate-100">
        <div>
          <h1 className="!text-2xl md:!text-3xl !font-black !text-slate-900 !tracking-tight !m-0 !mb-1.5">User Management</h1>
          <p className="!text-sm !font-medium !text-slate-500 !m-0">View and manage users, roles, and account permissions</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="!inline-flex !items-center !justify-center !gap-2 !rounded-xl !bg-[#1abc60] !px-6 !py-3.5 !text-sm !font-bold !text-white hover:!bg-[#169c4e] !transition-all !shadow-md hover:!shadow-lg hover:!shadow-[#1abc60]/20 !cursor-pointer !border-none !outline-none"
        >
          <UserPlus className="!w-4 !h-4 !shrink-0 !block" /> Add New Admin
        </button>
      </div>

      {/* --- HEADCOUNT METRICS CARDS --- */}
      <div className="!grid !grid-cols-1 md:!grid-cols-3 !gap-6">
        
        {/* Total Users */}
        <div className="!bg-slate-50/60 !p-6 !rounded-2xl !border !border-slate-100 !flex !items-center !gap-5 !group hover:!border-emerald-100 hover:!bg-emerald-50/20 !transition-all">
          <div className="!w-14 !h-14 !rounded-2xl !bg-emerald-50 !text-[#1abc60] !flex !items-center !justify-center !shrink-0 group-hover:!scale-110 !transition-transform !border !border-emerald-100">
            <Users className="!w-6 !h-6" />
          </div>
          <div>
            <p className="!text-[11px] !font-bold !text-slate-400 !uppercase !tracking-widest !m-0 !mb-1">Total Users</p>
            <h3 className="!text-3xl !font-black !text-slate-900 !m-0 !leading-none">{totalUsersCount}</h3>
          </div>
        </div>

        {/* Admins Count */}
        <div className="!bg-slate-50/60 !p-6 !rounded-2xl !border !border-slate-100 !flex !items-center !gap-5 !group hover:!border-blue-100 hover:!bg-blue-50/20 !transition-all">
          <div className="!w-14 !h-14 !rounded-2xl !bg-blue-50 !text-blue-600 !flex !items-center !justify-center !shrink-0 group-hover:!scale-110 !transition-transform !border !border-blue-100">
            <ShieldCheck className="!w-6 !h-6" />
          </div>
          <div>
            <p className="!text-[11px] !font-bold !text-slate-400 !uppercase !tracking-widest !m-0 !mb-1">Admins & Staff</p>
            <h3 className="!text-3xl !font-black !text-slate-900 !m-0 !leading-none">{adminCount}</h3>
          </div>
        </div>

        {/* Regular Users Count */}
        <div className="!bg-slate-50/60 !p-6 !rounded-2xl !border !border-slate-100 !flex !items-center !gap-5 !group hover:!border-orange-100 hover:!bg-orange-50/20 !transition-all">
          <div className="!w-14 !h-14 !rounded-2xl !bg-orange-50 !text-orange-500 !flex !items-center !justify-center !shrink-0 group-hover:!scale-110 !transition-transform !border !border-orange-100">
            <UserIcon className="!w-6 !h-6" />
          </div>
          <div>
            <p className="!text-[11px] !font-bold !text-slate-400 !uppercase !tracking-widest !m-0 !mb-1">Regular Customers</p>
            <h3 className="!text-3xl !font-black !text-slate-900 !m-0 !leading-none">{regularUserCount}</h3>
          </div>
        </div>

      </div>

      {/* Data Table Section */}
      <div className="!border !border-slate-200/60 !rounded-2xl !overflow-hidden">
        
        {/* Toolbar */}
        <div className="!p-5 md:!p-6 !border-b !border-slate-200 !bg-white">
          <div className="!relative !max-w-md">
            <Search className="!absolute !left-4 !top-1/2 !-translate-y-1/2 !w-4 !h-4 !text-slate-400 !z-10" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="!w-full !pl-11 !pr-4 !py-3.5 !bg-slate-50 hover:!bg-slate-100 !border !border-slate-200 focus:!bg-white focus:!outline-none focus:!border-[#1abc60] focus:!ring-1 focus:!ring-[#1abc60] !rounded-xl !text-sm !font-medium !text-slate-900 !transition-all placeholder:!text-slate-400"
            />
          </div>
        </div>

        {/* Table */}
        <div className="!overflow-x-auto !custom-scrollbar">
          <table className="!w-full !text-left !border-collapse !min-w-[900px]">
            <thead className="!bg-slate-50 !text-slate-500 !text-[10px] !font-black !uppercase !tracking-widest !border-b !border-slate-200">
              <tr>
                <th className="!px-6 md:!px-8 !py-4">User Details</th>
                <th className="!px-6 md:!px-8 !py-4">Role</th>
                <th className="!px-6 md:!px-8 !py-4">Coins</th>
                <th className="!px-6 md:!px-8 !py-4">Contact</th>
                <th className="!px-6 md:!px-8 !py-4">Status</th>
                <th className="!px-6 md:!px-8 !py-4 !text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="!divide-y !divide-slate-100">
              {currentUsers.map((u) => (
                <UserRow 
                  key={u._id} 
                  user={u} 
                  isCurrentUser={u._id === currentUser?.id}
                  onEdit={() => handleEditClick(u)}
                  onDelete={handleDeleteUser}
                  getImageUrl={getImageUrl}
                />
              ))}
              {currentUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="!px-6 !py-20 !text-center">
                    <div className="!w-16 !h-16 !bg-slate-50 !rounded-full !flex !items-center !justify-center !mx-auto !mb-4 !border !border-slate-200">
                      <Search className="!w-6 !h-6 !text-slate-400" />
                    </div>
                    <p className="!text-base !font-bold !text-slate-900 !m-0">No users found</p>
                    <p className="!text-sm !text-slate-500 !mt-1">Try adjusting your search query.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="!px-6 md:!px-8 !py-5 !border-t !border-slate-200 !flex !flex-col sm:!flex-row !items-center !justify-between !gap-4 !bg-white">
            <div className="!text-sm !font-medium !text-slate-500">
              Showing <span className="!font-bold !text-slate-900">{indexOfFirstItem + 1}</span> to <span className="!font-bold !text-slate-900">{Math.min(indexOfLastItem, filteredUsers.length)}</span> of <span className="!font-bold !text-slate-900">{filteredUsers.length}</span>
            </div>
            <div className="!flex !items-center !gap-1.5">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="!p-2 !rounded-xl !border !border-slate-200 !bg-white !text-slate-500 hover:!bg-slate-50 hover:!text-slate-700 disabled:!opacity-50 disabled:!cursor-not-allowed !transition-all !cursor-pointer"
              >
                <ChevronLeft className="!w-4 !h-4 !block !shrink-0" />
              </button>
              
              <div className="!flex !gap-1.5 !px-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`!min-w-[36px] !h-9 !rounded-xl !text-sm !font-bold !transition-all !cursor-pointer !border-none !outline-none ${
                      currentPage === i + 1 
                        ? "!bg-[#1abc60] !text-white !shadow-md" 
                        : "!bg-white !text-slate-600 !border !border-slate-200 hover:!bg-slate-50 hover:!border-slate-300"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="!p-2 !rounded-xl !border !border-slate-200 !bg-white !text-slate-500 hover:!bg-slate-50 hover:!text-slate-700 disabled:!opacity-50 disabled:!cursor-not-allowed !transition-all !cursor-pointer"
              >
                <ChevronRight className="!w-4 !h-4 !block !shrink-0" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* ADD USER MODAL                                            */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showAddModal && (
          <div className="!fixed !inset-0 !bg-slate-900/60 !z-[100] !flex !items-center !justify-center !p-4 !backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="!bg-white !rounded-[28px] !w-full !max-w-2xl !max-h-[90vh] !shadow-2xl !flex !flex-col !overflow-hidden !border !border-slate-200"
            >
              {/* Modal Header */}
              <div className="!px-6 md:!px-8 !py-5 !border-b !border-slate-200 !flex !justify-between !items-center !bg-white !shrink-0">
                <div className="!flex !items-center !gap-4">
                  <div className="!w-12 !h-12 !rounded-2xl !bg-emerald-50 !flex !items-center !justify-center !text-[#1abc60] !border !border-emerald-100">
                    <UserPlus className="!w-5 !h-5" />
                  </div>
                  <div>
                    <h3 className="!text-xl !font-bold !text-slate-900 !leading-tight !m-0">Create New Admin</h3>
                    <p className="!text-xs !text-slate-500 !font-medium !mt-0.5 !m-0">Add a new admin to your platform</p>
                  </div>
                </div>
                <div 
                  onClick={() => setShowAddModal(false)} 
                  className="!p-2.5 !text-slate-400 hover:!text-slate-600 hover:!bg-slate-100 !rounded-full !transition-colors !cursor-pointer"
                >
                  <X className="!w-5 !h-5 !block !shrink-0" />
                </div>
              </div>
              
              <form onSubmit={handleCreateUser} className="!flex !flex-col !flex-1 !overflow-hidden">
                <div className="!p-6 md:!p-8 !space-y-6 !overflow-y-auto !custom-scrollbar !bg-slate-50">
                  
                  {/* Photo Upload Area */}
                  <div className="!flex !flex-col !items-center !justify-center !p-8 !border-2 !border-dashed !border-slate-300 !rounded-[24px] !bg-white hover:!bg-slate-50 hover:!border-[#1abc60]/50 !transition-all !group">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="!relative !cursor-pointer"
                    >
                      <div className="!w-24 !h-24 !rounded-full !bg-slate-50 !border-4 !border-white !shadow-md !flex !items-center !justify-center !overflow-hidden !transition-all group-hover:!scale-105">
                        {photoFile ? (
                          <img src={URL.createObjectURL(photoFile)} alt="Preview" className="!w-full !h-full !object-cover" />
                        ) : (
                          <Camera className="!w-8 !h-8 !text-slate-300 group-hover:!text-[#1abc60] !transition-colors" />
                        )}
                      </div>
                      <div className="!absolute !bottom-0 !right-0 !p-2 !bg-[#1abc60] !text-white !rounded-full !shadow-lg !border-2 !border-white">
                        <Plus className="!w-3 !h-3" />
                      </div>
                    </div>
                    <p className="!text-[10px] !font-bold !text-slate-400 !uppercase !tracking-widest !mt-4 group-hover:!text-[#1abc60] !transition-colors">Upload Picture</p>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="!hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setPhotoFile(file);
                      }}
                    />
                  </div>

                  <div className="!bg-white !p-6 !rounded-[24px] !border !border-slate-200 !shadow-sm !space-y-5">
                    <div className="!grid !grid-cols-1 sm:!grid-cols-2 !gap-5">
                      <div className="!space-y-2">
                        <label className="!block !text-[11px] !font-bold !text-slate-500 !uppercase !tracking-wider">Full Name <span className="!text-red-500">*</span></label>
                        <div className="!relative">
                          <UserIcon className="!absolute !left-4 !top-1/2 !-translate-y-1/2 !w-4 !h-4 !text-slate-400 !z-10" />
                          <input 
                            required 
                            value={newUser.name} 
                            onChange={e => setNewUser({...newUser, name: e.target.value})} 
                            className="!w-full !pl-11 !pr-4 !py-3.5 !bg-slate-50 hover:!bg-slate-100 !border !border-transparent focus:!bg-white focus:!outline-none focus:!border-[#1abc60] focus:!ring-1 focus:!ring-[#1abc60] !text-sm !font-bold !text-slate-900 !rounded-xl !transition-all placeholder:!text-slate-400 placeholder:!font-medium" 
                            placeholder="John Doe" 
                          />
                        </div>
                      </div>

                      <div className="!space-y-2">
                        <label className="!block !text-[11px] !font-bold !text-slate-500 !uppercase !tracking-wider">Phone Number <span className="!text-red-500">*</span></label>
                        <div className="!relative">
                          <Phone className="!absolute !left-4 !top-1/2 !-translate-y-1/2 !w-4 !h-4 !text-slate-400 !z-10" />
                          <input 
                            required 
                            value={newUser.phone} 
                            onChange={e => {
                              const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                              setNewUser({...newUser, phone: val});
                            }} 
                            className="!w-full !pl-11 !pr-4 !py-3.5 !bg-slate-50 hover:!bg-slate-100 !border !border-transparent focus:!bg-white focus:!outline-none focus:!border-[#1abc60] focus:!ring-1 focus:!ring-[#1abc60] !text-sm !font-bold !text-slate-900 !rounded-xl !transition-all placeholder:!text-slate-400 placeholder:!font-medium" 
                            placeholder="9876543210" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="!space-y-2">
                      <label className="!block !text-[11px] !font-bold !text-slate-500 !uppercase !tracking-wider">Email Address <span className="!text-red-500">*</span></label>
                      <div className="!relative">
                        <Mail className="!absolute !left-4 !top-1/2 !-translate-y-1/2 !w-4 !h-4 !text-slate-400 !z-10" />
                        <input 
                          required 
                          type="email" 
                          value={newUser.email} 
                          onChange={e => setNewUser({...newUser, email: e.target.value})} 
                          className="!w-full !pl-11 !pr-4 !py-3.5 !bg-slate-50 hover:!bg-slate-100 !border !border-transparent focus:!bg-white focus:!outline-none focus:!border-[#1abc60] focus:!ring-1 focus:!ring-[#1abc60] !text-sm !font-bold !text-slate-900 !rounded-xl !transition-all placeholder:!text-slate-400 placeholder:!font-medium" 
                          placeholder="john@example.com" 
                        />
                      </div>
                    </div>

                    <div className="!grid !grid-cols-1 sm:!grid-cols-2 !gap-5">
                      <div className="!space-y-2">
                        <label className="!block !text-[11px] !font-bold !text-slate-500 !uppercase !tracking-wider">Password <span className="!text-red-500">*</span></label>
                        <div className="!relative">
                          <Lock className="!absolute !left-4 !top-1/2 !-translate-y-1/2 !w-4 !h-4 !text-slate-400 !z-10" />
                          <input 
                            required 
                            type="password" 
                            value={newUser.password} 
                            onChange={e => setNewUser({...newUser, password: e.target.value})} 
                            className="!w-full !pl-11 !pr-4 !py-3.5 !bg-slate-50 hover:!bg-slate-100 !border !border-transparent focus:!bg-white focus:!outline-none focus:!border-[#1abc60] focus:!ring-1 focus:!ring-[#1abc60] !text-sm !font-bold !text-slate-900 !rounded-xl !transition-all placeholder:!text-slate-400 placeholder:!font-medium" 
                            placeholder="••••••••" 
                          />
                        </div>
                      </div>

                      <div className="!space-y-2">
                        <label className="!block !text-[11px] !font-bold !text-slate-500 !uppercase !tracking-wider">Confirm Password <span className="!text-red-500">*</span></label>
                        <div className="!relative">
                          <Lock className="!absolute !left-4 !top-1/2 !-translate-y-1/2 !w-4 !h-4 !text-slate-400 !z-10" />
                          <input 
                            required 
                            type="password" 
                            value={newUser.confirmPassword} 
                            onChange={e => setNewUser({...newUser, confirmPassword: e.target.value})} 
                            className="!w-full !pl-11 !pr-4 !py-3.5 !bg-slate-50 hover:!bg-slate-100 !border !border-transparent focus:!bg-white focus:!outline-none focus:!border-[#1abc60] focus:!ring-1 focus:!ring-[#1abc60] !text-sm !font-bold !text-slate-900 !rounded-xl !transition-all placeholder:!text-slate-400 placeholder:!font-medium" 
                            placeholder="••••••••" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="!space-y-2 !pt-4 !border-t !border-slate-200">
                      <label className="!block !text-[11px] !font-bold !text-slate-500 !uppercase !tracking-wider">Assign Role</label>
                      <div className="!relative">
                        <Shield className="!absolute !left-4 !top-1/2 !-translate-y-1/2 !w-4 !h-4 !text-slate-400 !z-10" />
                        <select 
                          value={newUser.role} 
                          onChange={e => setNewUser({...newUser, role: e.target.value})} 
                          className="!w-full !pl-11 !pr-4 !py-3.5 !bg-slate-50 hover:!bg-slate-100 !border !border-transparent focus:!bg-white focus:!outline-none focus:!border-[#1abc60] focus:!ring-1 focus:!ring-[#1abc60] !text-sm !font-bold !text-slate-900 !appearance-none !cursor-pointer !rounded-xl !transition-all"
                        >
                          <option value="admin">Admin</option>
                        </select>
                        <ChevronDownIcon className="!absolute !right-4 !top-1/2 !-translate-y-1/2 !w-4 !h-4 !text-slate-400 !pointer-events-none" />
                      </div>
                    </div>

                    {newUser.role === 'admin' && (
                      <div className="!space-y-2 !pt-4 !border-t !border-slate-200">
                        <label className="!block !text-[11px] !font-bold !text-slate-500 !uppercase !tracking-wider">Assign Turf / Venue</label>
                        {newUser.turfId ? (
                          <div className="!flex !items-center !justify-between !p-4 !bg-emerald-50 !border !border-emerald-200 !rounded-xl">
                            <div className="!flex !items-center !gap-2">
                              <Check className="!w-4 !h-4 !text-[#1abc60]" />
                              <span className="!text-sm !font-bold !text-slate-900">
                                {turfs.find(t => t._id === newUser.turfId)?.name || 'New Turf'} Assigned
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setNewUser(prev => ({ ...prev, turfId: '' }))}
                              className="!text-xs !font-bold !text-red-500 hover:!underline !bg-transparent !border-none !cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowAddTurfModal(true)}
                            className="!w-full !flex !items-center !justify-center !gap-2 !rounded-xl !border-2 !border-dashed !border-slate-300 !bg-slate-50 hover:!border-[#1abc60] hover:!bg-emerald-50 hover:!text-[#1abc60] !px-4 !py-3 !text-sm !font-bold !text-slate-600 !transition-all !cursor-pointer"
                          >
                            <Plus className="!w-4 !h-4" /> Create & Assign New Turf
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="!px-6 md:!px-8 !py-5 !border-t !border-slate-200 !bg-white !flex !justify-end !gap-3 !shrink-0">
                  <div 
                    onClick={() => setShowAddModal(false)}
                    className="!px-6 !py-3 !bg-white !border !border-slate-200 !text-slate-600 !rounded-xl !text-sm !font-bold hover:!bg-slate-50 !transition-colors !cursor-pointer !inline-flex !items-center !justify-center"
                  >
                    Cancel
                  </div>
                  <button 
                    disabled={isCreating} 
                    type="submit" 
                    className="!px-8 !py-3 !bg-[#1abc60] !text-white !rounded-xl !text-sm !font-bold !flex !items-center !justify-center !gap-2 hover:!bg-[#169c4e] !transition-all !shadow-md disabled:!opacity-50 !cursor-pointer !border-none !outline-none"
                  >
                    {isCreating ? <Loader2 className="!w-4 !h-4 !animate-spin !block !shrink-0" /> : <Check className="!w-4 !h-4 !block !shrink-0" />}
                    Create Account
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* EDIT USER MODAL                                           */}
      {/* ========================================================= */}
      <AnimatePresence>
        {editingUser && (
          <div className="!fixed !inset-0 !bg-slate-900/60 !z-[100] !flex !items-center !justify-center !p-4 !backdrop-blur-sm !text-left">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="!bg-white !rounded-[28px] !w-full !max-w-2xl !max-h-[90vh] !shadow-2xl !flex !flex-col !overflow-hidden !border !border-slate-200"
            >
              {/* Modal Header */}
              <div className="!px-6 md:!px-8 !py-5 !border-b !border-slate-200 !flex !justify-between !items-center !bg-white !shrink-0">
                <div className="!flex !items-center !gap-4">
                  <div className="!w-12 !h-12 !rounded-2xl !bg-emerald-50 !flex !items-center !justify-center !text-[#1abc60] !border !border-emerald-100">
                    <Edit2 className="!w-5 !h-5" />
                  </div>
                  <div>
                    <h3 className="!text-xl !font-bold !text-slate-900 !leading-tight !m-0">Edit User Details</h3>
                    <p className="!text-xs !text-slate-500 !font-medium !mt-0.5 !m-0">Update profile and permissions</p>
                  </div>
                </div>
                <div 
                  onClick={() => setEditingUser(null)} 
                  className="!p-2.5 !text-slate-400 hover:!text-slate-600 hover:!bg-slate-100 !rounded-full !transition-colors !cursor-pointer"
                >
                  <X className="!w-5 !h-5 !block !shrink-0" />
                </div>
              </div>
              
              <form onSubmit={handleUpdateUser} className="!flex !flex-col !flex-1 !overflow-hidden">
                <div className="!p-6 md:!p-8 !space-y-6 !overflow-y-auto !flex-1 !custom-scrollbar !bg-slate-50">
                  
                  {/* Photo Upload Area */}
                  <div className="!flex !flex-col !items-center !justify-center !p-8 !border-2 !border-dashed !border-slate-300 !rounded-[24px] !bg-white hover:!bg-slate-50 hover:!border-[#1abc60]/50 !transition-all !group">
                    <div 
                      onClick={() => editFileInputRef.current?.click()}
                      className="!relative !cursor-pointer"
                    >
                      <div className="!w-24 !h-24 !rounded-full !bg-white !border-4 !border-white !shadow-md !flex !flex-col !items-center !justify-center !overflow-hidden !transition-all group-hover:!scale-105">
                        {editData.photoFile ? (
                          <img src={URL.createObjectURL(editData.photoFile)} alt="Preview" className="!w-full !h-full !object-cover" />
                        ) : editData.profilePhoto ? (
                          <img src={getImageUrl(editData.profilePhoto)} alt="Profile" className="!w-full !h-full !object-cover" />
                        ) : (
                          <Camera className="!w-8 !h-8 !text-slate-300 group-hover:!text-[#1abc60] !transition-colors" />
                        )}
                      </div>
                      <div className="!absolute !bottom-0 !right-0 !p-2 !bg-[#1abc60] !text-white !rounded-full !shadow-lg !border-2 !border-white">
                        <Edit2 className="!w-3 !h-3" />
                      </div>
                    </div>
                    <p className="!text-[10px] !font-bold !text-slate-400 !uppercase !tracking-widest !mt-4 group-hover:!text-[#1abc60] !transition-colors">Change Picture</p>
                    <input 
                      type="file" 
                      ref={editFileInputRef} 
                      className="!hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setEditData(prev => ({ ...prev, photoFile: file, profilePhoto: file.name }));
                      }}
                    />
                  </div>

                  <div className="!bg-white !p-6 !rounded-[24px] !border !border-slate-200 !shadow-sm !space-y-5">
                    <div className="!grid !grid-cols-1 sm:!grid-cols-2 !gap-5">
                      <div className="!space-y-2">
                        <label className="!block !text-[11px] !font-bold !text-slate-500 !uppercase !tracking-wider">Full Name</label>
                        <div className="!relative">
                          <UserIcon className="!absolute !left-4 !top-1/2 !-translate-y-1/2 !w-4 !h-4 !text-slate-400 !z-10" />
                          <input 
                            value={editData.name} 
                            onChange={e => setEditData({...editData, name: e.target.value})} 
                            className="!w-full !pl-11 !pr-4 !py-3.5 !bg-slate-50 hover:!bg-slate-100 !border !border-transparent focus:!bg-white focus:!outline-none focus:!border-[#1abc60] focus:!ring-1 focus:!ring-[#1abc60] !text-sm !font-bold !text-slate-900 !rounded-xl !transition-all" 
                          />
                        </div>
                      </div>

                      <div className="!space-y-2">
                        <label className="!block !text-[11px] !font-bold !text-slate-500 !uppercase !tracking-wider">Phone Number</label>
                        <div className="!relative">
                          <Phone className="!absolute !left-4 !top-1/2 !-translate-y-1/2 !w-4 !h-4 !text-slate-400 !z-10" />
                          <input 
                            value={editData.phone} 
                            onChange={e => {
                              const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                              setEditData({...editData, phone: val});
                            }} 
                            className="!w-full !pl-11 !pr-4 !py-3.5 !bg-slate-50 hover:!bg-slate-100 !border !border-transparent focus:!bg-white focus:!outline-none focus:!border-[#1abc60] focus:!ring-1 focus:!ring-[#1abc60] !text-sm !font-bold !text-slate-900 !rounded-xl !transition-all" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="!grid !grid-cols-1 sm:!grid-cols-2 !gap-5">
                      <div className="!space-y-2">
                        <label className="!block !text-[11px] !font-bold !text-slate-500 !uppercase !tracking-wider">Email Address</label>
                        <div className="!relative">
                          <Mail className="!absolute !left-4 !top-1/2 !-translate-y-1/2 !w-4 !h-4 !text-slate-400 !z-10" />
                          <input 
                            value={editData.email} 
                            onChange={e => setEditData({...editData, email: e.target.value})} 
                            className="!w-full !pl-11 !pr-4 !py-3.5 !bg-slate-50 hover:!bg-slate-100 !border !border-transparent focus:!bg-white focus:!outline-none focus:!border-[#1abc60] focus:!ring-1 focus:!ring-[#1abc60] !text-sm !font-bold !text-slate-900 !rounded-xl !transition-all" 
                          />
                        </div>
                      </div>

                      <div className="!space-y-2">
                        <label className="!block !text-[11px] !font-bold !text-slate-500 !uppercase !tracking-wider">Coin Balance</label>
                        <div className="!relative">
                          <Award className="!absolute !left-4 !top-1/2 !-translate-y-1/2 !w-4 !h-4 !text-amber-500 !z-10" />
                          <div className="!w-full !pl-11 !pr-4 !py-3.5 !bg-amber-50/50 !border !border-amber-200/50 !text-sm !text-amber-700 !font-bold !rounded-xl !flex !items-center">
                            {editingUser?.coins || 0} Coins Available
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="!grid !grid-cols-1 sm:!grid-cols-2 !gap-5 !pt-4 !border-t !border-slate-200">
                      <div className="!space-y-2">
                        <label className="!block !text-[11px] !font-bold !text-slate-500 !uppercase !tracking-wider">Assign Role</label>
                        <div className="!relative">
                          <Shield className="!absolute !left-4 !top-1/2 !-translate-y-1/2 !w-4 !h-4 !text-slate-400 !z-10" />
                          <select 
                            value={editData.role} 
                            onChange={e => setEditData({...editData, role: e.target.value as any})} 
                            className="!w-full !pl-11 !pr-4 !py-3.5 !bg-slate-50 hover:!bg-slate-100 !border !border-transparent focus:!bg-white focus:!outline-none focus:!border-[#1abc60] focus:!ring-1 focus:!ring-[#1abc60] !text-sm !font-bold !text-slate-900 !appearance-none !cursor-pointer !rounded-xl !transition-all"
                          >
                            {roles.map(r => <option key={r._id} value={r.name} className="capitalize">{r.name}</option>)}
                          </select>
                          <ChevronDownIcon className="!absolute !right-4 !top-1/2 !-translate-y-1/2 !w-4 !h-4 !text-slate-400 !pointer-events-none" />
                        </div>
                      </div>

                      {/* Status Toggle (Using DIVs) */}
                      <div className="!flex !items-center !justify-between !px-5 !py-3.5 !bg-slate-50 !rounded-xl !border !border-slate-200 !mt-[26px]">
                        <div>
                          <h4 className="!text-[11px] !font-bold !text-slate-500 !uppercase !tracking-wider !m-0">Account Status</h4>
                          <p className={`!text-sm !mt-0.5 !font-bold ${editData.isActive ? '!text-[#1abc60]' : '!text-red-500'} !m-0`}>
                            {editData.isActive ? 'Active User' : 'Deactivated'}
                          </p>
                        </div>
                        <div 
                          onClick={() => setEditData({...editData, isActive: !editData.isActive})} 
                          className={`!relative !inline-flex !h-7 !w-12 !items-center !rounded-full !cursor-pointer !transition-colors ${editData.isActive ? '!bg-[#1abc60]' : '!bg-slate-300'}`}
                        >
                          <span className={`!inline-block !h-5 !w-5 !transform !rounded-full !bg-white !transition-transform !shadow-sm ${editData.isActive ? '!translate-x-6' : '!translate-x-1'}`}></span>
                        </div>
                      </div>
                    </div>

                    {editData.role === 'admin' && (
                      <div className="!space-y-2 !pt-4 !border-t !border-slate-200">
                        <label className="!block !text-[11px] !font-bold !text-slate-500 !uppercase !tracking-wider">Assign Turf / Venue</label>
                        {editData.turfId ? (
                          <div className="!flex !items-center !justify-between !p-4 !bg-emerald-50 !border !border-emerald-200 !rounded-xl">
                            <div className="!flex !items-center !gap-2">
                              <Check className="!w-4 !h-4 !text-[#1abc60]" />
                              <span className="!text-sm !font-bold !text-slate-900">
                                {turfs.find(t => t._id === editData.turfId)?.name || 'New Turf'} Assigned
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setEditData(prev => ({ ...prev, turfId: '' }))}
                              className="!text-xs !font-bold !text-red-500 hover:!underline !bg-transparent !border-none !cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowAddTurfModal(true)}
                            className="!w-full !flex !items-center !justify-center !gap-2 !rounded-xl !border-2 !border-dashed !border-slate-300 !bg-slate-50 hover:!border-[#1abc60] hover:!bg-emerald-50 hover:!text-[#1abc60] !px-4 !py-3 !text-sm !font-bold !text-slate-600 !transition-all !cursor-pointer"
                          >
                            <Plus className="!w-4 !h-4" /> Create & Assign New Turf
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Specific Permissions (Tiles UI) */}
                  <div className="!bg-white !p-6 !rounded-[24px] !border !border-slate-200 !shadow-sm !space-y-4">
                    <label className="!block !text-[11px] !font-bold !text-slate-500 !uppercase !tracking-wider">Specific Permissions</label>
                    <div className="!grid !grid-cols-1 sm:!grid-cols-2 !gap-3 !max-h-60 !overflow-y-auto !pr-2 !custom-scrollbar">
                      {availablePermissions.map(p => {
                        const isSelected = editData.permissions.includes(p.slug);
                        return (
                          <div 
                            key={p._id} 
                            onClick={() => togglePermission(p.slug)}
                            className={`!flex !items-center !gap-3 !p-4 !rounded-xl !border !cursor-pointer !transition-all ${
                              isSelected 
                                ? '!bg-emerald-50/50 !border-[#1abc60] !shadow-sm' 
                                : '!bg-slate-50 !border-slate-200 hover:!border-slate-300'
                            }`}
                          >
                            <div className={`!w-5 !h-5 !rounded-md !border !flex !items-center !justify-center !transition-colors !shrink-0 ${
                              isSelected ? '!bg-[#1abc60] !border-[#1abc60]' : '!bg-white !border-slate-300'
                            }`}>
                              {isSelected && <Check className="!w-3 !h-3 !text-white" />}
                            </div>
                            <span className={`!text-sm !font-bold ${isSelected ? '!text-[#1abc60]' : '!text-slate-700'}`}>{p.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Password Updates */}
                  <div className="!bg-white !p-6 !rounded-[24px] !border !border-slate-200 !shadow-sm !space-y-5">
                    <div className="!flex !items-center !gap-2 !mb-1">
                      <div className="!w-8 !h-8 !rounded-lg !bg-slate-50 !flex !items-center !justify-center !border !border-slate-200">
                        <Lock className="!w-4 !h-4 !text-slate-500" />
                      </div>
                      <h4 className="!text-sm !font-bold !text-slate-900 !m-0">Security Updates</h4>
                    </div>
                    <div className="!grid !grid-cols-1 sm:!grid-cols-2 !gap-5">
                      <div className="!space-y-2">
                        <label className="!block !text-[11px] !font-bold !text-slate-500 !uppercase !tracking-wider">New Password</label>
                        <div className="!relative">
                          <Lock className="!absolute !left-4 !top-1/2 !-translate-y-1/2 !w-4 !h-4 !text-slate-400 !z-10" />
                          <input 
                            type="password" 
                            value={editData.password} 
                            onChange={e => setEditData({...editData, password: e.target.value})} 
                            className="!w-full !pl-11 !pr-4 !py-3.5 !bg-slate-50 hover:!bg-slate-100 !border !border-transparent focus:!bg-white focus:!outline-none focus:!border-[#1abc60] focus:!ring-1 focus:!ring-[#1abc60] !text-sm !font-bold !text-slate-900 !rounded-xl !transition-all placeholder:!text-slate-400 placeholder:!font-medium" 
                            placeholder="Leave blank to keep" 
                          />
                        </div>
                      </div>
                      <div className="!space-y-2">
                        <label className="!block !text-[11px] !font-bold !text-slate-500 !uppercase !tracking-wider">Confirm Password</label>
                        <div className="!relative">
                          <Lock className="!absolute !left-4 !top-1/2 !-translate-y-1/2 !w-4 !h-4 !text-slate-400 !z-10" />
                          <input 
                            type="password" 
                            value={editData.confirmPassword} 
                            onChange={e => setEditData({...editData, confirmPassword: e.target.value})} 
                            className="!w-full !pl-11 !pr-4 !py-3.5 !bg-slate-50 hover:!bg-slate-100 !border !border-transparent focus:!bg-white focus:!outline-none focus:!border-[#1abc60] focus:!ring-1 focus:!ring-[#1abc60] !text-sm !font-bold !text-slate-900 !rounded-xl !transition-all placeholder:!text-slate-400 placeholder:!font-medium" 
                            placeholder="••••••••" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Modal Footer */}
                <div className="!px-6 md:!px-8 !py-5 !border-t !border-slate-200 !bg-white !flex !justify-end !gap-3 !shrink-0">
                  <div 
                    onClick={() => {
                      setEditingUser(null);
                      setEditData(prev => ({ ...prev, password: '', confirmPassword: '' }));
                    }}
                    className="!px-6 !py-3 !bg-white !border !border-slate-200 !text-slate-600 !rounded-xl !text-sm !font-bold hover:!bg-slate-50 !transition-colors !cursor-pointer !inline-flex !items-center !justify-center"
                  >
                    Cancel
                  </div>
                  <button 
                    type="submit"
                    disabled={!editHasChanged || updatingId === editingUser._id} 
                    className="!px-8 !py-3 !bg-[#1abc60] !text-white !rounded-xl !text-sm !font-bold !flex !items-center !justify-center !gap-2 hover:!bg-[#169c4e] !transition-all !shadow-md disabled:!opacity-50 !cursor-pointer !border-none !outline-none"
                  >
                    {updatingId === editingUser._id ? <Loader2 className="!w-4 !h-4 !animate-spin !block !shrink-0" /> : <Save className="!w-4 !h-4 !block !shrink-0" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddTurfModal && (
          <div className="!fixed !inset-0 !bg-slate-900/60 !z-[110] !flex !items-center !justify-center !p-4 !backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="!bg-white !rounded-[28px] !w-full !max-w-5xl !max-h-[90vh] !shadow-2xl !flex !flex-col !overflow-hidden !border !border-slate-200"
            >
              <div className="!px-6 !py-4 !border-b !border-slate-200 !flex !justify-between !items-center !bg-white">
                <h3 className="!text-lg !font-bold !text-slate-900 !m-0">Create New Turf / Venue</h3>
                <div 
                  onClick={() => setShowAddTurfModal(false)}
                  className="!p-2 !text-slate-400 hover:!text-slate-600 !rounded-full !cursor-pointer"
                >
                  <X className="!w-5 !h-5" />
                </div>
              </div>
              <div className="!flex-1 !overflow-y-auto !custom-scrollbar">
                <VenueForm 
                  mode="add" 
                  onSuccess={(createdTurf) => {
                    fetchData();
                    if (editingUser) {
                      setEditData(prev => ({ ...prev, turfId: createdTurf._id }));
                    } else {
                      setNewUser(prev => ({ ...prev, turfId: createdTurf._id }));
                    }
                    setShowAddTurfModal(false);
                  }} 
                  onCancel={() => setShowAddTurfModal(false)}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// UserRow Component
function UserRow({ user, isCurrentUser, onEdit, onDelete, getImageUrl }: { 
  user: User, 
  isCurrentUser: boolean,
  onEdit: () => void,
  onDelete: (id: string) => void,
  getImageUrl: (path: string) => string
}) {
  return (
    <tr className={`hover:!bg-slate-50/80 !transition-colors !border-b !border-slate-100 last:!border-0 ${!user.isActive ? '!bg-slate-50/50 !opacity-75' : ''}`}>
      <td className="!px-6 md:!px-8 !py-4">
        <div className="!flex !items-center !gap-4 !min-w-0">
          <div className="!w-10 !h-10 !rounded-full !bg-emerald-50 !flex !items-center !justify-center !overflow-hidden !border !border-emerald-100 !shrink-0">
            {user.profilePhoto ? (
              <img src={getImageUrl(user.profilePhoto)} alt={user.name} className="!w-full !h-full !object-cover" />
            ) : (
              <div className="!w-full !h-full !flex !items-center !justify-center !font-black !text-base !text-[#1abc60]">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="!flex !flex-col !min-w-0">
            <div className="!text-sm !font-bold !text-slate-900 !truncate !flex !items-center !gap-2 !mb-0.5">
              {user.name} 
              {isCurrentUser && <span className="!text-[9px] !text-[#1abc60] !font-black !bg-emerald-50 !px-1.5 !py-0.5 !rounded !border !border-emerald-100 !uppercase !tracking-widest">You</span>}
            </div>
            <div className="!text-xs !font-medium !text-slate-500 !truncate">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="!px-6 md:!px-8 !py-4">
        <span className={`!inline-flex !px-2.5 !py-1 !rounded-full !text-[10px] !font-bold !uppercase !tracking-widest !border ${
          user.role === 'superadmin' ? '!bg-purple-50 !text-purple-700 !border-purple-200' :
          user.role === 'admin' ? '!bg-blue-50 !text-blue-700 !border-blue-200' : '!bg-slate-100 !text-slate-600 !border-slate-200'
        }`}>
          {user.role}
        </span>
      </td>
      <td className="!px-6 md:!px-8 !py-4">
        <div className="!flex !items-center !gap-1.5 !px-2.5 !py-1 !bg-amber-50 !rounded-lg !border !border-amber-100 !w-fit" title="Current Coin Balance">
          <Award className="!w-3 !h-3 !text-amber-500" />
          <span className="!text-xs !font-bold !text-amber-700">{user.coins || 0}</span>
        </div>
      </td>
      <td className="!px-6 md:!px-8 !py-4">
        <div className="!text-sm !font-bold !text-slate-600">{user.phone || '-'}</div>
      </td>
      <td className="!px-6 md:!px-8 !py-4">
        <span className={`!inline-flex !items-center !gap-1.5 !px-2.5 !py-1 !rounded-full !text-[10px] !font-bold !uppercase !tracking-widest !border ${
          user.isActive 
            ? '!text-emerald-700 !bg-emerald-50 !border-emerald-200' 
            : '!text-red-600 !bg-red-50 !border-red-200'
        }`}>
          <span className={`!w-1.5 !h-1.5 !rounded-full ${user.isActive ? '!bg-[#1abc60]' : '!bg-red-500'}`}></span>
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="!px-6 md:!px-8 !py-4 !text-right">
        {!isCurrentUser && (
          <div className="!flex !justify-end !gap-2">
            <div 
              onClick={onEdit} 
              className="!p-2 !text-slate-400 hover:!text-[#1abc60] hover:!bg-emerald-50 !rounded-lg !transition-colors !border !border-transparent hover:!border-emerald-200 !bg-transparent !cursor-pointer !inline-flex"
              title="Edit User"
            >
              <Edit2 className="!w-4 !h-4 !block !shrink-0" />
            </div>
            <div 
              onClick={() => onDelete(user._id)} 
              className="!p-2 !text-slate-400 hover:!text-red-500 hover:!bg-red-50 !rounded-lg !transition-colors !border !border-transparent hover:!border-red-200 !bg-transparent !cursor-pointer !inline-flex"
              title="Delete User"
            >
              <Trash2 className="!w-4 !h-4 !block !shrink-0" />
            </div>
          </div>
        )}
      </td>
    </tr>
  );
}

// Simple Helper Icon
function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}