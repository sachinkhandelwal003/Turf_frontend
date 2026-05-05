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

      const existingImages = formData.images
        .filter((img: any) => !img.originalFile && typeof img.url === 'string')
        .map((img: any) => {
          const url = img.url;
          if (url.includes('/uploads/')) {
            return '/uploads/' + url.split('/uploads/')[1];
          }
          return url;
        });
      data.append("existingImages", JSON.stringify(existingImages));

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
      cancelButtonColor: "#64748b",
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTurfs = turfs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(turfs.length / itemsPerPage);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#1abc60]" /></div>;

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Venue Inventory</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your facility details, pricing, and availability.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-gray-100/80 p-1 rounded-lg flex items-center border border-gray-200/50">
            <button 
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white text-[#1abc60] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white text-[#1abc60] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-[#1abc60] hover:bg-[#16a085] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> 
            <span>Add Venue</span>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[
          { label: "Total Turfs", value: turfs.length, icon: Layers, color: "blue" },
          { label: "Active Venues", value: turfs.filter(t => t.isActive).length, icon: Zap, color: "emerald" },
          { label: "Avg. Price", value: `₹${Math.round(turfs.reduce((acc, t) => acc + t.pricePerHour, 0) / (turfs.length || 1))}`, icon: IndianRupee, color: "orange" },
          { label: "Total Sports", value: Array.from(new Set(turfs.flatMap(t => t.sports))).length, icon: Trophy, color: "purple" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-${stat.color === 'emerald' ? 'emerald' : stat.color}-50 text-${stat.color === 'emerald' ? 'emerald' : stat.color}-600`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Turf Grid/List View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
          {currentTurfs.map((turf) => (
            <motion.div 
              key={turf._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300 flex flex-col ${!turf.isActive ? 'grayscale-[0.4] opacity-80' : ''}`}
            >
              <div className="h-52 relative overflow-hidden bg-gray-100">
                {turf.images[0] ? (
                  <img 
                    src={turf.images[0].startsWith('http') 
                      ? turf.images[0] 
                      : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '')}${turf.images[0]}`
                    } 
                    alt={turf.name}
                    onError={(e) => {
                      e.currentTarget.src = "https://placehold.co/600x400/f8fafc/94a3b8?text=Image+Not+Found";
                      e.currentTarget.onerror = null;
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-xs font-medium">No Image</span>
                  </div>
                )}
                
                {/* Professional Overlay Badges */}
                <div className="absolute top-3 left-3 z-10">
                  <button 
                    onClick={() => toggleTurfStatus(turf)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold backdrop-blur-md transition-all flex items-center gap-1.5 shadow-sm border ${
                      turf.isActive 
                        ? 'bg-white/90 text-emerald-600 border-white/40 hover:bg-white' 
                        : 'bg-white/90 text-gray-500 border-white/40 hover:bg-white'
                    }`}
                    title={turf.isActive ? "Deactivate Venue" : "Activate Venue"}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${turf.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                    {turf.isActive ? 'Active' : 'Closed'}
                  </button>
                </div>

                <div className="absolute top-3 right-3 flex gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEdit(turf)}
                    className="p-1.5 bg-white/90 backdrop-blur-sm text-gray-600 rounded-md hover:text-blue-600 hover:bg-white shadow-sm transition-all"
                    title="Edit Venue"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(turf._id)}
                    className="p-1.5 bg-white/90 backdrop-blur-sm text-gray-600 rounded-md hover:text-red-600 hover:bg-white shadow-sm transition-all"
                    title="Delete Venue"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent opacity-60 pointer-events-none" />
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{turf.name}</h3>
                    <div className="flex items-center gap-1 text-gray-500">
                      <MapPin className="w-3 h-3 text-[#1abc60]" />
                      <span className="text-xs font-medium">{turf.location.city}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center text-gray-900">
                      <IndianRupee className="w-3.5 h-3.5 font-bold" />
                      <span className="text-lg font-bold">{turf.pricePerHour}</span>
                    </div>
                    <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Per Hour</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {turf.sports.slice(0, 3).map(s => (
                    <span key={s} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">{s}</span>
                  ))}
                  {turf.sports.length > 3 && (
                    <span className="px-2 py-1 bg-gray-50 text-gray-500 rounded-md text-xs font-medium border border-gray-100">+{turf.sports.length - 3}</span>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs font-medium text-gray-600">{turf.operatingHours?.[0]?.open || "06:00"} - {turf.operatingHours?.[0]?.close || "22:00"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Settings className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs font-medium text-gray-600">{turf.courts?.length || 1} Courts</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Venue Details</th>
                  <th className="px-6 py-4">Sports & Amenities</th>
                  <th className="px-6 py-4">Pricing</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentTurfs.map((turf) => (
                  <tr key={turf._id} className={`group hover:bg-gray-50/50 transition-colors ${!turf.isActive ? 'opacity-75 grayscale-[0.3]' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200 relative">
                          {turf.images[0] ? (
                            <img 
                              src={turf.images[0].startsWith('http') 
                                ? turf.images[0] 
                                : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '')}${turf.images[0]}`
                              } 
                              alt={turf.name}
                              onError={(e) => {
                                e.currentTarget.src = "https://placehold.co/150x150/f8fafc/94a3b8?text=N/A";
                                e.currentTarget.onerror = null;
                              }}
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 mb-1">{turf.name}</h4>
                          <div className="flex items-center gap-1 text-gray-500">
                            <MapPin className="w-3 h-3" />
                            <span className="text-xs font-medium">{turf.location.city}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {turf.sports.slice(0, 2).map(s => (
                          <span key={s} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">{s}</span>
                        ))}
                        {turf.sports.length > 2 && <span className="text-xs font-medium text-gray-400">+{turf.sports.length - 2}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center text-gray-900">
                          <IndianRupee className="w-3.5 h-3.5 font-bold" />
                          <span className="text-sm font-bold">{turf.pricePerHour}</span>
                        </div>
                        <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Per Hour</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleTurfStatus(turf)}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                          turf.isActive 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' 
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${turf.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                        {turf.isActive ? 'Active' : 'Closed'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(turf)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                          title="Edit Venue"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(turf._id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
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
        <div className="flex justify-center items-center gap-2 pb-12">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                  currentPage === i + 1 
                    ? "bg-[#1abc60] text-white border border-[#1abc60]" 
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Professional Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-gray-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden my-8 border border-gray-200"
            >
              <div className="flex h-[85vh]">
                {/* Modal Sidebar */}
                <div className="w-64 bg-gray-50 border-r border-gray-200 p-6 hidden lg:flex flex-col">
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900">
                      {editingTurf ? "Update Venue" : "Add New Venue"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Fill in the facility details.</p>
                  </div>

                  <nav className="space-y-1.5 flex-1">
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
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          activeTab === tab.id 
                            ? "bg-white text-[#1abc60] shadow-sm border border-gray-200" 
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Modal Content */}
                <div className="flex-1 flex flex-col min-w-0 bg-white">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center lg:hidden bg-gray-50">
                    <h3 className="font-semibold text-gray-900 text-sm">Venue Setup</h3>
                    <button onClick={() => setShowModal(false)} className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-md transition-colors"><X className="w-5 h-5" /></button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 lg:p-10 scrollbar-hide">
                    <form onSubmit={handleSubmit} className="space-y-8">
                      {activeTab === "basic" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                              <label className="block text-sm font-medium text-gray-700">Venue Name</label>
                              <input required value={formData.name} onChange={e => setFormData((prev: any) => ({...prev, name: e.target.value}))} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] outline-none text-sm transition-all" placeholder="e.g. Wembley Sports Center" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="block text-sm font-medium text-gray-700">Standard Hourly Rate</label>
                              <div className="flex items-center bg-white border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-[#1abc60]/20 focus-within:border-[#1abc60] overflow-hidden transition-all">
                                <div className="pl-3 pr-2 text-gray-500 border-r border-gray-200 bg-gray-50 py-2.5">
                                  <IndianRupee className="w-4 h-4" />
                                </div>
                                <input 
                                  required 
                                  type="number" 
                                  value={formData.pricePerHour} 
                                  onChange={e => setFormData((prev: any) => ({...prev, pricePerHour: Number(e.target.value)}))} 
                                  className="flex-1 px-3 py-2.5 bg-transparent border-none outline-none text-sm focus:ring-0" 
                                  placeholder="0" 
                                />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                              <label className="block text-sm font-medium text-gray-700">Initial Rating</label>
                              <input type="number" step="0.1" min="0" max="5" value={(formData as any).rating || 0} onChange={e => setFormData((prev: any) => ({...prev, rating: Number(e.target.value)} as any))} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] outline-none text-sm transition-all" placeholder="e.g. 4.5" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="block text-sm font-medium text-gray-700">Total Reviews</label>
                              <input type="number" value={(formData as any).reviewsCount || 0} onChange={e => setFormData((prev: any) => ({...prev, reviewsCount: Number(e.target.value)} as any))} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] outline-none text-sm transition-all" placeholder="e.g. 250" />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Supported Activities</label>
                            <div className="flex flex-wrap gap-2">
                              {availableSports.map(s => {
                                const isSelected = formData.sports.includes(s);
                                return (
                                  <button 
                                    key={s} type="button"
                                    onClick={() => toggleItem(s, formData.sports, "sports")}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all border ${
                                      isSelected 
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                    }`}
                                  >
                                    {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-gray-400" />}
                                    {s}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Premium Amenities</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {commonAmenities.map(a => {
                                const isSelected = formData.amenities.includes(a);
                                return (
                                  <button 
                                    key={a} type="button"
                                    onClick={() => toggleItem(a, formData.amenities, "amenities")}
                                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                                      isSelected 
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                    }`}
                                  >
                                    <span>{a}</span>
                                    {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">About Venue</label>
                            <textarea 
                              value={formData.description} 
                              onChange={e => setFormData({...formData, description: e.target.value})}
                              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] outline-none text-sm transition-all h-28 resize-none" 
                              placeholder="Describe your venue..."
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Gallery</label>
                            <div className="bg-gray-50 rounded-lg p-5 border border-dashed border-gray-300">
                              <MediaUpload 
                                initialFiles={editingTurf ? editingTurf.images : []}
                                onFilesChange={(files) => setFormData({...formData, images: files})} 
                                className="bg-transparent" 
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* KEEPING OTHER TABS LOGIC BUT SIMPLIFYING THEIR CLASSES TO MATCH */}
                      {activeTab === "location" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                              <label className="block text-sm font-medium text-gray-700">City</label>
                              <input required value={formData.location.city} onChange={e => updateLocation("city", e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] outline-none text-sm transition-all" placeholder="e.g. Bangalore" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="block text-sm font-medium text-gray-700">Landmark</label>
                              <input value={formData.location.landmark} onChange={e => updateLocation("landmark", e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] outline-none text-sm transition-all" placeholder="e.g. Near Central Mall" />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Physical Address</label>
                            <textarea required value={formData.location.address} onChange={e => updateLocation("address", e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] outline-none text-sm transition-all h-28 resize-none" placeholder="Enter complete venue address..." />
                          </div>
                          <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Google Maps URL</label>
                            <input value={formData.location.mapUrl} onChange={e => updateLocation("mapUrl", e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] outline-none text-sm transition-all" placeholder="https://maps.google.com/..." />
                          </div>
                        </motion.div>
                      )}

                      {activeTab === "pricing" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                           <div className="grid gap-3">
                            {formData.rates.map((rate: any, idx: number) => (
                              <div key={rate.day} className="flex items-center gap-4 p-3.5 rounded-lg border border-gray-200 bg-white shadow-sm">
                                <span className="w-24 text-sm font-semibold text-gray-700">{rate.day}</span>
                                <div className="flex items-center gap-4 flex-1">
                                  <div className="flex-1 flex items-center border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-[#1abc60]/20 focus-within:border-[#1abc60] overflow-hidden">
                                    <div className="pl-3 pr-2 text-gray-500 bg-gray-50 py-2 border-r border-gray-200">
                                      <IndianRupee className="w-3.5 h-3.5" />
                                    </div>
                                    <input 
                                      type="number" value={rate.price} 
                                      onChange={e => {
                                        const newRates = [...formData.rates];
                                        newRates[idx].price = Number(e.target.value);
                                        setFormData((prev: any) => ({...prev, rates: newRates}));
                                      }} 
                                      className="flex-1 px-3 py-2 bg-transparent border-none text-sm outline-none focus:ring-0" 
                                    />
                                  </div>
                                  <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <span className={`text-xs font-medium uppercase tracking-wider ${rate.isPeak ? 'text-orange-600' : 'text-gray-400'}`}>
                                      {rate.isPeak ? 'Peak' : 'Regular'}
                                    </span>
                                    <div className="relative inline-flex items-center">
                                      <input type="checkbox" checked={rate.isPeak} onChange={e => {
                                        const newRates = [...formData.rates];
                                        newRates[idx].isPeak = e.target.checked;
                                        setFormData((prev: any) => ({...prev, rates: newRates}));
                                      }} className="sr-only peer" />
                                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                                    </div>
                                  </label>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {activeTab === "availability" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                           {formData.operatingHours.map((oh: any, idx: number) => (
                              <div key={oh.day} className={`flex items-center gap-4 p-3.5 rounded-lg border transition-all ${oh.isOpen ? 'bg-white border-gray-200 shadow-sm' : 'bg-gray-50 border-dashed opacity-60'}`}>
                                <span className="w-24 text-sm font-semibold text-gray-700">{oh.day}</span>
                                <div className="flex items-center gap-2">
                                  <input type="time" value={oh.open} disabled={!oh.isOpen} onChange={e => updateOperatingHours(idx, "open", e.target.value)} className="px-3 py-1.5 rounded-md border border-gray-300 text-sm focus:border-[#1abc60] focus:ring-1 focus:ring-[#1abc60] outline-none" />
                                  <span className="text-gray-400 font-medium text-xs">to</span>
                                  <input type="time" value={oh.close} disabled={!oh.isOpen} onChange={e => updateOperatingHours(idx, "close", e.target.value)} className="px-3 py-1.5 rounded-md border border-gray-300 text-sm focus:border-[#1abc60] focus:ring-1 focus:ring-[#1abc60] outline-none" />
                                </div>
                                <label className="ml-auto relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" checked={oh.isOpen} onChange={e => updateOperatingHours(idx, "isOpen", e.target.checked)} className="sr-only peer" />
                                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1abc60]"></div>
                                </label>
                              </div>
                            ))}
                        </motion.div>
                      )}

                      {activeTab === "slots" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                          <div className="flex justify-between items-center">
                            <h4 className="text-sm font-semibold text-gray-900">Time Interval Setup</h4>
                            <button type="button" onClick={() => setFormData((prev: any) => ({...prev, availableSlots: [...prev.availableSlots, { startTime: "06:00", endTime: "07:00", type: "Morning" }]}))} className="bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 hover:bg-gray-50 transition-all shadow-sm">
                              <Plus className="w-4 h-4" /> Add Slot
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {formData.availableSlots.map((slot: any, idx: number) => (
                              <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative group">
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                  <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-600">From</label>
                                    <input type="time" value={slot.startTime} onChange={e => updateSlot(idx, "startTime", e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:border-[#1abc60] focus:ring-1 focus:ring-[#1abc60] outline-none" />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-600">To</label>
                                    <input type="time" value={slot.endTime} onChange={e => updateSlot(idx, "endTime", e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:border-[#1abc60] focus:ring-1 focus:ring-[#1abc60] outline-none" />
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <select value={slot.type} onChange={e => updateSlot(idx, "type", e.target.value)} className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:border-[#1abc60] focus:ring-1 focus:ring-[#1abc60]">
                                    <option>Morning</option>
                                    <option>Afternoon</option>
                                    <option>Evening</option>
                                  </select>
                                  <button type="button" onClick={() => setFormData((prev: any) => ({...prev, availableSlots: prev.availableSlots.filter((_: any, i: number) => i !== idx)}))} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Footer Actions */}
                      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-8">
                        <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors text-sm">Cancel</button>
                        <button disabled={isSaving} type="submit" className="px-6 py-2.5 bg-[#1abc60] text-white rounded-lg font-medium shadow-sm flex items-center gap-2 hover:bg-[#16a085] transition-all disabled:opacity-50 text-sm">
                          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> {editingTurf ? "Save Changes" : "Create Venue"}</>}
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