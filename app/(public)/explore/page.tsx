"use client";

import { useState, useEffect } from "react";
import { 
  Search, MapPin, IndianRupee, Star, Filter, 
  ChevronRight, Loader2, X, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/app/services/api";
import Link from "next/link";

interface Turf {
  _id: string;
  name: string;
  location: {
    address: string;
    city: string;
  };
  pricePerHour: number;
  sports: string[];
  amenities: string[];
  images: string[];
  rating: number;
  reviewsCount: number;
}

export default function ExploreTurfsPage() {
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter States
  const [searchCity, setSearchCity] = useState("");
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState(5000);
  const [minRating, setMinRating] = useState<number | null>(null);

  const sports = ["Football", "Cricket", "Tennis", "Badminton", "Basketball"];

  useEffect(() => {
    fetchTurfs();
  }, []);

  const fetchTurfs = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchCity) params.city = searchCity;
      if (selectedSport) params.sport = selectedSport;
      if (minRating) params.rating = minRating;
      params.maxPrice = priceRange;

      const res = await api.get("turfs", { params });
      if (res.data.success) setTurfs(res.data.turfs);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* --- SIDEBAR FILTERS (Desktop) --- */}
          <aside className="hidden lg:block w-64 space-y-8 sticky top-24 h-fit">
            <div>
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-wider mb-6">Filters</h2>
              
              <div className="space-y-8">
                {/* Location */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search city..." 
                      value={searchCity}
                      onChange={(e) => setSearchCity(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchTurfs()}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1abc60] transition-all"
                    />
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Max Price</label>
                    <span className="text-sm font-bold text-[#1abc60]">₹{priceRange}/hr</span>
                  </div>
                  <input 
                    type="range" min="200" max="5000" step="100" 
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full accent-[#1abc60]"
                  />
                </div>

                {/* Sports */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sport Category</label>
                  <div className="space-y-2">
                    {sports.map(s => (
                      <label key={s} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={selectedSport === s}
                          onChange={() => setSelectedSport(selectedSport === s ? null : s)}
                          className="w-4 h-4 rounded border-gray-300 text-[#1abc60] focus:ring-[#1abc60] accent-[#1abc60]"
                        />
                        <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Minimum Rating</label>
                  <div className="flex gap-2">
                    {[4.0, 4.5, 4.8].map(r => (
                      <button 
                        key={r}
                        onClick={() => setMinRating(minRating === r ? null : r)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${minRating === r ? 'bg-green-50 border-[#1abc60] text-[#1abc60]' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                      >
                        {r}+
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={fetchTurfs}
                  className="w-full bg-[#1abc60] text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-green-100 hover:bg-[#16a085] transition-all uppercase tracking-widest"
                >
                  Apply Filters
                </button>
                <button 
                  onClick={() => {
                    setSearchCity(""); setSelectedSport(null); setPriceRange(5000); setMinRating(null);
                  }}
                  className="w-full text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-gray-600 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </aside>

          {/* --- MAIN CONTENT --- */}
          <main className="flex-1 space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-black text-gray-900">Available Grounds</h1>
              <button 
                onClick={() => setShowFilters(true)}
                className="lg:hidden p-2 bg-white border border-gray-200 rounded-lg text-gray-600"
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="w-12 h-12 animate-spin text-[#1abc60] mb-4" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Searching for best turfs...</p>
              </div>
            ) : turfs.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">No Turfs Found</h3>
                <p className="text-gray-500 text-sm mt-1">Try adjusting your filters to see more results.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {turfs.map((turf: any) => {
                  // Get minimum price from sportConfigs or use pricePerHour
                  let currentPrice = Number(turf.pricePerHour || 0);
                  if (turf.sportConfigs && turf.sportConfigs.length > 0) {
                    const sportPrices = turf.sportConfigs.map((sc: any) => Number(sc.pricePerHour || 0)).filter((p: number) => p > 0);
                    if (sportPrices.length > 0) {
                      currentPrice = Math.min(...sportPrices);
                    }
                  }

                  // Get images from sportConfigs if main images array is empty
                  let displayImage = 'https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=2070&auto=format&fit=crop';
                  let allImages = [...(turf.images || [])];
                  
                  if (turf.sportConfigs && turf.sportConfigs.length > 0) {
                    turf.sportConfigs.forEach((sc: any) => {
                      if (sc.images && sc.images.length > 0) {
                        allImages = [...allImages, ...sc.images];
                      }
                    });
                  }

                  if (allImages.length > 0) {
                    const firstImg = allImages[0];
                    displayImage = firstImg.startsWith('http') 
                      ? firstImg 
                      : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '')}${firstImg}`;
                  }

                  return (
                    <motion.div 
                      key={turf._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all group"
                    >
                      <div className="h-56 bg-gray-100 relative">
                        <img src={displayImage} alt={turf.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-4 left-4 bg-[#1abc60] text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-lg shadow-green-900/20">Featured</div>
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-[10px] font-black text-gray-900">{turf.rating || 'New'}</span>
                        </div>
                      </div>
                      <div className="p-6 space-y-4">
                        <div>
                          <h3 className="text-lg font-black text-gray-900 leading-tight group-hover:text-[#1abc60] transition-colors">{turf.name}</h3>
                          <div className="flex items-center gap-1 text-xs font-medium text-gray-400 mt-1">
                            <MapPin className="w-3 h-3" />
                            <span>{turf.location?.address}, {turf.location?.city}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1.5">
                          {turf.sports?.slice(0, 3).map((s: string) => (
                            <span key={s} className="px-2 py-1 bg-gray-50 text-gray-500 rounded-lg text-[9px] font-black uppercase tracking-wider border border-gray-100">{s}</span>
                          ))}
                          {turf.sports?.length > 3 && <span className="text-[9px] font-black text-gray-300">+{turf.sports.length - 3}</span>}
                        </div>

                        <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                          <div>
                            <span className="text-xl font-black text-gray-900">₹{currentPrice}</span>
                            <span className="text-xs font-bold text-gray-400">/hr</span>
                          </div>
                          <Link 
                            href={`/ground/${turf._id}`}
                            className="bg-[#1abc60] text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#16a085] transition-all shadow-lg shadow-green-100"
                          >
                            Book Now
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* --- MOBILE FILTERS MODAL --- */}
      <AnimatePresence>
        {showFilters && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md h-[90vh] sm:h-auto overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-wider">Filters</h2>
                <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-white rounded-xl transition-colors"><X className="text-gray-400" /></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-8 flex-1">
                {/* Re-use desktop filter UI sections here for mobile */}
                {/* ... (Implementation is similar to sidebar) */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" placeholder="Search area or landmark..." 
                      value={searchCity} onChange={e => setSearchCity(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#1abc60]"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Price per hour</label>
                    <span className="text-sm font-bold text-[#1abc60]">₹{priceRange}/hr</span>
                  </div>
                  <input type="range" min="200" max="5000" step="100" value={priceRange} onChange={e => setPriceRange(Number(e.target.value))} className="w-full accent-[#1abc60]" />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sport Category</label>
                  <div className="grid grid-cols-2 gap-3">
                    {sports.map(s => (
                      <label key={s} className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${selectedSport === s ? 'bg-green-50 border-[#1abc60] text-[#1abc60]' : 'bg-white border-gray-100 text-gray-500'}`}>
                        <span className="text-sm font-bold">{s}</span>
                        <input type="checkbox" checked={selectedSport === s} onChange={() => setSelectedSport(selectedSport === s ? null : s)} className="accent-[#1abc60]" />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-50 bg-gray-50/50 flex gap-4">
                <button onClick={() => { setSearchCity(""); setSelectedSport(null); setPriceRange(5000); setMinRating(null); }} className="flex-1 py-3 text-sm font-bold text-gray-400 uppercase tracking-widest">Clear All</button>
                <button onClick={() => { fetchTurfs(); setShowFilters(false); }} className="flex-[2] bg-[#1abc60] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-green-100">Apply Filters</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
