"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  MapPin,
  IndianRupee,
  Loader2,
  X,
  Check,
  Image as ImageIcon,
  Save,
  Clock,
  Trophy,
  Settings,
  ChevronRight,
  Layers,
  Zap,
  Info,
  List,
  LayoutGrid,
  ChevronLeft,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/app/services/api";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";
import MediaUpload from "@/components/MediaUpload";
import Swal from "sweetalert2";

// ============= Types =============
interface Rate {
  day: string;
  price: number;
  isPeak: boolean;
}

interface PriceHike {
  startTime: string;
  endTime: string;
  extraPrice: number;
}

interface OperatingHour {
  day: string;
  open: string;
  close: string;
  isOpen: boolean;
}

interface Court {
  name: string;
  courtType: string;
  isActive?: boolean;
}

interface Location {
  address: string;
  city: string;
  landmark?: string;
  mapUrl?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface Turf {
  _id: string;
  name: string;
  location: Location;
  pricePerHour: number;
  slotDuration?: number;
  rates: Rate[];
  priceHikes?: PriceHike[];
  operatingHours: OperatingHour[];
  courts: Court[];
  sports: string[];
  amenities: string[];
  images: string[];
  description?: string;
  isActive: boolean;
  rating?: number;
  reviewsCount?: number;
}

interface TurfFormData {
  name: string;
  location: Location;
  pricePerHour: number;
  slotDuration: number;
  rates: Rate[];
  priceHikes: PriceHike[];
  operatingHours: OperatingHour[];
  courts: Court[];
  sports: string[];
  amenities: string[];
  description: string;
  images: (string | { url: string; originalFile?: File })[];
  rating: number;
  reviewsCount: number;
}

interface ValidationErrors {
  [key: string]: string;
}

// ============= Constants =============
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

const SLOT_DURATIONS = [
  { value: 30, label: "30 Minutes" },
  { value: 60, label: "60 Minutes" },
  { value: 90, label: "90 Minutes" },
  { value: 120, label: "120 Minutes" },
] as const;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE_URL) {
  console.error("NEXT_PUBLIC_API_URL is not defined");
}

// ============= Helper Functions =============
const getImageUrl = (path: string): string => {
  if (!path) return "https://placehold.co/600x400/f8fafc/94a3b8?text=No+Image";
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL?.replace(/\/api$/, '')}${path}`;
};

const getEmptyFormData = (): TurfFormData => ({
  name: "",
  location: { address: "", city: "", landmark: "", mapUrl: "" },
  pricePerHour: 0,
  slotDuration: 60,
  rates: DAYS.map(day => ({ day, price: 0, isPeak: false })),
  priceHikes: [],
  operatingHours: DAYS.map(day => ({ day, open: "06:00", close: "22:00", isOpen: true })),
  courts: [{ name: "Court 1", courtType: "Synthetic" }],
  sports: [],
  amenities: [],
  description: "",
  images: [],
  rating: 0,
  reviewsCount: 0
});

const transformTurfToFormData = (turf: Turf): TurfFormData => ({
  name: turf.name,
  location: {
    address: turf.location.address,
    city: turf.location.city,
    landmark: turf.location.landmark || "",
    mapUrl: turf.location.mapUrl || "",
  },
  pricePerHour: turf.pricePerHour,
  slotDuration: turf.slotDuration || 60,
  rates: turf.rates && turf.rates.length > 0 
    ? turf.rates 
    : DAYS.map(day => ({ day, price: turf.pricePerHour, isPeak: false })),
  priceHikes: Array.isArray(turf.priceHikes) 
    ? turf.priceHikes 
    : (typeof turf.priceHikes === 'string' ? JSON.parse(turf.priceHikes) : []),
  operatingHours: turf.operatingHours.length > 0 
    ? turf.operatingHours 
    : DAYS.map(day => ({ day, open: "06:00", close: "22:00", isOpen: true })),
  courts: turf.courts && turf.courts.length > 0 ? turf.courts : [{ name: "Court 1", courtType: "" }],
  sports: turf.sports || [],
  amenities: turf.amenities || [],
  description: turf.description || "",
  images: turf.images || [],
  rating: turf.rating || 0,
  reviewsCount: turf.reviewsCount || 0
});

const validateForm = (formData: TurfFormData): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  if (!formData.name.trim()) errors.name = "Venue name is required";
  if (!formData.location.city.trim()) errors.city = "City is required";
  if (!formData.location.address.trim()) errors.address = "Address is required";
  if (formData.pricePerHour <= 0) errors.price = "Price must be greater than 0";
  if (formData.sports.length === 0) errors.sports = "Select at least one sport";
  
  formData.operatingHours.forEach((hour, idx) => {
    if (hour.isOpen && hour.open >= hour.close) {
      errors[`hours_${idx}`] = "Opening time must be before closing time";
    }
  });
  
  return errors;
};

// ============= Custom Hooks =============
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
};

const useTurfForm = (initialTurf?: Turf | null) => {
  const [formData, setFormData] = useState<TurfFormData>(() => 
    initialTurf ? transformTurfToFormData(initialTurf) : getEmptyFormData()
  );
  const [errors, setErrors] = useState<ValidationErrors>({});
  
  const updateField = useCallback((field: keyof TurfFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  }, [errors]);
  
  const updateNested = useCallback((path: string[], value: unknown) => {
    setFormData(prev => {
      const newData = { ...prev };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let current: any = newData;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newData;
    });
  }, []);
  
  const updateLocation = useCallback((field: keyof Location, value: string) => {
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, [field]: value }
    }));
  }, []);
  
  const resetForm = useCallback(() => {
    setFormData(getEmptyFormData());
    setErrors({});
  }, []);
  
  const setFormFromTurf = useCallback((turf: Turf) => {
    setFormData(transformTurfToFormData(turf));
    setErrors({});
  }, []);
  
  return { 
    formData, 
    errors, 
    setErrors,
    updateField, 
    updateNested, 
    updateLocation, 
    resetForm,
    setFormFromTurf 
  };
};

// ============= Subcomponents =============
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="h-52 bg-gray-200 animate-pulse" />
    <div className="p-5 space-y-3">
      <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
      <div className="flex gap-2">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-16" />
        <div className="h-6 bg-gray-200 rounded animate-pulse w-16" />
      </div>
      <div className="h-8 bg-gray-200 rounded animate-pulse w-full" />
    </div>
  </div>
);

const STAT_COLOR_CLASS: Record<string, { bg: string; text: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-600" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
  orange: { bg: "bg-orange-50", text: "text-orange-600" },
  purple: { bg: "bg-purple-50", text: "text-purple-600" },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const StatsCard = ({ label, value, icon: Icon, color }: any) => {
  const c = STAT_COLOR_CLASS[color] ?? STAT_COLOR_CLASS.blue;
  return (
  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
    <div className={`p-3 rounded-xl ${c.bg} ${c.text}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
    </div>
  </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TurfCard = ({ turf, onEdit, onDelete, onToggleStatus }: any) => {
  const [imgError, setImgError] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300 flex flex-col ${!turf.isActive ? 'grayscale-[0.4] opacity-80' : ''}`}
    >
      <div className="h-52 relative overflow-hidden bg-gray-100">
        {turf.images[0] && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={getImageUrl(turf.images[0])}
            alt={turf.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-xs font-medium">No Image</span>
          </div>
        )}
        
        <div className="absolute top-3 left-3 z-10">
          <button
            onClick={() => onToggleStatus(turf)}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold backdrop-blur-md transition-all flex items-center gap-1.5 shadow-sm border ${
              turf.isActive
                ? 'bg-white/90 text-emerald-600 border-white/40 hover:bg-white'
                : 'bg-white/90 text-gray-500 border-white/40 hover:bg-white'
            }`}
            aria-label={turf.isActive ? "Deactivate Venue" : "Activate Venue"}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${turf.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
            {turf.isActive ? 'Active' : 'Closed'}
          </button>
        </div>
        
        <div className="absolute top-3 right-3 flex gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(turf)}
            className="p-1.5 bg-white/90 backdrop-blur-sm text-gray-600 rounded-md hover:text-blue-600 hover:bg-white shadow-sm transition-all"
            aria-label="Edit Venue"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(turf._id)}
            className="p-1.5 bg-white/90 backdrop-blur-sm text-gray-600 rounded-md hover:text-red-600 hover:bg-white shadow-sm transition-all"
            aria-label="Delete Venue"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        
        <div className="absolute inset-0 bg-linear-to-t from-gray-900/60 via-transparent to-transparent opacity-60 pointer-events-none" />
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
          {turf.sports.slice(0, 3).map((s: string) => (
            <span key={s} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">{s}</span>
          ))}
          {turf.sports.length > 3 && (
            <span className="px-2 py-1 bg-gray-50 text-gray-500 rounded-md text-xs font-medium border border-gray-100">
              +{turf.sports.length - 3}
            </span>
          )}
        </div>
        
        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-medium text-gray-600">
                {turf.operatingHours?.[0]?.open || "06:00"} - {turf.operatingHours?.[0]?.close || "22:00"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-medium text-gray-600">{turf.courts?.length || 1} Courts</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TurfTableRow = ({ turf, onEdit, onDelete, onToggleStatus }: any) => {
  const [imgError, setImgError] = useState(false);
  
  return (
    <tr className={`group hover:bg-gray-50/50 transition-colors ${!turf.isActive ? 'opacity-75 grayscale-[0.3]' : ''}`}>
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200 relative">
            {turf.images[0] && !imgError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={getImageUrl(turf.images[0])}
                alt={turf.name}
                onError={() => setImgError(true)}
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
          {turf.sports.slice(0, 2).map((s: string) => (
            <span key={s} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">{s}</span>
          ))}
          {turf.sports.length > 2 && (
            <span className="text-xs font-medium text-gray-400">+{turf.sports.length - 2}</span>
          )}
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
          onClick={() => onToggleStatus(turf)}
          className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 border ${
            turf.isActive
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
              : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
          }`}
          aria-label={turf.isActive ? "Deactivate Venue" : "Activate Venue"}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${turf.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
          {turf.isActive ? 'Active' : 'Closed'}
        </button>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onEdit(turf)}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
            aria-label="Edit Venue"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(turf._id)}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
            aria-label="Delete Venue"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Pagination = ({ currentPage, totalPages, onPageChange }: any) => {
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex justify-center items-center gap-2 pb-12">
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      
      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => onPageChange(i + 1)}
            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
              currentPage === i + 1
                ? "bg-[#1abc60] text-white border border-[#1abc60]"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
            aria-label={`Go to page ${i + 1}`}
            aria-current={currentPage === i + 1 ? "page" : undefined}
          >
            {i + 1}
          </button>
        ))}
      </div>
      
      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

// ============= Main Component =============
export default function AdminTurfPage() {
  useAuth();
  
  // State
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTurf, setEditingTurf] = useState<Turf | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "location" | "availability" | "pricing">("basic");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [availableSports, setAvailableSports] = useState<string[]>([]);
  const [commonAmenities, setCommonAmenities] = useState<string[]>([]);
  const [courtTypes, setCourtTypes] = useState<string[]>([]);
  
  const itemsPerPage = 6;
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  const { formData, errors, setErrors, updateField, updateLocation, resetForm, setFormFromTurf } = useTurfForm(editingTurf);
  const courtsCount = formData.courts?.length || 1;
  const primaryCourtType = formData.courts?.[0]?.courtType || "";
  
  // Filtered turfs based on search
  const getEffectivePrice = (turf: any) => {
    if (turf.pricePerHour && turf.pricePerHour > 0) return turf.pricePerHour;
    
    // Fallback to first sport price if available
    if (turf.sportConfigs && turf.sportConfigs.length > 0) {
      return turf.sportConfigs[0].pricePerHour;
    }
    
    return 0;
  };

  const filteredTurfs = useMemo(() => {
    if (!debouncedSearch) return turfs;
    return turfs.filter(turf => 
      turf.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      turf.location.city.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      turf.sports.some(sport => sport.toLowerCase().includes(debouncedSearch.toLowerCase()))
    );
  }, [turfs, debouncedSearch]);
  
  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTurfs = filteredTurfs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTurfs.length / itemsPerPage);
  
  // Stats
  const stats = useMemo(() => ({
    totalTurfs: turfs.length,
    activeVenues: turfs.filter(t => t.isActive).length,
    avgPrice: Math.round(turfs.reduce((acc, t) => acc + t.pricePerHour, 0) / (turfs.length || 1)),
    totalSports: Array.from(new Set(turfs.flatMap(t => t.sports))).length,
  }), [turfs]);
  
  // Fetch functions
  const fetchMasters = useCallback(async () => {
    try {
      const res = await api.get("/masters");
      if (res.data.success) {
        const masters = res.data.masters;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setAvailableSports(masters.filter((m: any) => m.category === "sport").map((m: any) => m.name));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setCommonAmenities(masters.filter((m: any) => m.category === "amenity").map((m: any) => m.name));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setCourtTypes(
          masters
            .filter((m: any) => m.category === "court_type" || m.category === "surface_type")
            .map((m: any) => m.name)
        );
      }
    } catch {
      console.error("Failed to fetch masters");
      toast.error("Failed to load master data");
    }
  }, []);
  
  const fetchTurfs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/turfs/my/all");
      if (res.data.success) {
        setTurfs(res.data.turfs || []);
      } else {
        throw new Error(res.data.message || 'Failed to fetch turfs');
      }
    } catch (error: unknown) {
      console.error("Fetch error:", error);
      setTurfs([]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast.error((error as any).response?.data?.message || "Failed to fetch turfs");
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the form errors");
      return;
    }
    
    setIsSaving(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("location", JSON.stringify(formData.location));
      data.append("pricePerHour", String(formData.pricePerHour));
      data.append("slotDuration", String(formData.slotDuration));
      data.append("sports", JSON.stringify(formData.sports));
      data.append("amenities", JSON.stringify(formData.amenities));
      data.append("description", formData.description);
      data.append("rates", JSON.stringify(formData.rates));
      data.append("priceHikes", JSON.stringify(formData.priceHikes));
      data.append("operatingHours", JSON.stringify(formData.operatingHours));
      data.append("courts", JSON.stringify(formData.courts));
      data.append("rating", String(formData.rating));
      data.append("reviewsCount", String(formData.reviewsCount));
      
      const existingImages = formData.images
        .map((img) => (typeof img === "string" ? img : img.url))
        .filter((url): url is string => typeof url === "string" && url.length > 0)
        .map((url) => {
          if (url.includes("/uploads/")) {
            return "/uploads/" + url.split("/uploads/")[1];
          }
          return url;
        });
      data.append("existingImages", JSON.stringify(existingImages));
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        await fetchTurfs();
        setShowModal(false);
        resetForm();
        setEditingTurf(null);
      }
    } catch (error: unknown) {
      Swal.fire({
        title: "Error!",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        text: (error as any).response?.data?.error || "Failed to save turf",
        icon: "error",
        confirmButtonColor: "#1abc60"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleEdit = useCallback((turf: Turf) => {
    setEditingTurf(turf);
    setFormFromTurf(turf);
    setShowModal(true);
    setActiveTab("basic");
  }, [setFormFromTurf]);
  
  const handleDelete = useCallback(async (id: string) => {
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
      const previousTurfs = [...turfs];
      setTurfs(turfs.filter(t => t._id !== id));
      
      try {
        const res = await api.delete(`/turfs/${id}`);
        if (res.data.success) {
          Swal.fire({
            title: "Deleted!",
            text: "Turf has been deleted.",
            icon: "success",
            confirmButtonColor: "#1abc60"
          });
        } else {
          throw new Error("Delete failed");
        }
      } catch {
        setTurfs(previousTurfs);
        Swal.fire({
          title: "Error!",
          text: "Failed to delete turf",
          icon: "error",
          confirmButtonColor: "#1abc60"
        });
      }
    }
  }, [turfs]);
  
  const toggleTurfStatus = useCallback(async (turf: Turf) => {
    const previousStatus = turf.isActive;
    setTurfs(turfs.map(t => t._id === turf._id ? { ...t, isActive: !t.isActive } : t));
    
    try {
      const res = await api.put(`/turfs/${turf._id}`, { isActive: !turf.isActive });
      if (res.data.success) {
        toast.success(`Turf ${!turf.isActive ? 'activated' : 'deactivated'} successfully`);
      } else {
        throw new Error("Status update failed");
      }
    } catch {
      setTurfs(turfs.map(t => t._id === turf._id ? { ...t, isActive: previousStatus } : t));
      toast.error("Failed to update turf status");
    }
  }, [turfs]);
  
  const toggleItem = useCallback((item: string, list: string[], field: "sports" | "amenities") => {
    if (list.includes(item)) {
      updateField(field, list.filter((i: string) => i !== item));
    } else {
      updateField(field, [...list, item]);
    }
  }, [updateField]);
  
  const updateOperatingHours = useCallback((idx: number, field: string, value: unknown) => {
    const newHours = [...formData.operatingHours];
    newHours[idx] = { ...newHours[idx], [field]: value };
    updateField("operatingHours", newHours);
  }, [formData.operatingHours, updateField]);
  
  // Effects
  useEffect(() => {
    fetchTurfs();
    fetchMasters();
  }, [fetchTurfs, fetchMasters]);
  
  useEffect(() => {
    if (!courtTypes.length) return;
    if (!formData.courts?.length) return;
    const hasMissingType = formData.courts.some((c) => !c.courtType);
    if (!hasMissingType) return;
    updateField(
      "courts",
      formData.courts.map((c, idx) => ({
        ...c,
        name: c.name || `Court ${idx + 1}`,
        courtType: c.courtType || courtTypes[0],
      }))
    );
  }, [courtTypes, formData.courts, updateField]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);
  
  // Loading state
  if (loading) {
    return (
      <div className="space-y-6 lg:space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="h-8 bg-gray-200 rounded animate-pulse w-48" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-64 mt-2" />
          </div>
          <div className="h-10 bg-gray-200 rounded animate-pulse w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-16 mt-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Venue Inventory</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your facility details, pricing, and availability.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search venues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] outline-none w-64"
            />
          </div>
          
          <div className="bg-gray-100/80 p-1 rounded-lg flex items-center border border-gray-200/50">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white text-[#1abc60] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              title="Grid View"
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white text-[#1abc60] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              title="List View"
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={() => { resetForm(); setEditingTurf(null); setShowModal(true); }}
            className="bg-[#1abc60] hover:bg-[#16a085] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Venue</span>
          </button>
        </div>
      </div>
      
      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard label="Total Turfs" value={stats.totalTurfs} icon={Layers} color="blue" />
        <StatsCard label="Active Venues" value={stats.activeVenues} icon={Zap} color="emerald" />
        <StatsCard label="Avg. Price" value={`₹${stats.avgPrice}`} icon={IndianRupee} color="orange" />
        <StatsCard label="Total Sports" value={stats.totalSports} icon={Trophy} color="purple" />
      </div>
      
      {/* No Results Message */}
      {filteredTurfs.length === 0 && debouncedSearch && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
          <p className="text-gray-500">No venues found matching &quot;{debouncedSearch}&quot;</p>
          <button
            onClick={() => setSearchTerm("")}
            className="mt-2 text-[#1abc60] hover:text-[#16a085] text-sm font-medium"
          >
            Clear search
          </button>
        </div>
      )}
      
      {/* Turf Grid/List View */}
      {filteredTurfs.length > 0 && (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
              {currentTurfs.map((turf) => (
                <TurfCard
                  key={turf._id}
                  turf={turf}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleStatus={toggleTurfStatus}
                />
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
                      <TurfTableRow
                        key={turf._id}
                        turf={turf}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleStatus={toggleTurfStatus}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
      
      {/* Professional Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-gray-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 10 }}
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
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as "basic" | "location" | "availability" | "pricing")}
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
                    <button 
                      onClick={() => setShowModal(false)} 
                      className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-md transition-colors"
                      aria-label="Close modal"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 lg:p-10 scrollbar-hide">
                    <form onSubmit={handleSubmit} className="space-y-8">
                      {activeTab === "basic" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                              <label className="block text-sm font-medium text-gray-700">
                                Venue Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                required
                                value={formData.name}
                                onChange={e => updateField("name", e.target.value)}
                                className={`w-full px-4 py-2.5 bg-white border ${
                                  errors.name ? 'border-red-500' : 'border-gray-300'
                                } rounded-lg focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] outline-none text-sm transition-all`}
                                placeholder="e.g. Wembley Sports Center"
                              />
                              {errors.name && (
                                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                              )}
                            </div>
                            
                            <div className="space-y-1.5">
                              <label className="block text-sm font-medium text-gray-700">
                                Standard Hourly Rate <span className="text-red-500">*</span>
                              </label>
                              <div className={`flex items-center bg-white border ${
                                errors.price ? 'border-red-500' : 'border-gray-300'
                              } rounded-lg focus-within:ring-2 focus-within:ring-[#1abc60]/20 focus-within:border-[#1abc60] overflow-hidden transition-all`}>
                                <div className="pl-3 pr-2 text-gray-500 border-r border-gray-200 bg-gray-50 py-2.5">
                                  <IndianRupee className="w-4 h-4" />
                                </div>
                                <input
                                  required
                                  type="number"
                                  value={formData.pricePerHour}
                                  onChange={e => updateField("pricePerHour", Number(e.target.value))}
                                  className="flex-1 px-3 py-2.5 bg-transparent border-none outline-none text-sm focus:ring-0"
                                  placeholder="0"
                                />
                              </div>
                              {errors.price && (
                                <p className="text-xs text-red-500 mt-1">{errors.price}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                              <label className="block text-sm font-medium text-gray-700">Initial Rating</label>
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="5"
                                value={formData.rating}
                                onChange={e => updateField("rating", Number(e.target.value))}
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] outline-none text-sm transition-all"
                                placeholder="e.g. 4.5"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="block text-sm font-medium text-gray-700">Total Reviews</label>
                              <input
                                type="number"
                                value={formData.reviewsCount}
                                onChange={e => updateField("reviewsCount", Number(e.target.value))}
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] outline-none text-sm transition-all"
                                placeholder="e.g. 250"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Select Sport <span className="text-red-500">*</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {availableSports.map(s => {
                                const isSelected = formData.sports.includes(s);
                                return (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => {
                                      // Toggle behavior for single selection
                                      if (formData.sports.includes(s)) {
                                        updateField("sports", []);
                                      } else {
                                        updateField("sports", [s]);
                                      }
                                    }}
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
                            {errors.sports && (
                              <p className="text-xs text-red-500 mt-1">{errors.sports}</p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                              <label className="block text-sm font-medium text-gray-700">Number of Courts</label>
                              <input
                                type="number"
                                min={1}
                                max={50}
                                value={courtsCount}
                                onChange={(e) => {
                                  const nextCount = Math.max(1, Math.min(50, Number(e.target.value) || 1));
                                  const nextType = primaryCourtType || courtTypes[0] || "Synthetic";
                                  const nextCourts = Array.from({ length: nextCount }).map((_, idx) => ({
                                    name: formData.courts?.[idx]?.name || `Court ${idx + 1}`,
                                    courtType: formData.courts?.[idx]?.courtType || nextType,
                                    isActive: formData.courts?.[idx]?.isActive ?? true,
                                  }));
                                  updateField("courts", nextCourts);
                                }}
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] outline-none text-sm transition-all"
                                placeholder="e.g. 2"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="block text-sm font-medium text-gray-700">Court Type</label>
                              <select
                                value={primaryCourtType || (courtTypes[0] || "Synthetic")}
                                onChange={(e) => {
                                  const nextType = e.target.value;
                                  updateField(
                                    "courts",
                                    (formData.courts?.length ? formData.courts : [{ name: "Court 1", courtType: nextType }]).map(
                                      (c, idx) => ({
                                        ...c,
                                        name: c.name || `Court ${idx + 1}`,
                                        courtType: nextType,
                                      })
                                    )
                                  );
                                }}
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] outline-none text-sm transition-all"
                              >
                                {(courtTypes.length ? courtTypes : ["Synthetic"]).map((t) => (
                                  <option key={t} value={t}>
                                    {t}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Premium Amenities</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {commonAmenities.map(a => {
                                const isSelected = formData.amenities.includes(a);
                                return (
                                  <button
                                    key={a}
                                    type="button"
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
                              onChange={e => updateField("description", e.target.value)}
                              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] outline-none text-sm transition-all h-28 resize-none"
                              placeholder="Describe your venue..."
                            />
                          </div>
                          
                          <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Gallery</label>
                            <div className="bg-gray-50 rounded-lg p-5 border border-dashed border-gray-300">
                              <MediaUpload
                                initialFiles={editingTurf ? editingTurf.images : []}
                                onFilesChange={(files) => updateField("images", files)}
                                className="bg-transparent"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                      
                      {activeTab === "location" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                              <label className="block text-sm font-medium text-gray-700">
                                City <span className="text-red-500">*</span>
                              </label>
                              <input
                                required
                                value={formData.location.city}
                                onChange={e => updateLocation("city", e.target.value)}
                                className={`w-full px-4 py-2.5 bg-white border ${
                                  errors.city ? 'border-red-500' : 'border-gray-300'
                                } rounded-lg focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] outline-none text-sm transition-all`}
                                placeholder="e.g. Bangalore"
                              />
                              {errors.city && (
                                <p className="text-xs text-red-500 mt-1">{errors.city}</p>
                              )}
                            </div>
                            <div className="space-y-1.5">
                              <label className="block text-sm font-medium text-gray-700">Landmark</label>
                              <input
                                value={formData.location.landmark}
                                onChange={e => updateLocation("landmark", e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] outline-none text-sm transition-all"
                                placeholder="e.g. Near Central Mall"
                              />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">
                              Physical Address <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              required
                              value={formData.location.address}
                              onChange={e => updateLocation("address", e.target.value)}
                              className={`w-full px-4 py-3 bg-white border ${
                                errors.address ? 'border-red-500' : 'border-gray-300'
                              } rounded-lg focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] outline-none text-sm transition-all h-28 resize-none`}
                              placeholder="Enter complete venue address..."
                            />
                            {errors.address && (
                              <p className="text-xs text-red-500 mt-1">{errors.address}</p>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Google Maps URL</label>
                            <input
                              value={formData.location.mapUrl}
                              onChange={e => updateLocation("mapUrl", e.target.value)}
                              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] outline-none text-sm transition-all"
                              placeholder="https://maps.google.com/..."
                            />
                          </div>
                        </motion.div>
                      )}
                      
                      {activeTab === "pricing" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                          <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Slot Duration</label>
                            <select
                              value={formData.slotDuration}
                              onChange={(e) => updateField("slotDuration", Number(e.target.value))}
                              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] outline-none text-sm transition-all"
                            >
                              {SLOT_DURATIONS.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="grid gap-3">
                            {formData.rates.map((rate, idx) => (
                              <div key={rate.day} className="flex items-center gap-4 p-3.5 rounded-lg border border-gray-200 bg-white shadow-sm">
                                <span className="w-24 text-sm font-semibold text-gray-700">{rate.day}</span>
                                
                                <div className="flex items-center gap-4 flex-1">
                                  <div className="flex-1 flex items-center border border-gray-300 rounded-md overflow-hidden">
                                    <div className="pl-3 pr-2 text-gray-500 bg-gray-50 py-2 border-r border-gray-200">
                                      <IndianRupee className="w-3.5 h-3.5" />
                                    </div>
                                    <input
                                      type="number"
                                      value={rate.price}
                                      onChange={(e) => {
                                        const newRates = [...formData.rates];
                                        newRates[idx].price = Number(e.target.value);
                                        updateField("rates", newRates);
                                      }}
                                      className="flex-1 px-3 py-2 bg-transparent border-none text-sm outline-none"
                                    />
                                  </div>
                                  
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <span className={`text-xs font-medium uppercase ${rate.isPeak ? "text-orange-600" : "text-gray-400"}`}>
                                      {rate.isPeak ? "Peak" : "Regular"}
                                    </span>
                                    <input
                                      type="checkbox"
                                      checked={rate.isPeak}
                                      onChange={(e) => {
                                        const newRates = [...formData.rates];
                                        newRates[idx].isPeak = e.target.checked;
                                        updateField("rates", newRates);
                                      }}
                                      className="rounded border-gray-300 text-[#1abc60] focus:ring-[#1abc60]/20"
                                    />
                                  </label>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="pt-6 border-t border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="text-sm font-bold text-gray-900">Peak Hour Price Hikes</h4>
                                <p className="text-xs text-gray-500">Apply extra charges for specific time slots (e.g., festivals or peak hours).</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  updateField("priceHikes", [
                                    ...(formData.priceHikes || []),
                                    { startTime: "17:00", endTime: "22:00", extraPrice: 0 }
                                  ]);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1abc60]/10 text-[#1abc60] rounded-lg text-xs font-bold hover:bg-[#1abc60]/20 transition-all"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Add Price Hike
                              </button>
                            </div>

                            <div className="space-y-3">
                              {(formData.priceHikes || []).map((hike, idx) => (
                                <div key={idx} className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-gray-200 bg-gray-50 shadow-sm relative group">
                                  <div className="flex-1 min-w-[120px] space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Start Time</label>
                                    <input
                                      type="time"
                                      value={hike.startTime}
                                      onChange={(e) => {
                                        const newHikes = [...formData.priceHikes];
                                        newHikes[idx].startTime = e.target.value;
                                        updateField("priceHikes", newHikes);
                                      }}
                                      className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm outline-none focus:ring-1 focus:ring-[#1abc60]"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-[120px] space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">End Time</label>
                                    <input
                                      type="time"
                                      value={hike.endTime}
                                      onChange={(e) => {
                                        const newHikes = [...formData.priceHikes];
                                        newHikes[idx].endTime = e.target.value;
                                        updateField("priceHikes", newHikes);
                                      }}
                                      className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm outline-none focus:ring-1 focus:ring-[#1abc60]"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-[120px] space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Extra Price (₹)</label>
                                    <input
                                      type="number"
                                      value={hike.extraPrice}
                                      onChange={(e) => {
                                        const newHikes = [...formData.priceHikes];
                                        newHikes[idx].extraPrice = Number(e.target.value);
                                        updateField("priceHikes", newHikes);
                                      }}
                                      className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-bold text-[#1abc60] outline-none focus:ring-1 focus:ring-[#1abc60]"
                                      placeholder="0"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newHikes = formData.priceHikes.filter((_, i) => i !== idx);
                                      updateField("priceHikes", newHikes);
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-md transition-all self-end mb-0.5"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                              {(!formData.priceHikes || formData.priceHikes.length === 0) && (
                                <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl">
                                  <p className="text-xs text-gray-400 font-medium italic">No custom price hikes configured.</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                      
                      {activeTab === "availability" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                          {formData.operatingHours.map((oh, idx) => (
                            <div
                              key={oh.day}
                              className={`flex items-center gap-4 p-3.5 rounded-lg border transition-all ${
                                oh.isOpen ? 'bg-white border-gray-200 shadow-sm' : 'bg-gray-50 border-dashed opacity-60'
                              }`}
                            >
                              <span className="w-24 text-sm font-semibold text-gray-700">{oh.day}</span>
                              <div className="flex items-center gap-2">
                                <input
                                  type="time"
                                  value={oh.open}
                                  disabled={!oh.isOpen}
                                  onChange={e => updateOperatingHours(idx, "open", e.target.value)}
                                  className="px-3 py-1.5 rounded-md border border-gray-300 text-sm focus:border-[#1abc60] focus:ring-1 focus:ring-[#1abc60] outline-none disabled:bg-gray-100"
                                />
                                <span className="text-gray-400 font-medium text-xs">to</span>
                                <input
                                  type="time"
                                  value={oh.close}
                                  disabled={!oh.isOpen}
                                  onChange={e => updateOperatingHours(idx, "close", e.target.value)}
                                  className="px-3 py-1.5 rounded-md border border-gray-300 text-sm focus:border-[#1abc60] focus:ring-1 focus:ring-[#1abc60] outline-none disabled:bg-gray-100"
                                />
                              </div>
                              <label className="ml-auto relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={oh.isOpen}
                                  onChange={e => updateOperatingHours(idx, "isOpen", e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1abc60]"></div>
                              </label>
                            </div>
                          ))}
                        </motion.div>
                      )}
                      
                      {/* Footer Actions */}
                      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-8">
                        <button
                          type="button"
                          onClick={() => setShowModal(false)}
                          className="px-5 py-2.5 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          disabled={isSaving}
                          type="submit"
                          className="px-6 py-2.5 bg-[#1abc60] text-white rounded-lg font-medium shadow-sm flex items-center gap-2 hover:bg-[#16a085] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              {editingTurf ? "Save Changes" : "Create Venue"}
                            </>
                          )}
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