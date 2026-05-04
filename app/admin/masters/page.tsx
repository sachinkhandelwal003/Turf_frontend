"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Search, Trash2, Database, Loader2, X, Check, Save, Layers, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/app/services/api";
import { toast } from "sonner";
import Swal from "sweetalert2";

interface MasterEntry {
  _id: string;
  name: string;
  category: "sport" | "amenity" | "court_type";
  isActive: boolean;
}

export default function AdminMastersPage() {
  const [masters, setMasters] = useState<MasterEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"sport" | "amenity" | "court_type">("sport");
  const [newName, setNewName] = useState("");

  const categories = [
    { id: "sport", label: "Sports", icon: Layers },
    { id: "amenity", label: "Amenities", icon: Info },
    { id: "court_type", label: "Court Types", icon: Database },
  ];

  useEffect(() => {
    fetchMasters();
  }, []);

  const fetchMasters = async () => {
    try {
      const res = await api.get("/masters");
      if (res.data.success) {
        setMasters(res.data.masters);
      }
    } catch (error) {
      toast.error("Failed to fetch master data");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsSaving(true);
    try {
      const res = await api.post("/masters", {
        name: newName.trim(),
        category: activeCategory
      });

      if (res.data.success) {
        setMasters([...masters, res.data.master]);
        setNewName("");
        toast.success(`${activeCategory.replace('_', ' ')} added successfully`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to add master entry");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This entry will be permanently removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#1abc60",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        const res = await api.delete(`/masters/${id}`);
        if (res.data.success) {
          setMasters(masters.filter(m => m._id !== id));
          toast.success("Entry removed");
        }
      } catch (error) {
        toast.error("Failed to delete entry");
      }
    }
  };

  const filteredMasters = masters.filter(m => m.category === activeCategory);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#1abc60]" /></div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Master Data Management</h1>
          <p className="text-slate-500 mt-1">Manage global lists for sports, amenities, and court types</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-4 mb-4">Categories</h3>
              <nav className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      activeCategory === cat.id 
                        ? "bg-[#1abc60] text-white shadow-lg shadow-green-100" 
                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <cat.icon className="w-4 h-4" />
                    {cat.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
              <h4 className="text-emerald-800 font-bold text-sm mb-2">No Developer Dependency</h4>
              <p className="text-emerald-700 text-xs leading-relaxed">
                Add new options here to immediately see them available when creating or editing turfs.
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Add New Form */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <form onSubmit={handleAdd} className="flex gap-4">
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder={`Enter new ${activeCategory.replace('_', ' ')} name...`}
                    className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-[#1abc60] transition-all font-semibold"
                  />
                </div>
                <button 
                  disabled={isSaving || !newName.trim()}
                  type="submit"
                  className="bg-[#1abc60] hover:bg-[#16a085] text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-green-100 flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Add Entry</>}
                </button>
              </form>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredMasters.map((entry) => (
                  <motion.div 
                    key={entry._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-[#1abc60] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#1abc60]" />
                      <span className="font-bold text-slate-700">{entry.name}</span>
                    </div>
                    <button 
                      onClick={() => handleDelete(entry._id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredMasters.length === 0 && (
              <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <Database className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold">No entries found for this category</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
