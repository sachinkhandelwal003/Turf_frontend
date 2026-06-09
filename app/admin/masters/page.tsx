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
  playerCount?: number | null;
}

export default function AdminMastersPage() {
  const [masters, setMasters] = useState<MasterEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"sport" | "amenity" | "court_type">("sport");
  const [newName, setNewName] = useState("");
  const [newPlayerCount, setNewPlayerCount] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<MasterEntry | null>(null);
  const [editName, setEditName] = useState("");
  const [editPlayerCount, setEditPlayerCount] = useState<string>("");
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
      if (activeCategory === "sport" && newPlayerCount.trim()) {
        formData.append("playerCount", newPlayerCount.trim());
      }
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
        setNewPlayerCount("");
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
    setEditPlayerCount(entry.playerCount?.toString() || "");
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
      if (activeCategory === "sport" && editPlayerCount.trim()) {
        formData.append("playerCount", editPlayerCount.trim());
      }
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
        setEditPlayerCount("");
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
          <h1 className="!text-2xl md:!text-3xl !font-black !text-slate-900 !tracking-tight !m-0 !mb-1.5">Master Data Management</h1>
          <p className="!text-sm !font-medium !text-slate-500 !m-0">Configure and organize global parameters for your sports ecosystem</p>
        </div>
        <div className="!flex !items-center !gap-3">
          <div className="!px-4 !py-2 !bg-emerald-50 !rounded-full !border !border-emerald-100">
            <span className="!text-emerald-700 !text-xs !font-bold !uppercase !tracking-widest">
              {masters.length} Total Entries
            </span>
          </div>
        </div>
      </div>

      <div className="!grid !grid-cols-1 lg:!grid-cols-12 !gap-8">
        
        {/* Sidebar - Category Navigation */}
        <div className="lg:!col-span-3 !space-y-6">
          <div className="!bg-slate-50/60 !rounded-2xl !border !border-slate-100 !p-3 !space-y-3">
            <h3 className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-[0.2em] !px-3 !pt-2 !pb-1 !m-0">
              Data Categories
            </h3>
            <nav className="!space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id as any);
                    setNewName("");
                    setNewPlayerCount("");
                    setSelectedFile(null);
                  }}
                  className={`!w-full group !flex !flex-col !items-start !gap-1.5 !p-4 !rounded-xl !transition-all !border-none !cursor-pointer !outline-none ${
                    activeCategory === cat.id 
                      ? "!bg-[#1abc60] !text-white !shadow-md" 
                      : "!bg-white hover:!bg-slate-50 !text-slate-700 !border !border-slate-200"
                  }`}
                >
                  <div className="!flex !items-center !gap-2.5">
                    <cat.icon className={`!w-4.5 !h-4.5 ${activeCategory === cat.id ? "!text-white" : "!text-slate-500"}`} />
                    <span className="!font-bold !text-sm !uppercase !tracking-tight">{cat.label}</span>
                  </div>
                  <p className={`!text-[10px] !font-medium !leading-relaxed !text-left !m-0 ${
                    activeCategory === cat.id ? "!text-emerald-100/90" : "!text-slate-400"
                  }`}>
                    {cat.description}
                  </p>
                </button>
              ))}
            </nav>
          </div>

          <div className="!bg-slate-50/60 !p-6 !rounded-2xl !border !border-slate-100 !relative !overflow-hidden">
            <h4 className="!text-slate-900 !font-bold !text-sm !mb-1.5 !uppercase !tracking-tight !m-0">System Sync</h4>
            <p className="!text-slate-500 !text-xs !font-medium !leading-relaxed !uppercase !tracking-wider !m-0">
              Any changes made here will reflect instantly across all turf creation and filtering modules.
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:!col-span-9 !space-y-6">
          
          {/* Add New Entry Form */}
          <motion.div 
            layout
            className="!bg-slate-50/60 !p-6 md:!p-8 !rounded-2xl !border !border-slate-100 !space-y-6"
          >
            <div className="!flex !items-center !gap-3">
              <div className="!w-10 !h-10 !bg-emerald-50 !rounded-xl !flex !items-center !justify-center !text-[#1abc60] !border !border-emerald-100">
                <Plus className="!w-5 !h-5" />
              </div>
              <div>
                <h2 className="!text-lg !font-bold !text-slate-900 !uppercase !tracking-tight !m-0">
                  Add New <span className="!text-[#1abc60]">{activeCategory.replace('_', ' ')}</span>
                </h2>
                <p className="!text-xs !font-medium !text-slate-500 !uppercase !tracking-wider !m-0 !mt-0.5">Configure global {activeCategory} parameters</p>
              </div>
            </div>

            <form onSubmit={handleAdd} className="!m-0">
              <div className="!grid !grid-cols-1 md:!grid-cols-12 !gap-5 !items-end">
                {/* Name Input */}
                <div className={`${activeCategory === 'sport' ? 'md:!col-span-4' : 'md:!col-span-5'} !space-y-2`}>
                  <label className="!block !text-[10px] !font-bold !text-slate-500 !uppercase !tracking-wider">Entry Name</label>
                  <div className="!group !flex !items-center !bg-white !border !border-slate-200 focus-within:!border-[#1abc60] focus-within:!ring-1 focus-within:!ring-[#1abc60] !rounded-xl !transition-all">
                    <div className="!pl-4 !pr-2 !text-slate-400 group-focus-within:!text-[#1abc60]">
                      <Database className="!w-4 !h-4" />
                    </div>
                    <input 
                      type="text" 
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder={`e.g. ${activeCategory === 'sport' ? 'Padel Tennis' : activeCategory === 'amenity' ? 'Floodlights' : 'Hybrid Grass'}`}
                      className="!flex-1 !px-2 !py-3.5 !bg-transparent !outline-none !border-none !text-sm !font-bold !text-slate-800 placeholder:!text-slate-300"
                    />
                  </div>
                </div>

                {/* Player Count Input (Only for Sport) */}
                {activeCategory === 'sport' && (
                  <div className="md:!col-span-3 !space-y-2">
                    <label className="!block !text-[10px] !font-bold !text-slate-500 !uppercase !tracking-wider">Player Count</label>
                    <div className="!group !flex !items-center !bg-white !border !border-slate-200 focus-within:!border-[#1abc60] focus-within:!ring-1 focus-within:!ring-[#1abc60] !rounded-xl !transition-all">
                      <div className="!pl-4 !pr-2 !text-slate-400 group-focus-within:!text-[#1abc60]">
                        <Layers className="!w-4 !h-4" />
                      </div>
                      <input 
                        type="number" 
                        value={newPlayerCount}
                        onChange={(e) => setNewPlayerCount(e.target.value)}
                        placeholder="e.g. 11 (Cricket)"
                        min="1"
                        className="!flex-1 !px-2 !py-3.5 !bg-transparent !outline-none !border-none !text-sm !font-bold !text-slate-800 placeholder:!text-slate-300"
                      />
                    </div>
                  </div>
                )}
                
                {/* Image Upload */}
                <div className={`${activeCategory === 'sport' ? 'md:!col-span-3' : 'md:!col-span-4'} !space-y-2`}>
                  <label className="!block !text-[10px] !font-bold !text-slate-500 !uppercase !tracking-wider">Icon / Image</label>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    accept="image/*"
                    className="!hidden"
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`!group !relative !h-[49px] !border-2 !border-dashed !rounded-xl !transition-all !cursor-pointer !flex !items-center !px-4 !gap-2.5 !overflow-hidden ${
                      selectedFile 
                        ? "!border-[#1abc60] !bg-emerald-50/20" 
                        : "!border-slate-200 !bg-white hover:!border-[#1abc60]/40"
                    }`}
                  >
                    {previewUrl ? (
                      <div className="!flex !items-center !gap-2.5 !w-full">
                        <img src={previewUrl} className="!w-7 !h-7 !rounded-lg !object-cover !ring-2 !ring-white !shadow-sm" alt="preview" />
                        <span className="!text-[10px] !font-bold !text-slate-700 !truncate !flex-1 !uppercase !tracking-widest">{selectedFile?.name}</span>
                        <X 
                          className="!w-4 !h-4 !text-slate-400 hover:!text-red-500 !transition-colors" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = "";
                          }}
                        />
                      </div>
                    ) : (
                      <>
                        <div className="!w-6 !h-6 !rounded-lg !bg-slate-50 !flex !items-center !justify-center !shadow-sm !text-slate-400 group-hover:!text-[#1abc60] !transition-colors">
                          <Upload className="!w-3.5 !h-3.5" />
                        </div>
                        <span className="!text-[10px] !font-bold !text-slate-400 group-hover:!text-slate-600 !transition-colors !uppercase !tracking-wider">Upload Icon</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="md:!col-span-2">
                  <button 
                    disabled={isSaving || !newName.trim()}
                    type="submit"
                    className="!w-full !bg-[#1abc60] hover:!bg-[#169c4e] !text-white !h-[49px] !rounded-xl !font-bold !uppercase !tracking-wider !transition-all !shadow-md hover:!shadow-lg hover:!shadow-[#1abc60]/20 !flex !items-center !justify-center !gap-2 disabled:!opacity-50 disabled:!shadow-none active:!scale-95 !text-xs !cursor-pointer !border-none !outline-none"
                  >
                    {isSaving ? <Loader2 className="!w-4 !h-4 !animate-spin" /> : <><Plus className="!w-4 !h-4" /> Add Entry</>}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>

          {/* Data Grid Section */}
          <div className="!space-y-4">
            <div className="!flex !items-center !justify-between !px-2">
              <div className="!flex !items-center !gap-2.5">
                <div className="!w-1.5 !h-1.5 !rounded-full !bg-[#1abc60]"></div>
                <h3 className="!text-[11px] !font-black !text-slate-800 !uppercase !tracking-widest !m-0">
                  Active {activeCategory.replace('_', ' ')}s
                </h3>
                <span className="!bg-slate-50 !text-slate-500 !text-[10px] !font-bold !px-2.5 !py-0.5 !rounded-full !border !border-slate-200">
                  {filteredMasters.length}
                </span>
              </div>
            </div>

            <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
              <AnimatePresence mode="popLayout">
                {filteredMasters.map((entry) => (
                  <motion.div 
                    key={entry._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="!bg-white !p-4 md:!p-5 !rounded-2xl !border !border-slate-200/80 !flex !items-center !justify-between !group hover:!border-emerald-100 hover:!bg-emerald-50/10 hover:!shadow-sm !transition-all !relative !overflow-hidden"
                  >
                    <div className="!flex !items-center !gap-4 !relative !z-10">
                      <div className="!relative !shrink-0">
                        {entry.image ? (
                          <img 
                            src={entry.image.startsWith('http') ? entry.image : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '')}${entry.image}`} 
                            alt={entry.name}
                            className="!w-12 !h-12 !rounded-xl !object-cover !ring-4 !ring-slate-50 group-hover:!ring-emerald-50 !transition-all"
                          />
                        ) : (
                          <div className="!w-12 !h-12 !rounded-xl !bg-slate-50 !flex !items-center !justify-center !text-slate-400 !font-bold !text-lg group-hover:!bg-emerald-50 group-hover:!text-[#1abc60] !transition-all !border !border-slate-100">
                            {entry.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="!absolute !-bottom-0.5 !-right-0.5 !w-3.5 !h-3.5 !bg-white !rounded-full !flex !items-center !justify-center !border !border-slate-100 !shadow-sm">
                          <div className="!w-1.5 !h-1.5 !rounded-full !bg-[#1abc60]" />
                        </div>
                      </div>
                      <div className="!min-w-0">
                        <span className="!font-bold !text-slate-900 group-hover:!text-[#1abc60] !transition-colors !block !mb-0.5 !uppercase !tracking-tight !truncate">{entry.name}</span>
                        <div className="!flex !items-center !gap-2">
                          <span className="!text-[9px] !font-bold !text-slate-400 !uppercase !tracking-wider !opacity-70">UID: {entry._id.slice(-6)}</span>
                          {entry.playerCount && activeCategory === 'sport' && (
                            <span className="!px-2 !py-0.5 !bg-emerald-50 !text-emerald-700 !text-[9px] !font-bold !uppercase !tracking-wider !rounded-full">
                              {entry.playerCount} Players
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="!flex !items-center !gap-1 !relative !z-10 lg:!opacity-0 group-hover:!opacity-100 !transform !translate-x-2 group-hover:!translate-x-0 !transition-all">
                      <button 
                        onClick={() => handleEditInitiate(entry)}
                        className="!p-2 !text-slate-400 hover:!text-[#1abc60] hover:!bg-emerald-50 !rounded-xl !transition-all !cursor-pointer !border-none !bg-transparent"
                      >
                        <Edit className="!w-4.5 !h-4.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(entry._id)}
                        className="!p-2 !text-slate-400 hover:!text-red-500 hover:!bg-red-50 !rounded-xl !transition-all !cursor-pointer !border-none !bg-transparent"
                      >
                        <Trash2 className="!w-4.5 !h-4.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredMasters.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="!text-center !py-20 !bg-slate-50/40 !rounded-2xl !border-2 !border-dashed !border-slate-200"
              >
                <div className="!w-16 !h-16 !bg-slate-50 !rounded-full !flex !items-center !justify-center !mx-auto !mb-4 !border !border-slate-200">
                  <Database className="!w-6 !h-6 !text-slate-300" />
                </div>
                <h3 className="!text-slate-900 !font-bold !uppercase !tracking-tight !text-base !mb-1 !m-0">Inventory Empty</h3>
                <p className="!text-slate-500 !font-medium !text-xs !max-w-[280px] !mx-auto !leading-relaxed !uppercase !tracking-wider !m-0">
                  No active {activeCategory.replace('_', ' ')}s found in this sector.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingEntry && (
          <div className="!fixed !inset-0 !z-[100] !flex !items-center !justify-center !p-4 !backdrop-blur-sm !bg-slate-900/60">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingEntry(null)}
              className="!absolute !inset-0 !cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="!relative !w-full !max-w-xl !bg-white !rounded-[28px] !shadow-2xl !overflow-hidden !border !border-slate-200"
            >
              <div className="!p-6 md:!p-8">
                <div className="!flex !items-center !justify-between !mb-6">
                  <div className="!flex !items-center !gap-4">
                    <div className="!w-11 !h-11 !bg-emerald-50 !rounded-xl !flex !items-center !justify-center !text-[#1abc60] !border !border-emerald-100">
                      <Edit className="!w-5 !h-5" />
                    </div>
                    <div>
                      <h2 className="!text-lg !font-bold !text-slate-900 !uppercase !tracking-tight !m-0">
                        Edit <span className="!text-[#1abc60]">{activeCategory.replace('_', ' ')}</span>
                      </h2>
                      <p className="!text-xs !font-medium !text-slate-500 !uppercase !tracking-wider !m-0 !mt-0.5">Update global parameters</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setEditingEntry(null)}
                    className="!p-2 hover:!bg-slate-100 !rounded-full !transition-colors !cursor-pointer !border-none !bg-transparent"
                  >
                    <X className="!w-5 !h-5 !text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleUpdate} className="!space-y-6 !m-0">
                  <div className="!space-y-5">
                    <div className="!space-y-2">
                      <label className="!block !text-[10px] !font-bold !text-slate-500 !uppercase !tracking-wider">Entry Name</label>
                      <div className="!group !flex !items-center !bg-slate-50 !border !border-slate-200 focus-within:!bg-white focus-within:!border-[#1abc60] focus-within:!ring-1 focus-within:!ring-[#1abc60] !rounded-xl !transition-all">
                        <div className="!pl-4 !pr-2 !text-slate-400 group-focus-within:!text-[#1abc60]">
                          <Database className="!w-4 !h-4" />
                        </div>
                        <input 
                          type="text" 
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="!flex-1 !px-2 !py-3.5 !bg-transparent !outline-none !border-none !text-sm !font-bold !text-slate-800"
                        />
                      </div>
                    </div>

                    {/* Player Count Input (Only for Sport) */}
                    {activeCategory === 'sport' && (
                      <div className="!space-y-2">
                        <label className="!block !text-[10px] !font-bold !text-slate-500 !uppercase !tracking-wider">Player Count</label>
                        <div className="!group !flex !items-center !bg-slate-50 !border !border-slate-200 focus-within:!bg-white focus-within:!border-[#1abc60] focus-within:!ring-1 focus-within:!ring-[#1abc60] !rounded-xl !transition-all">
                          <div className="!pl-4 !pr-2 !text-slate-400 group-focus-within:!text-[#1abc60]">
                            <Layers className="!w-4 !h-4" />
                          </div>
                          <input 
                            type="number" 
                            value={editPlayerCount}
                            onChange={(e) => setEditPlayerCount(e.target.value)}
                            placeholder="e.g. 11 (Cricket)"
                            min="1"
                            className="!flex-1 !px-2 !py-3.5 !bg-transparent !outline-none !border-none !text-sm !font-bold !text-slate-800"
                          />
                        </div>
                      </div>
                    )}

                    <div className="!space-y-2">
                      <label className="!block !text-[10px] !font-bold !text-slate-500 !uppercase !tracking-wider">Icon / Image</label>
                      <input 
                        type="file" 
                        ref={editFileInputRef}
                        onChange={(e) => setSelectedEditFile(e.target.files?.[0] || null)}
                        accept="image/*"
                        className="!hidden"
                      />
                      <div 
                        onClick={() => editFileInputRef.current?.click()}
                        className={`!group !relative !h-[100px] !border-2 !border-dashed !rounded-2xl !transition-all !cursor-pointer !flex !flex-col !items-center !justify-center !gap-2 !overflow-hidden ${
                          selectedEditFile || editPreviewUrl
                            ? "!border-[#1abc60] !bg-emerald-50/20" 
                            : "!border-slate-200 !bg-slate-50 hover:!border-[#1abc60]/40 hover:!bg-white"
                        }`}
                      >
                        {editPreviewUrl ? (
                          <div className="!relative group/preview !w-16 !h-16">
                            <img src={editPreviewUrl} className="!w-full !h-full !rounded-xl !object-cover !ring-4 !ring-white !shadow-md" alt="preview" />
                            <div className="!absolute !inset-0 !bg-black/40 !rounded-xl !opacity-0 group-hover/preview:!opacity-100 !flex !items-center !justify-center !transition-opacity">
                              <Upload className="!w-5 !h-5 !text-white" />
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="!w-8 !h-8 !rounded-lg !bg-white !flex !items-center !justify-center !shadow-sm !text-slate-400 group-hover:!text-[#1abc60] !transition-colors">
                              <Upload className="!w-4 !h-4" />
                            </div>
                            <span className="!text-[10px] !font-bold !text-slate-400 group-hover:!text-slate-600 !transition-colors !uppercase !tracking-wider">Change Icon</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="!flex !gap-3 !pt-2">
                    <button 
                      type="button"
                      onClick={() => setEditingEntry(null)}
                      className="!flex-1 !px-6 !py-3 !rounded-xl !font-bold !uppercase !tracking-wider !text-slate-400 hover:!text-slate-600 hover:!bg-slate-50 !transition-all !text-xs !cursor-pointer !border-none !bg-transparent"
                    >
                      Cancel
                    </button>
                    <button 
                      disabled={isSaving || !editName.trim()}
                      type="submit"
                      className="!flex-[2] !bg-[#1abc60] hover:!bg-[#169c4e] !text-white !h-[45px] !rounded-xl !font-bold !uppercase !tracking-wider !transition-all !shadow-md hover:!shadow-lg hover:!shadow-[#1abc60]/20 !flex !items-center !justify-center !gap-2 disabled:!opacity-50 disabled:!shadow-none active:!scale-95 !text-xs !cursor-pointer !border-none !outline-none"
                    >
                      {isSaving ? <Loader2 className="!w-4 !h-4 !animate-spin" /> : <><Save className="!w-4 !h-4" /> Save Changes</>}
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