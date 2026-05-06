"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Plus, Search, Trash2, Database, Loader2, X, Check, Save, Layers, Info, Upload, Image as ImageIcon
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
  image?: string;
}

export default function AdminMastersPage() {
  const [masters, setMasters] = useState<MasterEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"sport" | "amenity" | "court_type">("sport");
  const [newName, setNewName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: "sport", label: "Sports", icon: Layers, description: "Manage different sports categories" },
    { id: "amenity", label: "Amenities", icon: Info, description: "Manage available facilities" },
    { id: "court_type", label: "Court Types", icon: Database, description: "Manage playing surface types" },
  ];

  useEffect(() => {
    fetchMasters();
  }, []);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

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
      const formData = new FormData();
      formData.append("name", newName.trim());
      formData.append("category", activeCategory);
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      const res = await api.post("/masters", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (res.data.success) {
        setMasters([...masters, res.data.master]);
        setNewName("");
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
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
    <div className="min-h-screen bg-[#fcfcfd] pb-20">
      {/* Header with Glass Effect */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 transition-all duration-300">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
                Master Data <span className="text-[#1abc60]">Management</span>
              </h1>
              <p className="text-gray-500 text-sm font-medium mt-1">
                Configure and organize global parameters for your sports ecosystem.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
                <span className="text-emerald-700 text-xs font-bold uppercase tracking-widest">
                  {masters.length} Total Entries
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Sidebar - Category Navigation */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 p-3 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-5 py-4">
                Data Categories
              </h3>
              <nav className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id as any);
                      setNewName("");
                      setSelectedFile(null);
                    }}
                    className={`w-full group flex flex-col items-start gap-1 px-5 py-4 rounded-2xl transition-all duration-300 ${
                      activeCategory === cat.id 
                        ? "bg-[#1abc60] text-white shadow-[0_10px_20px_rgba(26,188,96,0.2)] scale-[1.02]" 
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <cat.icon className={`w-5 h-5 ${activeCategory === cat.id ? "text-white" : "text-gray-400 group-hover:text-[#1abc60]"}`} />
                      <span className="font-bold text-base">{cat.label}</span>
                    </div>
                    <p className={`text-[11px] font-medium leading-relaxed text-left ${activeCategory === cat.id ? "text-emerald-50" : "text-gray-400"}`}>
                      {cat.description}
                    </p>
                  </button>
                ))}
              </nav>
            </div>

            <div className="bg-gradient-to-br from-[#1abc60] to-[#16a085] p-6 rounded-3xl shadow-lg relative overflow-hidden group">
              <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Database className="w-32 h-32 text-white" />
              </div>
              <h4 className="text-white font-black text-lg mb-2 relative z-10 uppercase tracking-tight">System Sync</h4>
              <p className="text-emerald-50 text-xs font-medium leading-relaxed relative z-10 opacity-90">
                Any changes made here will reflect instantly across all turf creation and filtering modules.
              </p>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-8">
            
            {/* Add New Entry Form */}
            <motion.div 
              layout
              className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center">
                  <Plus className="w-5 h-5 text-[#1abc60]" />
                </div>
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                  Add New <span className="text-[#1abc60]">{activeCategory.replace('_', ' ')}</span>
                </h2>
              </div>

              <form onSubmit={handleAdd} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
                  {/* Name Input */}
                  <div className={`space-y-2 ${activeCategory === 'sport' ? 'md:col-span-5' : 'md:col-span-9'}`}>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Entry Name</label>
                    <input 
                      type="text" 
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder={`e.g. ${activeCategory === 'sport' ? 'Padel Tennis' : activeCategory === 'amenity' ? 'Floodlights' : 'Hybrid Grass'}`}
                      className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#1abc60]/5 focus:border-[#1abc60] transition-all text-sm font-bold text-gray-700 placeholder:text-gray-300 placeholder:font-medium"
                    />
                  </div>
                  
                  {/* Enhanced Image Upload for Sports */}
                  {activeCategory === 'sport' && (
                    <div className="md:col-span-4 space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cover Image</label>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        accept="image/*"
                        className="hidden"
                      />
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`group relative h-[52px] border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer flex items-center px-4 gap-3 overflow-hidden ${
                          selectedFile 
                            ? "border-[#1abc60] bg-emerald-50/30" 
                            : "border-gray-100 bg-gray-50/50 hover:border-[#1abc60]/30 hover:bg-gray-50"
                        }`}
                      >
                        {previewUrl ? (
                          <div className="flex items-center gap-3 w-full">
                            <img src={previewUrl} className="w-8 h-8 rounded-lg object-cover ring-2 ring-white shadow-sm" alt="preview" />
                            <span className="text-xs font-bold text-gray-700 truncate flex-1">{selectedFile?.name}</span>
                            <X 
                              className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFile(null);
                                if (fileInputRef.current) fileInputRef.current.value = "";
                              }}
                            />
                          </div>
                        ) : (
                          <>
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm text-gray-400 group-hover:text-[#1abc60] transition-colors">
                              <Upload className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-gray-400 group-hover:text-gray-600 transition-colors">Upload Image</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="md:col-span-3">
                    <button 
                      disabled={isSaving || !newName.trim()}
                      type="submit"
                      className="w-full bg-[#1abc60] hover:bg-[#16a085] text-white h-[52px] rounded-2xl font-black uppercase tracking-widest transition-all duration-300 shadow-[0_10px_20px_rgba(26,188,96,0.15)] hover:shadow-[0_15px_25px_rgba(26,188,96,0.25)] flex items-center justify-center gap-3 disabled:opacity-50 disabled:shadow-none active:scale-95"
                    >
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Add</>}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>

            {/* Data Grid Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
                    Existing {activeCategory.replace('_', ' ')}s
                  </h3>
                  <span className="bg-gray-100 text-gray-500 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {filteredMasters.length}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredMasters.map((entry) => (
                    <motion.div 
                      key={entry._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex items-center justify-between group hover:border-[#1abc60]/40 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all duration-500 relative overflow-hidden"
                    >
                      <div className="flex items-center gap-4 relative z-10">
                        {entry.image ? (
                          <div className="relative">
                            <img 
                              src={entry.image.startsWith('http') ? entry.image : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '')}${entry.image}`} 
                              alt={entry.name}
                              className="w-14 h-14 rounded-2xl object-cover ring-4 ring-gray-50 group-hover:ring-[#1abc60]/10 transition-all duration-500"
                            />
                            <div className="absolute inset-0 rounded-2xl bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#1abc60] font-black text-xl group-hover:scale-110 transition-transform duration-500">
                            {entry.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <span className="font-black text-gray-900 group-hover:text-[#1abc60] transition-colors duration-300 block mb-0.5">{entry.name}</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{activeCategory.replace('_', ' ')}</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleDelete(entry._id)}
                        className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 relative z-10"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>

                      {/* Subtle Background Accent */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-50 to-transparent rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-150 transition-transform duration-700" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {filteredMasters.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-24 bg-white rounded-[40px] border border-dashed border-gray-200"
                >
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Database className="w-8 h-8 text-gray-200" />
                  </div>
                  <h3 className="text-gray-900 font-black uppercase tracking-tight text-lg mb-2">Inventory Empty</h3>
                  <p className="text-gray-400 font-medium text-sm max-w-[240px] mx-auto leading-relaxed">
                    Start by adding your first {activeCategory.replace('_', ' ')} entry using the form above.
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
