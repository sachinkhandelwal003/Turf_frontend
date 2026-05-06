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
      cancelButtonColor: "#64748b",
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
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Master Data Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage global lists for sports, amenities, and court types</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-4">Categories</h3>
              <nav className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      activeCategory === cat.id 
                        ? "bg-[#1abc60] text-white shadow-sm" 
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <cat.icon className="w-4 h-4" />
                    {cat.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
              <h4 className="text-emerald-800 font-semibold text-sm mb-1.5">No Developer Dependency</h4>
              <p className="text-emerald-700 text-xs leading-relaxed">
                Add new options here to immediately see them available when creating or editing turfs.
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Add New Form */}
            <div className="bg-white rounded-[32px] border border-gray-200 p-6 shadow-sm">
              <form onSubmit={handleAdd} className="flex gap-4">
                <div className="flex-1 group flex items-center bg-gray-50/50 border border-gray-100 rounded-full focus-within:bg-white focus:ring-4 focus:ring-green-50 focus:border-[#1abc60] transition-all">
                  <div className="pl-6 pr-3 text-gray-400 group-focus-within:text-[#1abc60]">
                    <Database className="w-5 h-5" />
                  </div>
                  <div className="w-px h-6 bg-gray-200" />
                  <input 
                    type="text" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder={`Enter new ${activeCategory.replace('_', ' ')} name...`}
                    className="w-full px-5 py-3.5 bg-transparent outline-none transition-all text-sm font-bold text-gray-700 placeholder:text-gray-300"
                  />
                </div>
                <button 
                  disabled={isSaving || !newName.trim()}
                  type="submit"
                  className="bg-[#1abc60] hover:bg-[#16a085] text-white px-8 py-3.5 rounded-full font-bold transition-all shadow-lg shadow-green-100 flex items-center gap-2 disabled:opacity-50 text-sm uppercase tracking-wider"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-5 h-5" /> Add Entry</>}
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
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between group hover:border-[#1abc60]/40 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1abc60]" />
                      <span className="font-medium text-sm text-gray-800">{entry.name}</span>
                    </div>
                    <button 
                      onClick={() => handleDelete(entry._id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredMasters.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                <Database className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium text-sm">No entries found for this category</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}