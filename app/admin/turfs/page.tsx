"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Search, Edit2, Trash2, MapPin, IndianRupee, 
  Activity, Loader2, X, Check, Image as ImageIcon,
  Save, Filter, Calendar, Clock, Trophy, Settings,
  ChevronRight, Globe, Layers, Zap, Info, List, LayoutGrid, ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/app/services/api";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";
import MediaUpload from "@/components/MediaUpload";
import Swal from "sweetalert2";

interface Rate {
  day: string;
  price: number;
  isPeak: boolean;
}

interface OperatingHour {
  day: string;
  open: string;
  close: string;
  isOpen: boolean;
}

interface AvailableSlot {
  startTime: string;
  endTime: string;
  type: "Morning" | "Afternoon" | "Evening";
}

interface Court {
  name: string;
  type: string;
}

interface UnavailableDate {
  date: string;
  reason: string;
}

interface Turf {
  _id: string;
  name: string;
  location: {
    address: string;
    city: string;
    landmark?: string;
    mapUrl?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  pricePerHour: number;
  rates: Rate[];
  operatingHours: OperatingHour[];
  availableSlots: AvailableSlot[];
  courts: Court[];
  unavailableDates: UnavailableDate[];
  sports: string[];
  amenities: string[];
  images: string[];
  description?: string;
  isActive: boolean;
}

export default function AdminTurfPage() {
  const { user } = useAuth();
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTurf, setEditingTurf] = useState<Turf | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "location" | "availability" | "slots" | "pricing">("basic");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  const [availableSports, setAvailableSports] = useState<string[]>([]);
  const [commonAmenities, setCommonAmenities] = useState<string[]>([]);
  const [courtTypes, setCourtTypes] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    location: { address: "", city: "", landmark: "", mapUrl: "" },
    pricePerHour: 0,
    rates: [],
    operatingHours: [],
    availableSlots: [],
    courts: [{ name: "Court 1", courtType: "Synthetic" }],
    unavailableDates: [],
    sports: [],
    amenities: [],
    description: "",
    images: [],
    rating: 0,
    reviewsCount: 0
  } as any);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    fetchTurfs();
    fetchMasters();
  }, []);

  const fetchMasters = async () => {
    try {
      const res = await api.get("/masters");
      if (res.data.success) {
        const masters = res.data.masters;
        setAvailableSports(masters.filter((m: any) => m.category === "sport").map((m: any) => m.name));
        setCommonAmenities(masters.filter((m: any) => m.category === "amenity").map((m: any) => m.name));
        setCourtTypes(masters.filter((m: any) => m.category === "court_type").map((m: any) => m.name));
      }
    } catch (error) {
      console.error("Failed to fetch masters");
    }
  };

  const fetchTurfs = async () => {
    try {
      const res = await api.get("/turfs/my/all");
      if (res.data.success) setTurfs(res.data.turfs);
    } catch (error) {
      toast.error("Failed to fetch turfs");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("location", JSON.stringify(formData.location));
      data.append("pricePerHour", String(formData.pricePerHour));
      data.append("sports", JSON.stringify(formData.sports));
      data.append("amenities", JSON.stringify(formData.amenities));
      data.append("description", formData.description);
      data.append("rates", JSON.stringify(formData.rates));
      data.append("operatingHours", JSON.stringify(formData.operatingHours));
      data.append("availableSlots", JSON.stringify(formData.availableSlots));
      data.append("courts", JSON.stringify(formData.courts));
      data.append("unavailableDates", JSON.stringify(formData.unavailableDates));
      data.append("rating", String((formData as any).rating || 0));
      data.append("reviewsCount", String((formData as any).reviewsCount || 0));

      // Keep existing images (the ones that are already on the server)
      const existingImages = formData.images
        .filter((img: any) => !img.originalFile && typeof img.url === 'string')
        .map((img: any) => {
          // Extract the relative path /uploads/... from the full URL
          const url = img.url;
          if (url.includes('/uploads/')) {
            return '/uploads/' + url.split('/uploads/')[1];
          }
          return url;
        });
      data.append("existingImages", JSON.stringify(existingImages));

      // Append new files to be uploaded
      formData.images.forEach((img: any) => {
        if (img.originalFile) {
          data.append("images", img.originalFile);
        }
      });

      let res;
      if (editingTurf) {
        res = await api.put(`/turfs/${editingTurf._id}`, data, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        res = await api.post("/turfs", data, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      if (res.data.success) {
        Swal.fire({
          title: editingTurf ? "Success!" : "Created!",
          text: editingTurf ? "Turf updated successfully" : "Turf created successfully",
          icon: "success",
          confirmButtonColor: "#1abc60"
        });
        fetchTurfs();
        setShowModal(false);
        resetForm();
      }
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.error || "Failed to save turf",
        icon: "error",
        confirmButtonColor: "#1abc60"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      location: { address: "", city: "", landmark: "", mapUrl: "" },
      pricePerHour: 0,
      rates: days.map(day => ({ day, price: 0, isPeak: false })),
      operatingHours: days.map(day => ({ day, open: "06:00", close: "22:00", isOpen: true })),
      availableSlots: [],
      courts: [{ name: "Court 1", courtType: "Synthetic" }],
      unavailableDates: [],
      sports: [],
      amenities: [],
      description: "",
      images: [],
      rating: 0,
      reviewsCount: 0
    } as any);
    setEditingTurf(null);
    setActiveTab("basic");
  };

  const handleEdit = (turf: Turf) => {
    setEditingTurf(turf);
    setFormData({
      name: turf.name,
      location: {
        address: turf.location.address,
        city: turf.location.city,
        landmark: turf.location.landmark || "",
        mapUrl: turf.location.mapUrl || "",
      },
      pricePerHour: turf.pricePerHour,
      rates: turf.rates && turf.rates.length > 0 ? turf.rates : days.map(day => ({ day, price: turf.pricePerHour, isPeak: false })),
      operatingHours: turf.operatingHours || [],
      availableSlots: turf.availableSlots || [],
      courts: turf.courts || [],
      unavailableDates: turf.unavailableDates || [],
      sports: turf.sports || [],
      amenities: turf.amenities || [],
      description: turf.description || "",
      images: turf.images || [],
      rating: (turf as any).rating || 0,
      reviewsCount: (turf as any).reviewsCount || 0
    } as any);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#1abc60",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        const res = await api.delete(`/turfs/${id}`);
        if (res.data.success) {
          setTurfs(turfs.filter(t => t._id !== id));
          Swal.fire({
            title: "Deleted!",
            text: "Turf has been deleted.",
            icon: "success",
            confirmButtonColor: "#1abc60"
          });
        }
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "Failed to delete turf",
          icon: "error",
          confirmButtonColor: "#1abc60"
        });
      }
    }
  };

  const toggleItem = (item: string, list: string[], field: "sports" | "amenities") => {
    if (list.includes(item)) {
      setFormData((prev: any) => ({ ...prev, [field]: list.filter((i: string) => i !== item) }));
    } else {
      setFormData((prev: any) => ({ ...prev, [field]: [...list, item] }));
    }
  };

  const updateLocation = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      location: { ...prev.location, [field]: value }
    }));
  };

  const toggleTurfStatus = async (turf: Turf) => {
    try {
      const res = await api.put(`/turfs/${turf._id}`, { isActive: !turf.isActive });
      if (res.data.success) {
        setTurfs(turfs.map(t => t._id === turf._id ? { ...t, isActive: !t.isActive } : t));
        toast.success(`Turf ${!turf.isActive ? 'activated' : 'deactivated'} successfully`);
      }
    } catch (error) {
      toast.error("Failed to update turf status");
    }
  };

  const updateOperatingHours = (idx: number, field: string, value: any) => {
    const newHours = [...formData.operatingHours];
    newHours[idx] = { ...newHours[idx], [field]: value };
    setFormData((prev: any) => ({ ...prev, operatingHours: newHours }));
  };

  const updateSlot = (idx: number, field: string, value: string) => {
    const newSlots = [...formData.availableSlots];
    newSlots[idx] = { ...newSlots[idx], [field]: value };
    setFormData((prev: any) => ({ ...prev, availableSlots: newSlots }));
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTurfs = turfs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(turfs.length / itemsPerPage);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#1abc60]" /></div>;

  return (
    <div className="space-y-8">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Venue Inventory</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Manage your facility details and availability</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded-xl border border-slate-100 shadow-sm flex items-center mr-2">
            <button 
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-slate-100 text-[#1abc60]" : "text-slate-400 hover:text-slate-600"}`}
              title="Grid View"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-slate-100 text-[#1abc60]" : "text-slate-400 hover:text-slate-600"}`}
              title="List View"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-[#1abc60] hover:bg-[#16a085] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-black transition-all shadow-lg shadow-green-100 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-4 h-4" /> 
            <span>Add Venue</span>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Turfs", value: turfs.length, icon: Layers, color: "blue" },
          { label: "Active Venues", value: turfs.filter(t => t.isActive).length, icon: Zap, color: "emerald" },
          { label: "Avg. Price", value: `₹${Math.round(turfs.reduce((acc, t) => acc + t.pricePerHour, 0) / (turfs.length || 1))}`, icon: IndianRupee, color: "orange" },
          { label: "Total Sports", value: Array.from(new Set(turfs.flatMap(t => t.sports))).length, icon: Trophy, color: "purple" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 group hover:border-[#1abc60]/30 transition-all">
            <div className={`p-4 rounded-2xl bg-${stat.color === 'emerald' ? 'emerald' : stat.color}-50 text-${stat.color === 'emerald' ? 'emerald' : stat.color}-600 group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Turf Grid/List View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
          {currentTurfs.map((turf) => (
            <motion.div 
              key={turf._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 flex flex-col ${!turf.isActive ? 'grayscale-[0.3]' : ''}`}
            >
              <div className="h-56 relative overflow-hidden bg-slate-50">
                {turf.images[0] ? (
                  <img 
                    src={turf.images[0].startsWith('http') 
                      ? turf.images[0] 
                      : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '')}${turf.images[0]}`
                    } 
                    alt={turf.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-200">
                    <ImageIcon className="w-12 h-12" />
                  </div>
                )}
                
                <div className="absolute top-4 left-4 z-10">
                  <button 
                    onClick={() => toggleTurfStatus(turf)}
                    className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-md transition-all flex items-center gap-1.5 shadow-lg border border-white/20 ${
                      turf.isActive 
                        ? 'bg-emerald-500/90 text-white hover:bg-emerald-600' 
                        : 'bg-red-500/90 text-white hover:bg-red-600'
                    }`}
                    title={turf.isActive ? "Deactivate Venue" : "Activate Venue"}
                  >
                    <div className={`w-1 h-1 rounded-full ${turf.isActive ? 'bg-white animate-pulse' : 'bg-red-200'}`} />
                    {turf.isActive ? 'Live' : 'Closed'}
                  </button>
                </div>

                <div className="absolute top-4 right-4 flex gap-1.5 z-10">
                  <button 
                    onClick={() => handleEdit(turf)}
                    className="p-2 bg-white/90 backdrop-blur text-[#1abc60] rounded-lg hover:bg-[#1abc60] hover:text-white shadow-lg transition-all transform active:scale-95"
                    title="Edit Venue"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(turf._id)}
                    className="p-2 bg-red-500/90 backdrop-blur text-white rounded-lg hover:bg-red-600 shadow-lg transition-all transform active:scale-95"
                    title="Delete Venue"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-40" />
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-black text-slate-900 leading-tight transition-colors">{turf.name}</h3>
                    <div className="flex items-center gap-1 text-slate-400">
                      <MapPin className="w-3 h-3 text-[#1abc60]" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{turf.location.city}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center text-[#1abc60]">
                      <IndianRupee className="w-3 h-3 font-black" />
                      <span className="text-lg font-black text-slate-900">{turf.pricePerHour}</span>
                    </div>
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">Per Hour</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {turf.sports.slice(0, 3).map(s => (
                    <span key={s} className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded text-[8px] font-black uppercase tracking-wider border border-slate-100">{s}</span>
                  ))}
                  {turf.sports.length > 3 && (
                    <span className="px-2 py-0.5 bg-slate-50 text-slate-400 rounded text-[8px] font-black border border-slate-100">+{turf.sports.length - 3}</span>
                  )}
                </div>

                <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-[9px] font-black text-slate-500 uppercase">{turf.operatingHours?.[0]?.open || "06:00"} - {turf.operatingHours?.[0]?.close || "22:00"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Settings className="w-3 h-3 text-slate-400" />
                      <span className="text-[9px] font-black text-slate-500 uppercase">{turf.courts?.length || 1} Courts</span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5">Venue Details</th>
                  <th className="px-8 py-5">Sports & Amenities</th>
                  <th className="px-8 py-5">Pricing</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentTurfs.map((turf) => (
                  <tr key={turf._id} className={`group hover:bg-slate-50/50 transition-colors ${!turf.isActive ? 'opacity-75 grayscale-[0.3]' : ''}`}>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                          {turf.images[0] ? (
                            <img 
                              src={turf.images[0].startsWith('http') 
                                ? turf.images[0] 
                                : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '')}${turf.images[0]}`
                              } 
                              alt={turf.name} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-200">
                              <ImageIcon className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 mb-0.5 group-hover:text-[#1abc60] transition-colors">{turf.name}</h4>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <MapPin className="w-3 h-3" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{turf.location.city}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-1.5">
                        {turf.sports.slice(0, 2).map(s => (
                          <span key={s} className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded-md text-[9px] font-black uppercase tracking-wider border border-slate-100">{s}</span>
                        ))}
                        {turf.sports.length > 2 && <span className="text-[9px] font-black text-slate-300">+{turf.sports.length - 2}</span>}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <div className="flex items-center text-[#1abc60]">
                          <IndianRupee className="w-3 h-3 font-black" />
                          <span className="text-sm font-black text-slate-900">{turf.pricePerHour}</span>
                        </div>
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Per Hour</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => toggleTurfStatus(turf)}
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-2 border ${
                          turf.isActive 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' 
                            : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                        }`}
                      >
                        <div className={`w-1 h-1 rounded-full ${turf.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        {turf.isActive ? 'Live' : 'Closed'}
                      </button>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(turf)}
                          className="p-2 text-[#1abc60] bg-emerald-50 hover:bg-[#1abc60] hover:text-white rounded-lg transition-all transform active:scale-95 shadow-sm"
                          title="Edit Venue"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(turf._id)}
                          className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all transform active:scale-95 shadow-sm"
                          title="Delete Venue"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pb-12">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-[#1abc60] hover:border-[#1abc60]/30 transition-all disabled:opacity-50 disabled:hover:text-slate-400 disabled:hover:border-slate-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-2xl text-sm font-black transition-all ${
                  currentPage === i + 1 
                    ? "bg-[#1abc60] text-white shadow-lg shadow-green-100" 
                    : "bg-white text-slate-400 border border-slate-100 hover:border-[#1abc60]/30"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-[#1abc60] hover:border-[#1abc60]/30 transition-all disabled:opacity-50 disabled:hover:text-slate-400 disabled:hover:border-slate-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Modern Enhanced Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-5xl shadow-2xl overflow-hidden my-8"
            >
              <div className="flex h-[85vh]">
                {/* Modal Sidebar */}
                <div className="w-64 bg-slate-50 border-r border-slate-100 p-8 hidden lg:flex flex-col">
                  <div className="mb-12">
                    <div className="w-12 h-12 bg-[#1abc60] rounded-2xl flex items-center justify-center shadow-lg shadow-green-100 mb-4">
                      <Trophy className="text-white w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 leading-tight">
                      {editingTurf ? "Update Venue" : "List New Venue"}
                    </h3>
                  </div>

                  <nav className="space-y-2 flex-1">
                    {[
                      { id: "basic", label: "General Info", icon: Info },
                      { id: "location", label: "Location Details", icon: MapPin },
                      { id: "pricing", label: "Pricing & Rates", icon: IndianRupee },
                      { id: "availability", label: "Operating Hours", icon: Clock },
                      { id: "slots", label: "Booking Slots", icon: Calendar },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                          activeTab === tab.id 
                            ? "bg-white text-[#1abc60] shadow-sm border border-slate-100" 
                            : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    ))}
                  </nav>

                  <div className="bg-emerald-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Pro Tip</p>
                    <p className="text-xs text-emerald-700 leading-relaxed">Adding multiple high-quality photos increases bookings by 40%.</p>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="flex-1 flex flex-col min-w-0 bg-white">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center lg:hidden">
                    <h3 className="font-bold text-slate-900 uppercase tracking-widest text-[10px]">Venue Setup</h3>
                    <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><X className="text-slate-400 w-5 h-5" /></button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 lg:p-12 scrollbar-hide">
                    <form onSubmit={handleSubmit} className="space-y-12">
                      {activeTab === "basic" && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Venue Identity</label>
                              <input required value={formData.name} onChange={e => setFormData((prev: any) => ({...prev, name: e.target.value}))} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] transition-all text-slate-900 font-semibold placeholder:text-slate-300" placeholder="e.g. Wembley Sports Center" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Standard Hourly Rate</label>
                              <div className="flex items-center bg-white border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-[#1abc60]/20 focus-within:border-[#1abc60] transition-all">
                                <div className="pl-4 pr-1 text-slate-400">
                                  <IndianRupee className="w-4 h-4" />
                                </div>
                                <input 
                                  required 
                                  type="number" 
                                  value={formData.pricePerHour} 
                                  onChange={e => setFormData((prev: any) => ({...prev, pricePerHour: Number(e.target.value)}))} 
                                  className="flex-1 px-3 py-3.5 bg-transparent border-none outline-none text-slate-900 font-semibold placeholder:text-slate-300 focus:ring-0" 
                                  placeholder="0" 
                                />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Initial Rating</label>
                              <input type="number" step="0.1" min="0" max="5" value={(formData as any).rating || 0} onChange={e => setFormData((prev: any) => ({...prev, rating: Number(e.target.value)} as any))} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] transition-all text-slate-900 font-semibold" placeholder="e.g. 4.5" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Total Reviews</label>
                              <input type="number" value={(formData as any).reviewsCount || 0} onChange={e => setFormData((prev: any) => ({...prev, reviewsCount: Number(e.target.value)} as any))} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] transition-all text-slate-900 font-semibold" placeholder="e.g. 250" />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 text-center block">Supported Activities</label>
                            <div className="flex flex-wrap justify-center gap-3">
                              {availableSports.map(s => {
                                const isSelected = formData.sports.includes(s);
                                return (
                                  <button 
                                    key={s} type="button"
                                    onClick={() => toggleItem(s, formData.sports, "sports")}
                                    className={`group flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black transition-all border-2 ${
                                      isSelected 
                                        ? 'bg-[#1abc60] text-white border-[#1abc60] shadow-xl shadow-green-100 scale-105' 
                                        : 'bg-slate-50 text-slate-400 border-transparent hover:border-slate-200 hover:bg-white'
                                    }`}
                                  >
                                    {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400" />}
                                    {s}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Premium Amenities</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                              {commonAmenities.map(a => {
                                const isSelected = formData.amenities.includes(a);
                                return (
                                  <button 
                                    key={a} type="button"
                                    onClick={() => toggleItem(a, formData.amenities, "amenities")}
                                    className={`flex items-center justify-between px-5 py-4 rounded-2xl text-xs font-black transition-all border-2 ${
                                      isSelected 
                                        ? 'bg-[#1abc60] text-white border-[#1abc60] shadow-lg shadow-green-50' 
                                        : 'bg-slate-50 text-slate-400 border-transparent hover:border-slate-200 hover:bg-white'
                                    }`}
                                  >
                                    <span>{a}</span>
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                                      isSelected ? 'bg-white text-[#1abc60]' : 'bg-slate-200 text-transparent'
                                    }`}>
                                      <Check className="w-3 h-3" />
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">About Venue</label>
                            <textarea 
                              value={formData.description} 
                              onChange={e => setFormData({...formData, description: e.target.value})}
                              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] transition-all text-slate-900 font-semibold h-32 resize-none" 
                              placeholder="Describe your venue, its highlights, and any special instructions for players..."
                            />
                          </div>

                          <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Gallery</label>
                            <div className="bg-slate-50/50 rounded-2xl p-6 border-2 border-dashed border-slate-200">
                              <MediaUpload 
                                initialFiles={editingTurf ? editingTurf.images : []}
                                onFilesChange={(files) => setFormData({...formData, images: files})} 
                                className="bg-transparent" 
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === "location" && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">City</label>
                              <input required value={formData.location.city} onChange={e => updateLocation("city", e.target.value)} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] transition-all text-slate-900 font-semibold" placeholder="e.g. Bangalore" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Landmark</label>
                              <input value={formData.location.landmark} onChange={e => updateLocation("landmark", e.target.value)} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] transition-all text-slate-900 font-semibold" placeholder="e.g. Near Central Mall" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Physical Address</label>
                            <textarea required value={formData.location.address} onChange={e => updateLocation("address", e.target.value)} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] transition-all text-slate-900 font-semibold h-32 resize-none" placeholder="Enter complete venue address..." />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Google Maps URL</label>
                            <input value={formData.location.mapUrl} onChange={e => updateLocation("mapUrl", e.target.value)} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] transition-all text-slate-900 font-semibold" placeholder="https://maps.google.com/..." />
                          </div>
                        </motion.div>
                      )}

                      {activeTab === "pricing" && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                          <div className="bg-slate-900 p-6 rounded-[2rem] mb-8">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-[#1abc60] rounded-xl flex items-center justify-center">
                                <IndianRupee className="text-white w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="text-white font-bold text-sm">Pricing & Rates</h4>
                                <p className="text-slate-400 text-[10px] uppercase tracking-wider">Set custom pricing for different days and peak hours</p>
                              </div>
                            </div>
                          </div>

                          <div className="grid gap-3">
                            {formData.rates.map((rate: any, idx: number) => (
                              <div key={rate.day} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 bg-white shadow-sm transition-all">
                                <span className="w-28 text-sm font-black text-slate-700">{rate.day}</span>
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="flex-1 flex items-center bg-slate-50 border border-slate-100 rounded-xl focus-within:ring-2 focus-within:ring-[#1abc60] transition-all">
                                    <div className="pl-3 pr-1 text-slate-400">
                                      <IndianRupee className="w-3.5 h-3.5" />
                                    </div>
                                    <input 
                                      type="number" 
                                      value={rate.price} 
                                      onChange={e => {
                                        const newRates = [...formData.rates];
                                        newRates[idx].price = Number(e.target.value);
                                        setFormData((prev: any) => ({...prev, rates: newRates}));
                                      }} 
                                      className="flex-1 px-2 py-2 bg-transparent border-none text-xs font-bold outline-none focus:ring-0" 
                                      placeholder="Price" 
                                    />
                                  </div>
                                  <label className="flex items-center gap-3 cursor-pointer select-none">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${rate.isPeak ? 'text-orange-500' : 'text-slate-400'}`}>
                                      {rate.isPeak ? 'Peak Hour' : 'Regular'}
                                    </span>
                                    <div className="relative inline-flex items-center cursor-pointer">
                                      <input type="checkbox" checked={rate.isPeak} onChange={e => {
                                        const newRates = [...formData.rates];
                                        newRates[idx].isPeak = e.target.checked;
                                        setFormData((prev: any) => ({...prev, rates: newRates}));
                                      }} className="sr-only peer" />
                                      <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                                    </div>
                                  </label>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {activeTab === "availability" && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                          <div className="grid gap-3">
                            {formData.operatingHours.map((oh: any, idx: number) => (
                              <div key={oh.day} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${oh.isOpen ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-transparent opacity-60'}`}>
                                <span className="w-28 text-sm font-bold text-slate-700">{oh.day}</span>
                                <div className="flex items-center gap-3">
                                  <input type="time" value={oh.open} disabled={!oh.isOpen} onChange={e => updateOperatingHours(idx, "open", e.target.value)} className="px-3 py-2 rounded-lg bg-slate-100 border-none text-xs font-bold" />
                                  <span className="text-slate-300 font-bold text-[10px]">TO</span>
                                  <input type="time" value={oh.close} disabled={!oh.isOpen} onChange={e => updateOperatingHours(idx, "close", e.target.value)} className="px-3 py-2 rounded-lg bg-slate-100 border-none text-xs font-bold" />
                                </div>
                                <label className="ml-auto relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" checked={oh.isOpen} onChange={e => updateOperatingHours(idx, "isOpen", e.target.checked)} className="sr-only peer" />
                                  <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1abc60]"></div>
                                </label>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {activeTab === "slots" && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Time Interval Setup</h4>
                            <button type="button" onClick={() => setFormData((prev: any) => ({...prev, availableSlots: [...prev.availableSlots, { startTime: "06:00", endTime: "07:00", type: "Morning" }]}))} className="bg-[#1abc60] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-[#16a085] transition-all shadow-lg shadow-[#1abc60]/20">
                              <Plus className="w-3.5 h-3.5" /> Add New Interval
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {formData.availableSlots.map((slot: any, idx: number) => (
                              <div key={idx} className="flex flex-col gap-4 bg-white p-6 rounded-2xl border-2 border-[#1abc60]/20 hover:border-[#1abc60] shadow-sm transition-all relative group">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">From</label>
                                    <input type="time" value={slot.startTime} onChange={e => updateSlot(idx, "startTime", e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] outline-none transition-all" />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">To</label>
                                    <input type="time" value={slot.endTime} onChange={e => updateSlot(idx, "endTime", e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] outline-none transition-all" />
                                  </div>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex-1 space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phase</label>
                                    <select value={slot.type} onChange={e => updateSlot(idx, "type", e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#1abc60]/20 transition-all appearance-none cursor-pointer">
                                      <option>Morning</option>
                                      <option>Afternoon</option>
                                      <option>Evening</option>
                                    </select>
                                  </div>
                                  <button type="button" onClick={() => setFormData((prev: any) => ({...prev, availableSlots: prev.availableSlots.filter((_: any, i: number) => i !== idx)}))} className="mt-5 p-2.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="pt-8 border-t border-slate-100">
                            <div className="flex justify-between items-center mb-6">
                              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Calendar Blocking</h4>
                              <button type="button" onClick={() => setFormData((prev: any) => ({...prev, unavailableDates: [...prev.unavailableDates, { date: new Date().toISOString().split('T')[0], reason: "Maintenance" }]}))} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95">
                                <Plus className="w-3.5 h-3.5" /> Block Date
                              </button>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                              {formData.unavailableDates.map((ud: any, idx: number) => (
                                <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-end gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-[#1abc60]/30 transition-all group">
                                  <div className="space-y-1.5 w-full sm:w-56">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Blocked Date</label>
                                    <input type="date" value={new Date(ud.date).toISOString().split('T')[0]} onChange={e => {
                                      const newDates = [...formData.unavailableDates];
                                      newDates[idx].date = e.target.value;
                                      setFormData((prev: any) => ({...prev, unavailableDates: newDates}));
                                    }} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#1abc60]/20 outline-none transition-all" />
                                  </div>
                                  <div className="space-y-1.5 flex-1 w-full">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason for Blocking</label>
                                    <textarea 
                                      value={ud.reason} 
                                      placeholder="e.g. Annual Maintenance or Private Event" 
                                      onChange={e => {
                                        const newDates = [...formData.unavailableDates];
                                        newDates[idx].reason = e.target.value;
                                        setFormData((prev: any) => ({...prev, unavailableDates: newDates}));
                                      }} 
                                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#1abc60]/20 outline-none transition-all h-20 resize-none" 
                                    />
                                  </div>
                                  <button type="button" onClick={() => setFormData((prev: any) => ({...prev, unavailableDates: prev.unavailableDates.filter((_: any, i: number) => i !== idx)}))} className="p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm self-end sm:self-auto mb-0.5">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                        <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-400 hover:text-slate-600 transition-colors text-sm">Cancel</button>
                        <button disabled={isSaving} type="submit" className="px-6 py-2.5 bg-[#1abc60] text-white rounded-xl font-black shadow-lg shadow-[#1abc60]/20 flex items-center gap-2 hover:bg-[#16a085] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 text-sm">
                          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> {editingTurf ? "Update Venue" : "Publish Venue"}</>}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
