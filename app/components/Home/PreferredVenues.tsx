"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { MapPin, Star, ChevronDown, Loader2, Filter, X, Search, Check, Navigation, ArrowRight } from 'lucide-react';
import api from '@/app/services/api';
import { toast } from 'sonner';

const CITY_COORDS_FALLBACK: Record<string, { lat: number; lng: number }> = {
  'bangalore': { lat: 12.9716, lng: 77.5946 },
  'bengaluru': { lat: 12.9716, lng: 77.5946 },
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'delhi': { lat: 28.6139, lng: 77.2090 },
  'new delhi': { lat: 28.6139, lng: 77.2090 },
  'kolkata': { lat: 22.5726, lng: 88.3639 },
  'chennai': { lat: 13.0827, lng: 80.2707 },
  'hyderabad': { lat: 17.3850, lng: 78.4867 },
  'pune': { lat: 18.5204, lng: 73.8567 },
  'ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'jaipur': { lat: 26.9124, lng: 75.7873 },
  'surat': { lat: 21.1702, lng: 72.8311 },
  'lucknow': { lat: 26.8467, lng: 80.9462 },
  'kanpur': { lat: 26.4499, lng: 80.3319 },
  'ghaziabad': { lat: 28.6692, lng: 77.4538 },
  'noida': { lat: 28.5355, lng: 77.3910 },
  'greater noida': { lat: 28.4744, lng: 77.5040 },
  'gurgaon': { lat: 28.4595, lng: 77.0266 },
  'gurugram': { lat: 28.4595, lng: 77.0266 },
  'faridabad': { lat: 28.4089, lng: 77.3178 },
  'varanasi': { lat: 25.3176, lng: 82.9739 },
  'patna': { lat: 25.5941, lng: 85.1376 },
  'indore': { lat: 22.7196, lng: 75.8577 },
  'bhopal': { lat: 23.2599, lng: 77.4126 },
  'ludhiana': { lat: 30.9010, lng: 75.8573 },
  'agra': { lat: 27.1767, lng: 78.0081 },
  'vadodara': { lat: 22.3072, lng: 73.1812 },
  'nashik': { lat: 19.9975, lng: 73.7898 },
  'jamshedpur': { lat: 22.8046, lng: 86.2029 },
  'asansol': { lat: 23.6740, lng: 86.9520 },
  'dhanbad': { lat: 23.7957, lng: 86.4304 },
  'howrah': { lat: 22.5958, lng: 88.2636 },
  'ranipet': { lat: 12.9270, lng: 79.3328 },
  'vellore': { lat: 12.9165, lng: 79.1325 },
  'coimbatore': { lat: 11.0168, lng: 76.9558 },
  'madurai': { lat: 9.9252, lng: 78.1198 },
  'tiruchirappalli': { lat: 10.7905, lng: 78.7047 },
  'trichy': { lat: 10.7905, lng: 78.7047 },
  'salem': { lat: 11.6643, lng: 78.1460 },
  'tiruppur': { lat: 11.1085, lng: 77.3411 },
  'erode': { lat: 11.3410, lng: 77.7172 },
  'tirunelveli': { lat: 8.7139, lng: 77.7567 },
  'thiruvananthapuram': { lat: 8.5241, lng: 76.9366 },
  'trivandrum': { lat: 8.5241, lng: 76.9366 },
  'kochi': { lat: 9.9312, lng: 76.2673 },
  'kozhikode': { lat: 11.2588, lng: 75.7804 },
  'calicut': { lat: 11.2588, lng: 75.7804 },
  'thrissur': { lat: 10.5276, lng: 76.2144 },
  'kollam': { lat: 8.8932, lng: 76.6141 },
  'visakhapatnam': { lat: 17.6868, lng: 83.2185 },
  'vizag': { lat: 17.6868, lng: 83.2185 },
  'vijayawada': { lat: 16.5062, lng: 80.6480 },
  'guntur': { lat: 16.3067, lng: 80.4365 },
  'nellore': { lat: 14.4426, lng: 79.9865 },
  'kurnool': { lat: 15.8281, lng: 78.0373 },
  'kakinada': { lat: 16.9891, lng: 82.2475 },
  'rajahmundry': { lat: 17.0005, lng: 81.8040 },
  'tirupati': { lat: 13.6288, lng: 79.4192 },
  'kadapa': { lat: 14.4673, lng: 78.8242 },
  'anantapur': { lat: 14.6819, lng: 77.6006 },
  'warangal': { lat: 17.9689, lng: 79.5941 },
  'nizamabad': { lat: 18.6725, lng: 78.0941 },
  'khammam': { lat: 17.2473, lng: 80.1514 },
  'karimnagar': { lat: 18.4386, lng: 79.1288 },
  'ramagundam': { lat: 18.8021, lng: 79.4449 },
  'raipur': { lat: 21.2514, lng: 81.6296 },
  'durg': { lat: 21.1904, lng: 81.2849 },
  'bhilai': { lat: 21.1938, lng: 81.3509 },
  'bilaspur': { lat: 22.0790, lng: 82.1391 },
  'korba': { lat: 22.3523, lng: 82.7291 },
  'raigarh': { lat: 21.8974, lng: 83.3932 },
  'ranchi': { lat: 23.3441, lng: 85.3096 },
  'bokaro': { lat: 23.6693, lng: 86.1511 },
  'deoghar': { lat: 24.4819, lng: 86.7025 },
  'hazaribagh': { lat: 23.9926, lng: 85.3637 },
  'bhubaneswar': { lat: 20.2961, lng: 85.8245 },
  'cuttack': { lat: 20.4625, lng: 85.8830 },
  'rourkela': { lat: 22.2604, lng: 84.8536 },
  'puri': { lat: 19.8134, lng: 85.8315 },
  'sambalpur': { lat: 21.4669, lng: 83.9812 },
  'jabalpur': { lat: 23.1815, lng: 79.9864 },
  'gwalior': { lat: 26.2183, lng: 78.1828 },
  'ujjain': { lat: 23.1760, lng: 75.7885 },
  'sagar': { lat: 23.8388, lng: 78.7378 },
  'dewas': { lat: 22.9623, lng: 76.0508 },
  'satna': { lat: 24.6005, lng: 80.8322 },
  'ratlam': { lat: 23.3315, lng: 75.0367 },
  'singrauli': { lat: 24.1957, lng: 82.6683 },
  'rewa': { lat: 24.5362, lng: 81.3037 },
  'murwara': { lat: 23.8343, lng: 80.3993 },
  'katni': { lat: 23.8343, lng: 80.3993 },
  'chhindwara': { lat: 22.0574, lng: 78.9382 },
  'jodhpur': { lat: 26.2389, lng: 73.0243 },
  'kota': { lat: 25.2138, lng: 75.8648 },
  'bikaner': { lat: 28.0229, lng: 73.3119 },
  'ajmer': { lat: 26.4498, lng: 74.6399 },
  'udaipur': { lat: 24.5854, lng: 73.7125 },
  'bhilwara': { lat: 25.3478, lng: 74.6408 },
  'alwar': { lat: 27.5530, lng: 76.6346 },
  'srinagar': { lat: 34.0837, lng: 74.7973 },
  'jammu': { lat: 32.7266, lng: 74.8570 },
  'shimla': { lat: 31.1048, lng: 77.1734 },
  'dehradun': { lat: 30.3165, lng: 78.0322 },
  'haridwar': { lat: 29.9457, lng: 78.1642 },
  'haldwani': { lat: 29.2183, lng: 79.5131 },
  'roorkee': { lat: 29.8543, lng: 77.8880 },
  'guwahati': { lat: 26.1445, lng: 91.7362 },
  'silchar': { lat: 24.8333, lng: 92.7789 },
  'dibrugarh': { lat: 27.4728, lng: 94.9120 },
  'jorhat': { lat: 26.7509, lng: 94.2037 },
  'nagaon': { lat: 26.3483, lng: 92.6838 },
  'imphal': { lat: 24.8170, lng: 93.9368 },
  'shillong': { lat: 25.5788, lng: 91.8831 },
  'aizawl': { lat: 23.7307, lng: 92.7173 },
  'kohima': { lat: 25.6751, lng: 94.1086 },
  'gangtok': { lat: 27.3314, lng: 88.6138 },
  'itanagar': { lat: 27.0844, lng: 93.6053 },
  'panaji': { lat: 15.4909, lng: 73.8278 },
  'margao': { lat: 15.2736, lng: 73.9580 },
  'vasco da gama': { lat: 15.3959, lng: 73.8143 }
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};

export default function FeaturedVenues() {
  const [allTurfs, setAllTurfs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>({ lat: 26.9124, lng: 75.7873 });
  
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
    // 1. Try browser Geolocation first
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        async (error) => {
          console.warn("Browser geolocation failed/denied, trying IP location...", error);
          // 2. Fallback to IP geolocation
          try {
            const ipRes = await fetch('https://ipapi.co/json/');
            const ipData = await ipRes.json();
            if (ipData.latitude && ipData.longitude) {
              setUserCoords({
                lat: ipData.latitude,
                lng: ipData.longitude
              });
              console.log("IP-based location detected:", ipData.city);
            }
          } catch (ipErr) {
            console.error("IP geolocation failed:", ipErr);
          }
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
      );
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Disable body scroll when modal is open
  useEffect(() => {
    if (isFilterModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFilterModalOpen]);

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

    // Map & calculate distances
    const venuesWithDistance = filtered.map((t: any) => {
      let lat = t.location?.coordinates?.lat;
      let lng = t.location?.coordinates?.lng;

      // Fallback to city coordinates if venue coordinates are missing
      if ((!lat || !lng) && t.location?.city) {
        const cityKey = t.location.city.toLowerCase().trim();
        const fallback = CITY_COORDS_FALLBACK[cityKey];
        if (fallback) {
          lat = fallback.lat;
          lng = fallback.lng;
        }
      }

      let distance: number | null = null;
      if (userCoords && lat && lng) {
        distance = calculateDistance(userCoords.lat, userCoords.lng, lat, lng);
      }

      // Get minimum price from sportConfigs or use pricePerHour
      let currentPriceValue = Number(t.pricePerHour || 0);
      if (t.sportConfigs && t.sportConfigs.length > 0) {
        const sportPrices = t.sportConfigs.map((sc: any) => Number(sc.pricePerHour || 0)).filter((p: number) => p > 0);
        if (sportPrices.length > 0) {
          currentPriceValue = Math.min(...sportPrices);
        }
      }

      // Get images from sportConfigs if main images array is empty
      let displayImage = '/Perreferred1.png';
      let allImages = [...(t.images || [])];
      
      if (t.sportConfigs && t.sportConfigs.length > 0) {
        t.sportConfigs.forEach((sc: any) => {
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

      return {
        id: t._id,
        name: t.name,
        location: `${t.location?.landmark ? t.location.landmark + ', ' : ''}${t.location?.city}`,
        price: `₹${currentPriceValue}`,
        rating: t.rating || 0,
        reviewsCount: t.reviewsCount || 0,
        img: displayImage,
        distance,
        createdAt: t.createdAt
      };
    });

    // Sort by createdAt descending (newest first)
    venuesWithDistance.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return venuesWithDistance.slice(0, 3);
  }, [allTurfs, searchQuery, selectedSports, selectedCity, userCoords]);

  const toggleSport = (sport: string) => {
    setSelectedSports(prev => 
      prev.includes(sport) ? prev.filter(s => s !== sport) : [...prev, sport]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSports([]);
    setSelectedCity("");
    setIsFilterModalOpen(false);
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
      <div className="py-16 flex items-center justify-center min-h-[400px]">
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
            className="relative flex items-center gap-1.5 sm:gap-2 text-[#1abc60] text-[14px] font-extrabold hover:text-[#169c4e] transition-colors mt-2 bg-white p-2.5 sm:px-5 sm:py-2.5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-[#1abc60]/30 cursor-pointer"
          >
            <Filter className="w-5 h-5 sm:w-4 sm:h-4" strokeWidth={2.5} /> 
            <span className="hidden sm:inline">Filter & Sort</span> 
            <ChevronDown className="hidden sm:block w-4 h-4 text-gray-400" strokeWidth={2.5} />
            
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#1abc60] text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* --- Cards Grid --- */}
        {filteredVenues.length > 0 ? (
          <>
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
                    
                    <p className="text-gray-500 text-[13px] flex items-center justify-between mb-6">
                      <span className="flex items-center gap-1.5 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" /> 
                        <span className="line-clamp-1">{venue.location}</span>
                      </span>
                      {venue.distance !== null && (
                        <span className="text-[#1abc60] font-extrabold shrink-0 bg-green-50 px-2 py-0.5 rounded-md text-[11px] border border-green-100 flex items-center gap-0.5">
                          <Navigation className="w-2.5 h-2.5 fill-current" />
                          {venue.distance.toFixed(1)} km
                        </span>
                      )}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="text-gray-900 font-bold text-xl flex items-baseline gap-1">
                        {venue.price}
                        <span className="text-[12px] font-medium text-gray-400 uppercase">/ hr</span>
                      </div>
                      
                      <Link href={`/ground/${venue.id}`} className="bg-[#1abc60] hover:bg-[#169c4e] text-white px-5 py-2 rounded-lg text-[13px] font-bold transition-colors no-underline">
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-12">
              <Link 
                href="/ground" 
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#1abc60] hover:bg-[#169c4e] text-white rounded-xl text-[15px] font-extrabold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer no-underline"
              >
                View All Venues <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        ) : (
          <div className="py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-gray-900 font-bold text-xl mb-2">No venues found</h3>
            <p className="text-gray-500 text-sm mb-6">Try adjusting your filters or search terms to find what you're looking for.</p>
            <button 
              onClick={clearFilters}
              className="bg-[#1abc60] hover:bg-[#169c4e] text-white font-bold px-6 py-2.5 rounded-xl transition-colors cursor-pointer border-none"
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
                <p className="text-xs font-bold text-gray-500 mt-0.5">Find exactly what you need</p>
              </div>
              <button 
                onClick={() => setIsFilterModalOpen(false)} 
                className="p-2 bg-gray-50 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors border-none cursor-pointer"
              >
                <X className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
              
              {/* Search Field */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2">
                  <Search className="w-3.5 h-3.5" strokeWidth={2.5} /> Quick Search
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" strokeWidth={2.5} />
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by venue name or landmark..."
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] transition-all placeholder:font-medium placeholder:text-gray-400"
                    />
                  </div>
                  <button
                    onClick={handleAutoDetect}
                    disabled={loading}
                    className="p-3.5 bg-white border border-gray-200 rounded-xl text-[#1abc60] hover:bg-[#e8f8ef] hover:border-[#1abc60] transition-all flex items-center justify-center shadow-sm cursor-pointer shrink-0"
                    title="Auto Detect Location"
                  >
                    <Navigation className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* City Selection (Chips Style) */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" strokeWidth={2.5} /> Location
                </label>
                <div className="flex flex-wrap gap-2.5">
                  <button 
                    onClick={() => setSelectedCity("")}
                    className={`px-4 py-2 rounded-full text-[13px] font-bold border transition-all cursor-pointer ${
                      !selectedCity 
                        ? 'bg-[#1abc60] text-white border-[#1abc60] shadow-sm' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
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
                          ? 'bg-[#1abc60]/10 text-[#1abc60] border-[#1abc60]' 
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {selectedCity === city && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sports Categories (Chips Style) */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">Sports</label>
                <div className="flex flex-wrap gap-2.5">
                  {availableSports.map(sport => {
                    const isSelected = selectedSports.includes(sport);
                    return (
                      <button 
                        key={sport}
                        onClick={() => toggleSport(sport)}
                        className={`px-4 py-2 rounded-full text-[13px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected 
                            ? 'bg-[#1abc60] text-white border-[#1abc60] shadow-sm' 
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {sport}
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
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
                className="px-6 py-3.5 rounded-xl text-sm font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all border border-gray-200 cursor-pointer"
              >
                Clear All
              </button>
              <button 
                onClick={() => setIsFilterModalOpen(false)}
                className="flex-1 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-[#1abc60] hover:bg-[#169c4e] transition-all border-none cursor-pointer shadow-lg shadow-[#1abc60]/20 flex justify-center items-center gap-2"
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