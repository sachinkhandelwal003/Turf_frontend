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

export default function AdminRolesPage() {
  const { isSuperadmin } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<string[]>([]);
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
        toast.success('Role created');
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
        toast.success('Role updated');
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
        toast.success('Role deleted');
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

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-gray-500">Define system roles and their associated permissions</p>
        </div>
        {isSuperadmin && !isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-[#1abc60] text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold hover:bg-[#16a085] transition-all shadow-lg shadow-green-100"
          >
            <Plus className="w-4 h-4" /> Create Role
          </button>
        )}
      </div>

      {/* Add Role Form */}
      {isAdding && (
        <div className="bg-white p-6 rounded-xl border-2 border-green-50 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-gray-900">New System Role</h3>
            <button onClick={() => setIsAdding(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors"><X className="text-gray-400 w-5 h-5" /></button>
          </div>
          <input 
            type="text" 
            placeholder="Role Name (e.g. Moderator)"
            value={newRole.name}
            onChange={(e) => setNewRole({...newRole, name: e.target.value})}
            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#1abc60] transition-all"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {availablePermissions.map(p => (
              <label key={p} className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100 cursor-pointer hover:bg-white hover:border-[#1abc60] transition-all group">
                <input 
                  type="checkbox" 
                  checked={newRole.permissions.includes(p)} 
                  onChange={() => togglePermission(p, 'new')}
                  className="accent-[#1abc60]"
                />
                <span className="text-xs capitalize group-hover:text-[#1abc60] font-medium">{p.replace(/_/g, ' ')}</span>
              </label>
            ))}
          </div>
          <button onClick={handleCreateRole} className="w-full bg-[#1abc60] text-white py-2.5 rounded-lg font-bold hover:bg-[#16a085] transition-all shadow-md shadow-green-50">Save New Role</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => (
          <div key={role._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:border-[#1abc60] transition-all group">
            <div className="p-4 bg-gray-50/50 border-b flex justify-between items-center">
              {editingId === role._id ? (
                <input 
                  value={editRole.name}
                  onChange={(e) => setEditRole({...editRole, name: e.target.value})}
                  className="bg-white border border-[#1abc60] rounded px-2 py-1 text-sm font-bold outline-none"
                />
              ) : (
                <h3 className="font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#1abc60]" />
                  {role.name}
                </h3>
              )}
              
              {isSuperadmin && (
                <div className="flex gap-2">
                  {editingId === role._id ? (
                    <>
                      <button onClick={handleUpdateRole} className="text-white bg-[#1abc60] p-1.5 rounded-lg hover:bg-[#16a085] shadow-sm"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setEditingId(null)} className="text-white bg-gray-400 p-1.5 rounded-lg hover:bg-gray-500 shadow-sm"><X className="w-4 h-4" /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => {
                        setEditingId(role._id);
                        setEditRole({ name: role.name, permissions: role.permissions });
                      }} className="text-white bg-[#1abc60] p-1.5 rounded-lg hover:bg-[#16a085] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteRole(role._id)} className="text-white bg-red-500 p-1.5 rounded-lg hover:bg-red-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                    </>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-4 flex-1">
              <div className="flex flex-wrap gap-1.5">
                {editingId === role._id ? (
                  availablePermissions.map(p => (
                    <label key={p} className={`flex items-center gap-2 p-1.5 rounded border text-[10px] cursor-pointer transition-all ${editRole.permissions.includes(p) ? 'bg-green-50 border-green-200 text-[#1abc60]' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                      <input 
                        type="checkbox" 
                        checked={editRole.permissions.includes(p)} 
                        onChange={() => togglePermission(p, 'edit')}
                        className="accent-[#1abc60]"
                      />
                      <span className="capitalize font-bold">{p.replace(/_/g, ' ')}</span>
                    </label>
                  ))
                ) : (
                  role.permissions.map(p => (
                    <span key={p} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold border border-blue-100 capitalize">
                      {p.replace(/_/g, ' ')}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
