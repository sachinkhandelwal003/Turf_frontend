"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Plus, Trash2, Database, Loader2, X, Save, Layers, Info, Upload, Edit
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
  const [editingEntry, setEditingEntry] = useState<MasterEntry | null>(null);
  const [editName, setEditName] = useState("");
  const [selectedEditFile, setSelectedEditFile] = useState<File | null>(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (selectedEditFile) {
      const url = URL.createObjectURL(selectedEditFile);
      setEditPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setEditPreviewUrl(null);
    }
  }, [selectedEditFile]);

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

  const handleEditInitiate = (entry: MasterEntry) => {
    setEditingEntry(entry);
    setEditName(entry.name);
    setSelectedEditFile(null);
    setEditPreviewUrl(entry.image ? (entry.image.startsWith('http') ? entry.image : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '')}${entry.image}`) : null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry || !editName.trim()) return;

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", editName.trim());
      formData.append("category", activeCategory);
      if (selectedEditFile) {
        formData.append("image", selectedEditFile);
      }

      const res = await api.put(`/masters/${editingEntry._id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (res.data.success) {
        setMasters(masters.map(m => m._id === editingEntry._id ? res.data.master : m));
        setEditingEntry(null);
        setEditName("");
        setSelectedEditFile(null);
        toast.success("Entry updated successfully");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update master entry");
    } finally {
      setIsSaving(false);
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
            <div className="bg-white rounded-[32px] border border-gray-100 p-3 shadow-sm overflow-hidden">
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
                    className={`w-full group flex flex-col items-start gap-1 px-5 py-4 rounded-[24px] transition-all duration-300 bg-[#1abc60] text-white ${
                      activeCategory === cat.id 
                        ? "shadow-lg scale-[1.02]" 
                        : "opacity-90 hover:opacity-100 hover:scale-[1.01]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <cat.icon className="w-5 h-5 text-white" />
                      <span className="font-black text-base uppercase tracking-tight">{cat.label}</span>
                    </div>
                    <p className="text-[11px] font-bold leading-relaxed text-left uppercase tracking-tighter text-white">
                      {cat.description}
                    </p>
                  </button>
                ))}
              </nav>
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                <Database className="w-32 h-32 text-gray-900" />
              </div>
              <h4 className="text-gray-900 font-black text-lg mb-2 relative z-10 uppercase tracking-tight">System Sync</h4>
              <p className="text-gray-400 text-xs font-bold leading-relaxed relative z-10 uppercase tracking-widest">
                Any changes made here will reflect instantly across all turf creation and filtering modules.
              </p>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-8">
            
            {/* Add New Entry Form */}
            <motion.div 
              layout
              className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100">
                  <Plus className="w-6 h-6 text-[#1abc60]" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                    Add New <span className="text-[#1abc60]">{activeCategory.replace('_', ' ')}</span>
                  </h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Configure global {activeCategory} parameters</p>
                </div>
              </div>

              <form onSubmit={handleAdd} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                  {/* Name Input with Icon Separator */}
                  <div className="md:col-span-5 space-y-2.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Entry Name</label>
                    <div className="group flex items-center bg-gray-50/50 border border-gray-100 rounded-full focus-within:bg-white focus:ring-4 focus:ring-green-50 focus:border-[#1abc60] transition-all">
                      <div className="pl-6 pr-3 text-gray-400 group-focus-within:text-[#1abc60]">
                        <Database className="w-5 h-5" />
                      </div>
                      <div className="w-px h-6 bg-gray-200" />
                      <input 
                        type="text" 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder={`e.g. ${activeCategory === 'sport' ? 'Padel Tennis' : activeCategory === 'amenity' ? 'Floodlights' : 'Hybrid Grass'}`}
                        className="flex-1 px-5 py-4 bg-transparent outline-none transition-all text-sm font-bold text-gray-700 placeholder:text-gray-300"
                      />
                    </div>
                  </div>
                  
                  {/* Enhanced Image Upload */}
                  <div className="md:col-span-4 space-y-2.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Icon / Image</label>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      accept="image/*"
                      className="hidden"
                    />
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`group relative h-[56px] border-2 border-dashed rounded-full transition-all duration-300 cursor-pointer flex items-center px-6 gap-3 overflow-hidden ${
                        selectedFile 
                          ? "border-[#1abc60] bg-emerald-50/30" 
                          : "border-gray-100 bg-gray-50/50 hover:border-[#1abc60]/30 hover:bg-gray-50"
                      }`}
                    >
                      {previewUrl ? (
                        <div className="flex items-center gap-3 w-full">
                          <img src={previewUrl} className="w-8 h-8 rounded-lg object-cover ring-2 ring-white shadow-sm" alt="preview" />
                          <span className="text-[10px] font-black text-gray-700 truncate flex-1 uppercase tracking-widest">{selectedFile?.name}</span>
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
                          <span className="text-[10px] font-black text-gray-400 group-hover:text-gray-600 transition-colors uppercase tracking-widest">Upload Icon</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="md:col-span-3">
                    <button 
                      disabled={isSaving || !newName.trim()}
                      type="submit"
                      className="w-full bg-[#1abc60] hover:bg-[#16a085] text-white h-[56px] rounded-full font-black uppercase tracking-[0.15em] transition-all duration-300 shadow-xl shadow-green-100 hover:shadow-green-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:shadow-none active:scale-95 text-xs"
                    >
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Add Entry</>}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>

            {/* Data Grid Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1abc60]"></div>
                  <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">
                    Active {activeCategory.replace('_', ' ')}s
                  </h3>
                  <span className="bg-gray-100 text-gray-500 text-[10px] font-black px-3 py-1 rounded-full border border-gray-200">
                    {filteredMasters.length}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredMasters.map((entry) => (
                    <motion.div 
                      key={entry._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between group hover:border-green-100 hover:shadow-xl transition-all duration-500 relative overflow-hidden"
                    >
                      <div className="flex items-center gap-5 relative z-10">
                        <div className="relative shrink-0">
                          {entry.image ? (
                            <img 
                              src={entry.image.startsWith('http') ? entry.image : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '')}${entry.image}`} 
                              alt={entry.name}
                              className="w-16 h-16 rounded-[22px] object-cover ring-4 ring-gray-50 group-hover:ring-green-50 transition-all duration-700"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-[22px] bg-gray-50 flex items-center justify-center text-gray-300 font-black text-2xl group-hover:bg-green-50 group-hover:text-[#1abc60] transition-all duration-500 border border-gray-100">
                              {entry.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm">
                            <div className="w-2 h-2 rounded-full bg-[#1abc60]" />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <span className="font-black text-gray-900 group-hover:text-[#1abc60] transition-colors duration-300 block mb-1 uppercase tracking-tight truncate">{entry.name}</span>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block opacity-70">UID: {entry._id.slice(-6)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 relative z-10 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                        <button 
                          onClick={() => handleEditInitiate(entry)}
                          className="p-3 text-gray-400 hover:text-[#1abc60] hover:bg-green-50 rounded-2xl transition-all duration-300"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(entry._id)}
                          className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-300"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Subtle Background Accent */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-50/50 to-transparent rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-150" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {filteredMasters.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-32 bg-white rounded-[48px] border-2 border-dashed border-gray-100"
                >
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100">
                    <Database className="w-10 h-10 text-gray-200" />
                  </div>
                  <h3 className="text-gray-900 font-black uppercase tracking-tight text-xl mb-2">Inventory Empty</h3>
                  <p className="text-gray-400 font-bold text-xs max-w-[280px] mx-auto leading-relaxed uppercase tracking-widest">
                    No active {activeCategory.replace('_', ' ')}s found in this sector.
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingEntry && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingEntry(null)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100">
                      <Edit className="w-6 h-6 text-[#1abc60]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                        Edit <span className="text-[#1abc60]">{activeCategory.replace('_', ' ')}</span>
                      </h2>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Update global parameters</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setEditingEntry(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                </div>

                <form onSubmit={handleUpdate} className="space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Entry Name</label>
                      <div className="group flex items-center bg-gray-50/50 border border-gray-100 rounded-full focus-within:bg-white focus:ring-4 focus:ring-green-50 focus:border-[#1abc60] transition-all">
                        <div className="pl-6 pr-3 text-gray-400 group-focus-within:text-[#1abc60]">
                          <Database className="w-5 h-5" />
                        </div>
                        <div className="w-px h-6 bg-gray-200" />
                        <input 
                          type="text" 
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 px-5 py-4 bg-transparent outline-none transition-all text-sm font-bold text-gray-700 placeholder:text-gray-300"
                        />
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Icon / Image</label>
                      <input 
                        type="file" 
                        ref={editFileInputRef}
                        onChange={(e) => setSelectedEditFile(e.target.files?.[0] || null)}
                        accept="image/*"
                        className="hidden"
                      />
                      <div 
                        onClick={() => editFileInputRef.current?.click()}
                        className={`group relative h-[120px] border-2 border-dashed rounded-[32px] transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-3 overflow-hidden ${
                          selectedEditFile || editPreviewUrl
                            ? "border-[#1abc60] bg-emerald-50/30" 
                            : "border-gray-100 bg-gray-50/50 hover:border-[#1abc60]/30 hover:bg-gray-50"
                        }`}
                      >
                        {editPreviewUrl ? (
                          <div className="relative group/preview w-20 h-20">
                            <img src={editPreviewUrl} className="w-full h-full rounded-2xl object-cover ring-4 ring-white shadow-md" alt="preview" />
                            <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover/preview:opacity-100 flex items-center justify-center transition-opacity">
                              <Upload className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-gray-400 group-hover:text-[#1abc60] transition-colors">
                              <Upload className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black text-gray-400 group-hover:text-gray-600 transition-colors uppercase tracking-widest">Change Icon</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setEditingEntry(null)}
                      className="flex-1 px-6 py-4 rounded-full font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all text-xs"
                    >
                      Cancel
                    </button>
                    <button 
                      disabled={isSaving || !editName.trim()}
                      type="submit"
                      className="flex-[2] bg-[#1abc60] hover:bg-[#16a085] text-white h-[56px] rounded-full font-black uppercase tracking-[0.15em] transition-all duration-300 shadow-xl shadow-green-100 hover:shadow-green-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:shadow-none active:scale-95 text-xs"
                    >
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}