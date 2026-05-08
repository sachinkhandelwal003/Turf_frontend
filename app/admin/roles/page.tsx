"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Shield, Loader2, Plus, Edit2, Trash2, Check, X, Save } from 'lucide-react';
import api from '@/app/services/api';
import { toast } from 'sonner';

interface Role {
  _id: string;
  name: string;
  permissions: string[];
}

interface Permission {
  _id: string;
  name: string;
  slug: string;
}

export default function AdminRolesPage() {
  const { isSuperadmin } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', permissions: [] as string[] });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState({ name: '', permissions: [] as string[] });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rolesRes, permsRes] = await Promise.all([
        api.get('/auth/roles'),
        api.get('/auth/permissions')
      ]);

      if (rolesRes.data.success) setRoles(rolesRes.data.roles);
      if (permsRes.data.success) setAvailablePermissions(permsRes.data.permissions);
    } catch (error) {
      toast.error('Failed to load RBAC data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    if (!newRole.name) return toast.error('Role name is required');
    try {
      const res = await api.post('/auth/roles', newRole);
      if (res.data.success) {
        setRoles([...roles, res.data.role]);
        setIsAdding(false);
        setNewRole({ name: '', permissions: [] });
        toast.success('Role created successfully');
      }
    } catch (error) {
      toast.error('Failed to create role');
    }
  };

  const handleUpdateRole = async () => {
    if (!editingId) return;
    try {
      const res = await api.put(`/auth/roles/${editingId}`, editRole);
      if (res.data.success) {
        setRoles(roles.map(r => r._id === editingId ? res.data.role : r));
        setEditingId(null);
        toast.success('Role updated successfully');
      }
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    try {
      const res = await api.delete(`/auth/roles/${id}`);
      if (res.data.success) {
        setRoles(roles.filter(r => r._id !== id));
        toast.success('Role deleted successfully');
      }
    } catch (error) {
      toast.error('Failed to delete role');
    }
  };

  const togglePermission = (perm: string, type: 'new' | 'edit') => {
    const target = type === 'new' ? newRole : editRole;
    const setter = type === 'new' ? setNewRole : setEditRole;
    
    if (target.permissions.includes(perm)) {
      setter({ ...target, permissions: target.permissions.filter(p => p !== perm) });
    } else {
      setter({ ...target, permissions: [...target.permissions, perm] });
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#1abc60]" /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Roles & Permissions</h1>
          <p className="text-sm text-gray-500 mt-1">Define system roles and their associated access levels.</p>
        </div>
        {isSuperadmin && !isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-[#1abc60] text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium hover:bg-[#16a085] transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create Role
          </button>
        )}
      </div>

      {/* Add Role Form */}
      {isAdding && (
        <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">New System Role</h3>
            <button onClick={() => setIsAdding(false)} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"><X className="text-gray-400 w-4 h-4" /></button>
          </div>
          <div className="group flex items-center bg-gray-50/50 border border-gray-100 rounded-2xl focus-within:bg-white focus:ring-4 focus:ring-green-50 focus:border-[#1abc60] transition-all">
            <div className="pl-6 pr-3 text-gray-400 group-focus-within:text-[#1abc60]">
              <Shield className="w-5 h-5" />
            </div>
            <div className="w-px h-6 bg-gray-200" />
            <input 
              type="text" 
              placeholder="Role Name (e.g. Moderator)"
              value={newRole.name}
              onChange={(e) => setNewRole({...newRole, name: e.target.value})}
              className="w-full px-5 py-3.5 bg-transparent outline-none transition-all font-bold text-sm text-gray-700 placeholder:text-gray-300"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {availablePermissions.map(p => (
              <label key={p._id} className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100 cursor-pointer hover:bg-white hover:border-[#1abc60] transition-all group">
                <input 
                  type="checkbox" 
                  checked={newRole.permissions.includes(p.slug)} 
                  onChange={() => togglePermission(p.slug, 'new')}
                  className="accent-[#1abc60]"
                />
                <span className="text-xs capitalize group-hover:text-[#1abc60] font-medium">{p.name}</span>
              </label>
            ))}
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button 
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleCreateRole}
              className="px-6 py-2 bg-[#1abc60] text-white text-sm font-bold rounded-lg hover:bg-[#16a085] transition-all shadow-lg shadow-green-100 flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Role
            </button>
          </div>
        </div>
      )}

      {/* Roles List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roles.map((role) => (
          <div key={role._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:border-[#1abc60]/40 hover:shadow-md transition-all group">
            
            {/* Card Header */}
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              {editingId === role._id ? (
                <div className="group flex items-center bg-white border border-[#1abc60] rounded-lg focus-within:ring-4 focus-within:ring-green-50 transition-all max-w-[240px]">
                  <div className="pl-3 pr-2 text-[#1abc60]">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="w-px h-4 bg-gray-200" />
                  <input 
                    value={editRole.name}
                    onChange={(e) => setEditRole({...editRole, name: e.target.value})}
                    className="flex-1 px-3 py-1.5 bg-transparent outline-none text-sm font-bold text-gray-900"
                  />
                </div>
              ) : (
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 capitalize">
                  <Shield className="w-4 h-4 text-[#1abc60]" />
                  {role.name}
                </h3>
              )}
              
              {isSuperadmin && (
                <div className="flex gap-1.5">
                  {editingId === role._id ? (
                    <>
                      <button onClick={handleUpdateRole} className="text-[#1abc60] bg-emerald-50 p-1.5 rounded-md hover:bg-[#1abc60] hover:text-white transition-colors" title="Save Changes"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setEditingId(null)} className="text-gray-500 bg-gray-100 p-1.5 rounded-md hover:bg-gray-200 transition-colors" title="Cancel"><X className="w-4 h-4" /></button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => {
                          setEditingId(role._id);
                          setEditRole({ name: role.name, permissions: role.permissions });
                        }} 
                        className="text-gray-400 bg-transparent p-1.5 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Edit Role"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteRole(role._id)} 
                        className="text-gray-400 bg-transparent p-1.5 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete Role"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-5 flex-1 bg-white">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Assigned Permissions</p>
              <div className="flex flex-wrap gap-2">
                {editingId === role._id ? (
                  availablePermissions.map(p => (
                    <label key={p._id} className={`flex items-center gap-2 p-1.5 rounded border text-[10px] cursor-pointer transition-all ${editRole.permissions.includes(p.slug) ? 'bg-green-50 border-green-200 text-[#1abc60]' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                      <input 
                        type="checkbox" 
                        checked={editRole.permissions.includes(p.slug)} 
                        onChange={() => togglePermission(p.slug, 'edit')}
                        className="accent-[#1abc60]"
                      />
                      <span className="capitalize font-bold">{p.name}</span>
                    </label>
                  ))
                ) : (
                  role.permissions.length > 0 ? (
                    role.permissions.map(p => (
                      <span key={p} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-100 capitalize">
                        {p.replace(/_/g, ' ')}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400 italic">No permissions assigned.</span>
                  )
                )}
              </div>
            </div>

          </div>
        ))}
      </div>
      
      {roles.length === 0 && !loading && (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
          <Shield className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium text-sm">No roles found. Create one to get started.</p>
        </div>
      )}
    </div>
  );
}