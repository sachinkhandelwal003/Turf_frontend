"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  MapPin, Star, Clock, Info, Shield, CheckCircle2, 
  Calendar, ChevronRight, Loader2, Users, IndianRupee,
  Activity, Coffee, Car, Wifi, Waves as Shower, Zap, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/app/services/api";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";

interface Turf {
  _id: string;
  name: string;
  location: {
    address: string;
    city: string;
    landmark?: string;
    mapUrl?: string;
  };
  pricePerHour: number;
  sports: string[];
  amenities: string[];
  images: string[];
  description: string;
  rating: number;
  reviewsCount: number;
  courts: {
    name: string;
    courtType: string;
  }[];
  availableSlots: {
    startTime: string;
    endTime: string;
    type: string;
  }[];
}

export default function TurfDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [turf, setTurf] = useState<Turf | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSport, setSelectedSport] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [selectedCourts, setSelectedCourts] = useState<string[]>([]);

  const defaultTimeSlots = [
    { label: "Morning", slots: ["06:00 - 07:00", "07:00 - 08:00", "08:00 - 09:00", "09:00 - 10:00"] },
    { label: "Afternoon", slots: ["12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00"] },
    { label: "Evening", slots: ["18:00 - 19:00", "19:00 - 20:00", "20:00 - 21:00", "21:00 - 22:00"] },
  ];

  const getTimeSlots = () => {
    if (turf?.availableSlots && turf.availableSlots.length > 0) {
      const groups: Record<string, string[]> = {};
      turf.availableSlots.forEach((slot: any) => {
        const type = slot.type || "Other";
        if (!groups[type]) groups[type] = [];
        groups[type].push(`${slot.startTime} - ${slot.endTime}`);
      });
      return Object.entries(groups).map(([label, slots]) => ({ label, slots }));
    }
    return defaultTimeSlots;
  };

  const timeSlots = getTimeSlots();

  useEffect(() => {
    if (id) fetchTurfDetails();
  }, [id]);

  const fetchTurfDetails = async () => {
    try {
      const res = await api.get(`/turfs/${id}`);
      if (res.data.success) {
        setTurf(res.data.turf);
        setSelectedSport(res.data.turf.sports[0]);
      }
    } catch (error) {
      toast.error("Failed to load turf details");
      router.push("/explore");
    } finally {
      setLoading(false);
    }
  };

  const toEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // If it's already an embed URL, return as is
    if (url.includes('output=embed') || url.includes('/maps/embed')) return url;

    // Handle standard Google Maps URLs with coordinates
    const latLngMatch = url.match(/q=(-?\d+(\.\d+)?),(-?\d+(\.\d+)?)/);
    if (latLngMatch?.[1] && latLngMatch?.[3]) {
      return `https://www.google.com/maps?q=${latLngMatch[1]},${latLngMatch[3]}&output=embed`;
    }

    // Handle place IDs or general search queries
    if (url.includes('google.com/maps')) {
      return `${url}${url.includes('?') ? '&' : '?'}output=embed`;
    }

    // Handle shortened maps.app.goo.gl or goo.gl/maps links
    if (url.includes('goo.gl/maps') || url.includes('maps.app.goo.gl')) {
      return url;
    }

    return url;
  };

  const getAmenityIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('park')) return <Car className="w-5 h-5" />;
    if (n.includes('show')) return <Shower className="w-5 h-5" />;
    if (n.includes('light')) return <Zap className="w-5 h-5" />;
    if (n.includes('cafe')) return <Coffee className="w-5 h-5" />;
    if (n.includes('water')) return <Activity className="w-5 h-5" />;
    return <CheckCircle2 className="w-5 h-5" />;
  };

  const handleBooking = async () => {
    if (selectedSlots.length === 0 || selectedCourts.length === 0 || !turf) {
      if (selectedCourts.length === 0) toast.error("Please select at least one court");
      if (selectedSlots.length === 0) toast.error("Please select at least one time slot");
      return;
    }

    try {
      // Send the first slot to create the initial booking
      // Note: We'll update the backend to handle multiple slots later, 
      // but for now, we'll send them as a comma-separated string or an array if the backend supports it.
      const res = await api.post("/bookings", {
        turfId: turf._id,
        sport: selectedSport,
        date: selectedDate,
        slots: selectedSlots, // Changed from slot: selectedSlot
        courts: selectedCourts, // Added courts
        price: turf.pricePerHour * selectedSlots.length * selectedCourts.length, // Total price
      });

      if (res.data.success) {
        toast.success("Booking created successfully!");
        setShowBookingModal(false);
        router.push("/profile");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create booking");
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin text-[#1abc60]" /></div>;
  if (!turf) return null;

  return (
    <div className="min-h-screen bg-white pt-20 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-gray-900 leading-tight">{turf.name}</h1>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-black text-gray-900">{turf.rating}</span>
                <span className="text-xs text-gray-500 font-bold ml-1">({turf.reviewsCount}+ Reviews)</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                <MapPin className="w-4 h-4 text-[#1abc60]" />
                <span className="text-sm">
                  {turf.location.address ? `${turf.location.address}, ` : ''}
                  {turf.location.landmark ? `${turf.location.landmark}, ` : ''}
                  {turf.location.city}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 min-w-[280px] hidden md:block">
             <div className="flex justify-between items-end mb-4">
                <div>
                  <span className="text-4xl font-black text-gray-900">₹{turf.pricePerHour}</span>
                  <span className="text-gray-400 font-bold ml-1">/ hr</span>
                </div>
             </div>
             <button 
                onClick={() => setShowBookingModal(true)}
                className="w-full bg-[#1abc60] text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-green-100 hover:bg-[#16a085] transition-all"
             >
                Book Now
             </button>
          </div>
        </div>

        {/* --- IMAGE GALLERY --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 h-[300px] md:h-[500px]">
          <div className="md:col-span-2 rounded-3xl overflow-hidden shadow-sm group">
            <img src={turf.images[0]} alt="Main" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          </div>
          <div className="hidden md:grid grid-rows-2 gap-4">
            <div className="rounded-3xl overflow-hidden shadow-sm group">
              <img src={turf.images[1] || turf.images[0]} alt="Side 1" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="rounded-3xl overflow-hidden shadow-sm group">
              <img src={turf.images[2] || turf.images[0]} alt="Side 2" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
          </div>
        </div>

        {/* --- DETAILS GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-12">
            
            {/* Sports Available */}
            <section className="space-y-6">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-wider">Sports Available</h2>
              <div className="flex flex-wrap gap-4">
                {turf.sports.map(s => (
                  <button 
                    key={s}
                    onClick={() => setSelectedSport(s)}
                    className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl border-2 transition-all font-bold ${selectedSport === s ? 'border-[#1abc60] bg-green-50 text-[#1abc60]' : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${selectedSport === s ? 'bg-[#1abc60] animate-pulse' : 'bg-gray-300'}`} />
                    {s}
                  </button>
                ))}
              </div>
            </section>

            {/* Courts Available */}
            {turf.courts && turf.courts.length > 0 && (
              <section className="space-y-6">
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-wider">Courts Available</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {turf.courts.map((court, idx) => (
                    <div key={idx} className="bg-white border border-gray-100 p-5 rounded-3xl flex items-center gap-4 shadow-sm hover:border-[#1abc60] transition-all group">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-green-50 group-hover:text-[#1abc60] transition-all">
                        <Activity className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 uppercase tracking-tight">{court.name}</h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{court.courtType}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Amenities */}
            <section className="space-y-6">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-wider">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {turf.amenities.map(a => (
                  <div key={a} className="bg-white border border-gray-100 p-6 rounded-3xl flex flex-col items-center gap-3 text-center group hover:border-[#1abc60] transition-colors">
                    <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-green-50 group-hover:text-[#1abc60] transition-colors">
                      {getAmenityIcon(a)}
                    </div>
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-900 transition-colors">{a}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* About */}
            <section className="space-y-6">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-wider">About Venue</h2>
              <div className="bg-gray-50 p-8 rounded-[40px] border border-gray-100">
                <p className="text-gray-600 leading-relaxed font-medium">
                  {turf.description || `${turf.name} at ${turf.location.city} is a premier multi-sport destination. Designed for high performance, our facility features professional-grade synthetic mats and state-of-the-art lighting for an immersive nighttime gaming experience.`}
                </p>
              </div>
            </section>
          </div>

          {/* --- SIDEBAR INFO --- */}
          <div className="space-y-8">
             {/* Operating Hours */}
             <div className="bg-gray-50 p-8 rounded-[40px] border border-gray-100 space-y-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-[#1abc60]" />
                  <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm">Operating Hours</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 font-bold">Mon - Fri</span>
                    <span className="text-gray-900 font-black">06:00 AM - 11:00 PM</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 font-bold">Sat - Sun</span>
                    <span className="text-gray-900 font-black">05:00 AM - 12:00 AM</span>
                  </div>
                </div>
             </div>

             {/* Location Mini Map */}
             <div className="bg-gray-50 p-8 rounded-[40px] border border-gray-100 space-y-6">
                <div className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-[#1abc60]" />
                  <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm">Location</h3>
                </div>
                <div className="h-48 bg-gray-200 rounded-3xl overflow-hidden relative transition-all border border-gray-100">
                  {turf.location.mapUrl ? (
                    <iframe
                      title="Turf Location"
                      src={toEmbedUrl(turf.location.mapUrl)}
                      className="w-full h-full border-0"
                      loading="lazy"
                    />
                  ) : (
                    <>
                      <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&q=80" alt="Map Placeholder" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-8 h-8 bg-[#1abc60] rounded-full animate-ping opacity-20" />
                        <div className="absolute w-4 h-4 bg-[#1abc60] rounded-full border-2 border-white shadow-xl" />
                      </div>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  {turf.location.address ? `${turf.location.address}, ` : ''}
                  {turf.location.landmark ? `${turf.location.landmark}, ` : ''}
                  {turf.location.city}
                </p>
             </div>
          </div>
        </div>
      </div>

      {/* --- MOBILE STICKY BOOK BUTTON --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-50">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-2xl font-black text-gray-900">₹{turf.pricePerHour}</span>
            <span className="text-gray-400 text-xs font-bold block">/ hr</span>
          </div>
          <button 
            onClick={() => setShowBookingModal(true)}
            className="flex-1 bg-[#1abc60] text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-green-100"
          >
            Book Now
          </button>
        </div>
      </div>

      {/* --- BOOKING MODAL --- */}
      <AnimatePresence>
        {showBookingModal && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Available Time Slots</h2>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Select your preferred timing</p>
                </div>
                <button onClick={() => setShowBookingModal(false)} className="p-2 hover:bg-white rounded-2xl transition-colors shadow-sm"><X className="text-gray-400" /></button>
              </div>

              <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
                {/* Date Picker */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#1abc60]" />
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Date</label>
                  </div>
                  <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedSlots([]); // Clear slots when date changes
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-black text-gray-900 outline-none focus:ring-2 focus:ring-[#1abc60]" 
                  />
                </div>

                {/* Court Selection */}
                {turf.courts && turf.courts.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#1abc60]" />
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Courts</label>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {turf.courts.map((court) => (
                        <button 
                          key={court.name}
                          onClick={() => {
                            if (selectedCourts.includes(court.name)) {
                              setSelectedCourts(selectedCourts.filter(c => c !== court.name));
                            } else {
                              setSelectedCourts([...selectedCourts, court.name]);
                            }
                          }}
                          className={`p-3 rounded-xl border-2 font-bold text-sm transition-all text-left flex items-center justify-between ${selectedCourts.includes(court.name) ? 'border-[#1abc60] bg-green-50 text-[#1abc60] shadow-md shadow-green-50' : 'border-gray-50 text-gray-400 hover:border-gray-200 bg-white'}`}
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-black uppercase tracking-tight">{court.name}</span>
                            <span className="text-[10px] font-bold opacity-60">{court.courtType}</span>
                          </div>
                          {selectedCourts.includes(court.name) && <CheckCircle2 className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Slots Grid */}
                {timeSlots.map((group) => (
                  <div key={group.label} className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{group.label}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {group.slots.map(slot => (
                        <button 
                          key={slot}
                          onClick={() => {
                            if (selectedSlots.includes(slot)) {
                              setSelectedSlots(selectedSlots.filter(s => s !== slot));
                            } else {
                              setSelectedSlots([...selectedSlots, slot]);
                            }
                          }}
                          className={`p-3 rounded-xl border-2 font-bold text-sm transition-all ${selectedSlots.includes(slot) ? 'border-[#1abc60] bg-green-50 text-[#1abc60] shadow-md shadow-green-50' : 'border-gray-50 text-gray-400 hover:border-gray-200'}`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-8 border-t border-gray-50 bg-gray-50/50 flex gap-4">
                <div className="flex-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Estimated Total</span>
                  <span className="text-2xl font-black text-gray-900">₹{turf.pricePerHour * (selectedSlots.length || 1) * (selectedCourts.length || 1)}</span>
                </div>
                <button 
                  onClick={handleBooking}
                  disabled={selectedSlots.length === 0 || selectedCourts.length === 0}
                  className="flex-[2] bg-[#1abc60] text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-green-100 hover:bg-[#16a085] transition-all disabled:opacity-50 disabled:grayscale"
                >
                  Confirm {selectedSlots.length} {selectedSlots.length === 1 ? 'Slot' : 'Slots'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
