"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { MapPin, Star, ChevronDown, Loader2, Filter, X, Search, Check, Navigation } from 'lucide-react';
import api from '@/app/services/api';
import { toast } from 'sonner';

export default function FeaturedVenues() {
  const [allTurfs, setAllTurfs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [availableSports, setAvailableSports] = useState<string[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [turfRes, mastersRes] = await Promise.all([
        api.get('/turfs'),
        api.get('/masters')
      ]);

      if (turfRes.data.success) {
        setAllTurfs(turfRes.data.turfs || []);
        
        // Extract unique cities
        const cities = new Set<string>();
        turfRes.data.turfs.forEach((t: any) => {
          if (t.location?.city) cities.add(t.location.city);
        });
        setAvailableCities(Array.from(cities).sort());
      }

      if (mastersRes.data.success) {
        const sports = mastersRes.data.masters
          .filter((m: any) => m.category === 'sport')
          .map((m: any) => m.name);
        setAvailableSports(sports);
      }
    } catch (error) {
      console.error("Failed to fetch featured venues data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredVenues = useMemo(() => {
    let filtered = allTurfs.filter((t: any) => t.isActive);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((t: any) => 
        t.name.toLowerCase().includes(query) || 
        t.location?.city?.toLowerCase().includes(query) ||
        t.location?.landmark?.toLowerCase().includes(query)
      );
    }

    if (selectedSports.length > 0) {
      filtered = filtered.filter((t: any) => 
        t.sports?.some((sport: string) => selectedSports.includes(sport))
      );
    }

    if (selectedCity) {
      filtered = filtered.filter((t: any) => t.location?.city === selectedCity);
    }

    // Map to UI format
    return filtered.slice(0, 6).map((t: any) => {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const todayRate = t.rates?.find((r: any) => r.day === today);
      const currentPrice = (todayRate && todayRate.price > 0) ? todayRate.price : t.pricePerHour;

      return {
        id: t._id,
        name: t.name,
        location: `${t.location.landmark ? t.location.landmark + ', ' : ''}${t.location.city}`,
        price: `₹${currentPrice}`,
        rating: t.rating || '4.5',
        img: t.img || (t.images?.[0]?.startsWith('http') 
          ? t.images[0] 
          : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '')}${t.images?.[0] || '/Perreferred1.png'}`),
      };
    });
  }, [allTurfs, searchQuery, selectedSports, selectedCity]);

  const toggleSport = (sport: string) => {
    setSelectedSports(prev => 
      prev.includes(sport) ? prev.filter(s => s !== sport) : [...prev, sport]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSports([]);
    setSelectedCity("");
  };

  const handleAutoDetect = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const city = data.address.city || data.address.town || data.address.village || data.address.state_district || "";
          
          if (city) {
            setSelectedCity(city);
            toast.success(`Location detected: ${city}`);
          } else {
            toast.error("Could not determine city name");
          }
        } catch (error) {
          console.error("Reverse geocoding failed:", error);
          toast.error("Failed to detect city name");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Failed to get your location");
        setLoading(false);
      }
    );
  };

  // Calculate active filters count for the badge
  const activeFilterCount = (searchQuery ? 1 : 0) + (selectedCity ? 1 : 0) + selectedSports.length;

  if (loading && allTurfs.length === 0) {
    return (
      <div className="py-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1abc60]" />
      </div>
    );
  }

  return (
    <section className="py-16 bg-gray-50/50 relative">
      <div className="max-w-[1200px] mx-auto px-4">
        
        {/* --- Header Section --- */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">Featured Venues</h2>
            <p className="text-gray-500 text-[14px]">Curated selection of high-performance grounds.</p>
          </div>
          
          <button 
            onClick={() => setIsFilterModalOpen(true)}
            className="relative flex items-center gap-2 !text-[#1abc60] text-[14px] font-bold hover:!text-[#169c4e] transition-colors mt-2 !bg-white px-5 py-2.5 rounded-xl border !border-gray-200 shadow-sm hover:shadow-md hover:!border-[#1abc60]/30 cursor-pointer"
          >
            <Filter className="w-4 h-4" /> 
            <span>Filter & Sort</span> 
            <ChevronDown className="w-4 h-4 text-gray-400" />
            
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 !bg-[#1abc60] !text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 !border-white shadow-sm">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* --- Cards Grid --- */}
        {filteredVenues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues.map((venue) => (
              <div 
                key={venue.id} 
                className="bg-white rounded-[16px] overflow-hidden border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                {/* Image Container with Rating Badge */}
                <Link href={`/ground/${venue.id}`} className="relative h-[200px] w-full p-2.5 block">
                  <div className="w-full h-full rounded-[12px] overflow-hidden relative">
                     <img 
                       src={venue.img} 
                       alt={venue.name} 
                       className="w-full h-full object-cover" 
                     />
                  </div>
                  
                  <div className="absolute top-5 right-5 bg-white px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <span className="text-[12px] font-bold text-gray-800">{venue.rating}</span>
                    <Star className="w-3 h-3 text-[#FFB800] fill-[#FFB800]" />
                  </div>
                </Link>

                <div className="p-5 pt-3 flex flex-col flex-1">
                  <Link href={`/ground/${venue.id}`} className="block hover:text-[#1abc60] transition-colors">
                    <h3 className="font-bold text-[17px] text-gray-900 mb-1.5 line-clamp-1">{venue.name}</h3>
                  </Link>
                  
                  <p className="text-gray-500 text-[13px] flex items-center gap-1.5 mb-6">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" /> 
                    <span className="line-clamp-1">{venue.location}</span>
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="text-gray-900 font-bold text-xl flex items-baseline gap-1">
                      {venue.price}
                      <span className="text-[12px] font-medium text-gray-400 uppercase">/ hr</span>
                    </div>
                    
                    <Link href={`/ground/${venue.id}`} className="!bg-[#1abc60] hover:!bg-[#169c4e] !text-white px-5 py-2 rounded-lg text-[13px] font-bold transition-colors no-underline">
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-gray-900 font-bold text-xl mb-2">No venues found</h3>
            <p className="text-gray-500 text-sm mb-6">Try adjusting your filters or search terms to find what you're looking for.</p>
            <button 
              onClick={clearFilters}
              className="!bg-[#1abc60] hover:!bg-[#169c4e] !text-white font-bold px-6 py-2.5 rounded-xl transition-colors cursor-pointer !border-none"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* --- Filter Modal --- */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsFilterModalOpen(false)}
          />
          <div className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] transform transition-all">
            
            {/* Modal Header */}
            <div className="px-6 py-5 flex justify-between items-center border-b border-gray-100 bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Filter Venues</h2>
                <p className="text-xs font-medium text-gray-500 mt-0.5">Find exactly what you need</p>
              </div>
              <button 
                onClick={() => setIsFilterModalOpen(false)} 
                className="p-2 !bg-gray-50 !text-gray-400 hover:!text-gray-800 hover:!bg-gray-100 rounded-full transition-colors !border-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
              
              {/* Search Field */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Search className="w-3.5 h-3.5" /> Quick Search
                </label>
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by venue name or landmark..."
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] transition-all placeholder:font-normal"
                    />
                  </div>
                  <button
                    onClick={handleAutoDetect}
                    disabled={loading}
                    className="p-3.5 bg-white border border-gray-200 rounded-xl text-[#1abc60] hover:bg-[#e8f8ef] hover:border-[#1abc60] transition-all flex items-center justify-center shadow-sm cursor-pointer"
                    title="Auto Detect Location"
                  >
                    <Navigation className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* City Selection (Chips Style) */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" /> Location
                </label>
                <div className="flex flex-wrap gap-2.5">
                  <button 
                    onClick={() => setSelectedCity("")}
                    className={`px-4 py-2 rounded-full text-[13px] font-bold border transition-all cursor-pointer ${
                      !selectedCity 
                        ? '!bg-[#1abc60] !text-white !border-[#1abc60] shadow-sm' 
                        : '!bg-white !text-gray-600 !border-gray-200 hover:!border-gray-300 hover:!bg-gray-50'
                    }`}
                  >
                    Anywhere
                  </button>
                  {availableCities.map(city => (
                    <button 
                      key={city}
                      onClick={() => setSelectedCity(city)}
                      className={`px-4 py-2 rounded-full text-[13px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        selectedCity === city 
                          ? '!bg-[#1abc60]/10 !text-[#1abc60] !border-[#1abc60]' 
                          : '!bg-white !text-gray-600 !border-gray-200 hover:!border-gray-300 hover:!bg-gray-50'
                      }`}
                    >
                      {selectedCity === city && <Check className="w-3.5 h-3.5" />}
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sports Categories (Chips Style) */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sports</label>
                <div className="flex flex-wrap gap-2.5">
                  {availableSports.map(sport => {
                    const isSelected = selectedSports.includes(sport);
                    return (
                      <button 
                        key={sport}
                        onClick={() => toggleSport(sport)}
                        className={`px-4 py-2 rounded-full text-[13px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected 
                            ? '!bg-[#1abc60] !text-white !border-[#1abc60] shadow-sm' 
                            : '!bg-white !text-gray-600 !border-gray-200 hover:!border-gray-300 hover:!bg-gray-50'
                        }`}
                      >
                        {sport}
                        {isSelected && <Check className="w-3.5 h-3.5 !text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-gray-100 bg-white flex gap-3 sticky bottom-0 z-10">
              <button 
                onClick={clearFilters}
                className="px-6 py-3.5 rounded-xl text-sm font-bold !text-gray-500 !bg-gray-50 hover:!bg-gray-100 transition-all border !border-gray-200 cursor-pointer"
              >
                Clear All
              </button>
              <button 
                onClick={() => setIsFilterModalOpen(false)}
                className="flex-1 px-6 py-3.5 rounded-xl text-sm font-bold !text-white !bg-[#1abc60] hover:!bg-[#169c4e] transition-all !border-none cursor-pointer shadow-lg shadow-[#1abc60]/20 flex justify-center items-center gap-2"
              >
                Apply Filters
                {activeFilterCount > 0 && (
                  <span className="bg-white/20 px-2 py-0.5 rounded-md text-xs">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}