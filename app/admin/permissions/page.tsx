"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Shield, Loader2, Info, Lock, Plus, X, Edit2, Trash2, Check, Save } from 'lucide-react';
import api from '@/app/services/api';
import { toast } from 'sonner';

interface Permission {
  _id: string;
  name: string;
  slug: string;
  description: string;
}

export default function AdminPermissionsPage() {
  const { isSuperadmin } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newPermission, setNewPermission] = useState({ name: '', slug: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPermission, setEditPermission] = useState({ name: '', slug: '', description: '' });

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const res = await api.get('/auth/permissions');
      if (res.data.success) {
        setPermissions(res.data.permissions);
      }
    } catch (error) {
      toast.error('Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newPermission.name || !newPermission.slug) return toast.error('Name and Slug are required');
    try {
      const res = await api.post('/auth/permissions', newPermission);
      if (res.data.success) {
        setPermissions([...permissions, res.data.permission]);
        setIsAdding(false);
        setNewPermission({ name: '', slug: '', description: '' });
        toast.success('Permission created');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create permission');
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    try {
      const res = await api.put(`/auth/permissions/${editingId}`, editPermission);
      if (res.data.success) {
        setPermissions(permissions.map(p => p._id === editingId ? res.data.permission : p));
        setEditingId(null);
        toast.success('Permission updated');
      }
    } catch (error) {
      toast.error('Failed to update permission');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This may affect existing roles.')) return;
    try {
      const res = await api.delete(`/auth/permissions/${id}`);
      if (res.data.success) {
        setPermissions(permissions.filter(p => p._id !== id));
        toast.success('Permission deleted');
      }
    } catch (error) {
      toast.error('Failed to delete permission');
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#1abc60]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Permissions</h1>
          <p className="text-gray-500">Manage system-wide permissions used for access control</p>
        </div>
        {isSuperadmin && !isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-[#1abc60] text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold hover:bg-[#16a085] transition-all shadow-lg shadow-green-100"
          >
            <Plus className="w-4 h-4" /> Create Permission
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl border-2 border-green-50 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-gray-900">New Permission</h3>
            <button onClick={() => setIsAdding(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors"><X className="text-gray-400 w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="group flex items-center bg-gray-50/50 border border-gray-100 rounded-2xl focus-within:bg-white focus:ring-4 focus:ring-green-50 focus:border-[#1abc60] transition-all">
              <div className="pl-6 pr-3 text-gray-400 group-focus-within:text-[#1abc60]">
                <Info className="w-5 h-5" />
              </div>
              <div className="w-px h-6 bg-gray-200" />
              <input 
                type="text" 
                placeholder="Permission Name (e.g. View Dashboard)"
                value={newPermission.name}
                onChange={(e) => setNewPermission({...newPermission, name: e.target.value})}
                className="w-full px-5 py-3.5 bg-transparent outline-none transition-all font-bold text-sm text-gray-700 placeholder:text-gray-300"
              />
            </div>
            <div className="group flex items-center bg-gray-50/50 border border-gray-100 rounded-2xl focus-within:bg-white focus:ring-4 focus:ring-green-50 focus:border-[#1abc60] transition-all">
              <div className="pl-6 pr-3 text-gray-400 group-focus-within:text-[#1abc60]">
                <Lock className="w-5 h-5" />
              </div>
              <div className="w-px h-6 bg-gray-200" />
              <input 
                type="text" 
                placeholder="Slug (e.g. view_dashboard)"
                value={newPermission.slug}
                onChange={(e) => setNewPermission({...newPermission, slug: e.target.value.toLowerCase().replace(/\s+/g, '_')})}
                className="w-full px-5 py-3.5 bg-transparent outline-none transition-all font-bold text-sm text-gray-700 placeholder:text-gray-300"
              />
            </div>
          </div>
          <div className="group flex items-start bg-gray-50/50 border border-gray-100 rounded-2xl focus-within:bg-white focus:ring-4 focus:ring-green-50 focus:border-[#1abc60] transition-all">
            <div className="pl-6 pr-3 pt-4 text-gray-400 group-focus-within:text-[#1abc60]">
              <Shield className="w-5 h-5" />
            </div>
            <div className="w-px h-6 bg-gray-200 mt-4" />
            <textarea 
              placeholder="Description (Optional)"
              value={newPermission.description}
              onChange={(e) => setNewPermission({...newPermission, description: e.target.value})}
              className="w-full px-5 py-4 bg-transparent outline-none transition-all font-bold text-sm text-gray-700 placeholder:text-gray-300 h-24 resize-none"
            />
          </div>
          <button onClick={handleCreate} className="w-full bg-[#1abc60] text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-[#16a085] transition-all shadow-xl shadow-green-100">Save Permission</button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {permissions.map((perm) => (
          <div key={perm._id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3 hover:border-[#1abc60] transition-all group">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-green-50 transition-colors">
                <Lock className="w-4 h-4 text-gray-400 group-hover:text-[#1abc60]" />
              </div>
              {isSuperadmin && (
                <div className="flex gap-1">
                  {editingId === perm._id ? (
                    <button onClick={handleUpdate} className="p-1 bg-green-500 text-white rounded"><Check className="w-3 h-3" /></button>
                  ) : (
                    <>
                      <button onClick={() => {
                        setEditingId(perm._id);
                        setEditPermission({ name: perm.name, slug: perm.slug, description: perm.description });
                      }} className="p-1 text-gray-400 hover:text-[#1abc60]"><Edit2 className="w-3 h-3" /></button>
                      <button onClick={() => handleDelete(perm._id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                    </>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-1">
              {editingId === perm._id ? (
                <div className="space-y-2">
                  <input value={editPermission.name} onChange={(e) => setEditPermission({...editPermission, name: e.target.value})} className="w-full text-xs p-1 border rounded" />
                  <input value={editPermission.slug} onChange={(e) => setEditPermission({...editPermission, slug: e.target.value})} className="w-full text-[10px] p-1 border rounded font-mono" />
                </div>
              ) : (
                <>
                  <span className="text-sm font-bold text-gray-900 capitalize">{perm.name}</span>
                  <span className="text-[10px] text-gray-400 font-mono">{perm.slug}</span>
                </>
              )}
              {perm.description && !editingId && (
                <p className="text-[10px] text-gray-500 line-clamp-2 mt-1 italic">{perm.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
