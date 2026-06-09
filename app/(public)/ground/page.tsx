"use client";

import { useState, useMemo, useEffect, Suspense, useCallback } from 'react';
import Link from 'next/link'; 
import { MapPin, Star, ChevronLeft, ChevronRight, Check, Filter, X, Loader2, Search, Trophy, Navigation } from 'lucide-react';
import api from '@/app/services/api';
import { useSearchParams } from 'next/navigation';

// ============= Fallback Coordinates and Distance Helper =============
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
  'jamshedpur': { lat: 22.8046, lng: 86.2029 }
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

// ============= Types =============
interface Amenity {
  name: string;
  icon?: string;
}

interface Venue {
  id: string;
  title: string;
  location: string;
  fullAddress: string;
  rating: number;
  price: number;
  category: string;
  isActive: boolean;
  amenities: string[];
  image: string;
  featured: boolean;
  reviewsCount?: number;
  sportTypes?: string[];
  hasTournament?: boolean;
  coordinates?: {
    lat?: number;
    lng?: number;
  };
}

// ============= Subcomponents =============
const AmenityBadge = ({ amenity }: { amenity: string }) => (
  <span className="inline-flex items-center bg-gray-100 text-gray-700 text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">
    {amenity}
  </span>
);

const RatingStars = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${
            i < fullStars 
              ? 'fill-amber-400 text-amber-400' 
              : i === fullStars && hasHalfStar
              ? 'fill-amber-400 text-amber-400 opacity-50'
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
};

const VenueCard = ({ venue, userCoords }: { venue: Venue; userCoords: { lat: number; lng: number } | null }) => {
  const [imgError, setImgError] = useState(false);
  
  const distance = useMemo(() => {
    let lat = venue.coordinates?.lat;
    let lng = venue.coordinates?.lng;

    // Fallback to city coordinates if venue coordinates are missing
    if ((!lat || !lng) && venue.location) {
      const parts = venue.location.split(',');
      const city = parts[parts.length - 1].trim().toLowerCase();
      const fallback = CITY_COORDS_FALLBACK[city];
      if (fallback) {
        lat = fallback.lat;
        lng = fallback.lng;
      }
    }

    if (userCoords && lat && lng) {
      return calculateDistance(userCoords.lat, userCoords.lng, lat, lng);
    }
    return null;
  }, [venue.coordinates, venue.location, userCoords]);
  
  return (
    <Link href={`/ground/${venue.id}`} className="block group">
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden flex flex-col h-full shadow-sm hover:shadow-lg transition-all duration-300">
        {/* Image Area */}
        <div className="relative h-[220px] w-full bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {!imgError ? (
            <img 
              src={venue.image} 
              alt={venue.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm font-medium">Image Not Available</p>
              </div>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            {venue.featured && (
              <span className="bg-gradient-to-r from-[#1abc60] to-[#16a085] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                Featured
              </span>
            )}
            {venue.hasTournament && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Trophy className="w-3 h-3" /> Tournament
              </span>
            )}
            <div className="bg-white/95 backdrop-blur-sm text-gray-800 text-[11px] font-bold px-2.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm ml-auto">
              <RatingStars rating={venue.rating} />
              <span className="ml-0.5">{venue.rating > 0 ? venue.rating : 'New'}</span>
              {venue.reviewsCount !== undefined && venue.reviewsCount > 0 && (
                <span className="text-gray-500 text-[9px] font-normal">
                  ({venue.reviewsCount})
                </span>
              )}
            </div>
          </div>
          
          {/* Active/Inactive Badge */}
          {!venue.isActive && (
            <div className="absolute bottom-3 left-3 bg-gray-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
              Temporarily Closed
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-[17px] font-bold text-gray-900 mb-1.5 leading-tight group-hover:text-[#1abc60] transition-colors line-clamp-1">
            {venue.title}
          </h3>
          
          <div className="flex items-center text-gray-500 text-[12px] mb-3 justify-between">
            <div className="flex items-center min-w-0">
              <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
              <span className="line-clamp-1">{venue.location}</span>
            </div>
            {distance !== null && (
              <span className="text-[#1abc60] font-extrabold shrink-0 bg-green-50 px-2 py-0.5 rounded-md text-[11px] border border-green-100 flex items-center gap-0.5 ml-2">
                <Navigation className="w-2.5 h-2.5 fill-current" />
                {distance.toFixed(1)} km
              </span>
            )}
          </div>
          
          {/* Sport Categories */}
          {venue.sportTypes && venue.sportTypes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {venue.sportTypes.slice(0, 3).map((sport) => (
                <span key={sport} className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                  {sport}
                </span>
              ))}
              {venue.sportTypes.length > 3 && (
                <span className="bg-gray-100 text-gray-600 text-[9px] font-bold px-2 py-1 rounded-full">
                  +{venue.sportTypes.length - 3}
                </span>
              )}
            </div>
          )}
          
          {/* Amenities */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {venue.amenities.slice(0, 4).map((amenity) => (
              <AmenityBadge key={amenity} amenity={amenity} />
            ))}
            {venue.amenities.length > 4 && (
              <span className="bg-gray-100 text-gray-600 text-[9px] font-bold px-2 py-1 rounded-full">
                +{venue.amenities.length - 4}
              </span>
            )}
          </div>
          
          {/* Price and Action */}
          <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-0.5">
                <span className="text-[22px] font-bold text-gray-900">₹{venue.price}</span>
                <span className="text-[11px] text-gray-500 font-semibold uppercase">/hour</span>
              </div>
              {venue.featured && (
                <span className="text-[9px] text-[#1abc60] font-semibold uppercase tracking-wide mt-0.5">
                  Best Price Guaranteed
                </span>
              )}
            </div>
            <button 
              type="button" 
              className={`${
                venue.isActive 
                  ? 'bg-[#1abc60] hover:bg-[#169c4e] cursor-pointer' 
                  : 'bg-gray-300 cursor-not-allowed'
              } text-white text-[13px] font-bold px-5 py-2.5 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm`}
              disabled={!venue.isActive}
              onClick={(e) => {
                if (!venue.isActive) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
            >
              {venue.isActive ? 'Book Now' : 'Unavailable'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }: any) => {
  if (totalPages <= 1) return null;
  
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };
  
  return (
    <div className="mt-14 flex justify-center items-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="bg-white border border-gray-200 rounded-lg p-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
      </button>
      
      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          className={`min-w-[36px] h-9 flex items-center justify-center text-[13px] font-semibold rounded-lg transition-all cursor-pointer ${
            currentPage === page
              ? 'bg-[#1abc60] text-white shadow-md'
              : page === '...'
              ? 'bg-transparent text-gray-400 cursor-default'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
          }`}
          disabled={page === '...'}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="bg-white border border-gray-200 rounded-lg p-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
      </button>
    </div>
  );
};


// ============= Main Component =============
function GroundContent() {
  const searchParams = useSearchParams();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [showOnlyTournaments, setShowOnlyTournaments] = useState(false);
  
  // User Coordinates and Detected Location Name
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [userLocationName, setUserLocationName] = useState<string>("");
  
  // Available sports and tournaments
  const [availableSports, setAvailableSports] = useState<string[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);

  // Fetch User Geolocation
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserCoords({ lat, lng });
          
          // Reverse geocoding to get city name
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            .then(res => res.json())
            .then(data => {
              const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state_district || "";
              if (city) {
                setUserLocationName(city);
              }
            })
            .catch(err => console.error("Reverse geocoding error:", err));
        },
        (error) => {
          console.warn("Browser geolocation failed/denied, trying IP location...", error);
          fetch('https://ip-api.com/json/')
            .then(res => res.json())
            .then(ipData => {
              if (ipData.lat && ipData.lon) {
                setUserCoords({
                  lat: ipData.lat,
                  lng: ipData.lon
                });
                if (ipData.city) {
                  setUserLocationName(ipData.city);
                }
              }
            })
            .catch(ipErr => {
              console.error("IP geolocation failed:", ipErr);
            });
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
      );
    }
  }, []);

  // Handle sport and location query params
  useEffect(() => {
    const sport = searchParams.get('sport');
    const location = searchParams.get('location');

    if (sport) {
      setSelectedCategories([sport]);
    }

    if (location) {
      setSearchQuery(location);
    }
  }, [searchParams]);

  // Fetch venues and tournaments
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [turfRes, tournamentRes] = await Promise.all([
        api.get('/turfs'),
        api.get('/tournaments')
      ]);

      let activeTournaments: any[] = [];
      if (tournamentRes.data.success) {
        activeTournaments = tournamentRes.data.tournaments;
        setTournaments(activeTournaments);
      }

      if (turfRes.data.success) {
        const rawTurfs = turfRes.data.turfs || [];
        const combinedTurfs = [...rawTurfs];
        
        const mappedVenues = combinedTurfs
          .filter((t: any) => t.isActive !== false) // Filter inactive if needed
          .map((t: any) => {
            const hasTournament = activeTournaments.some(tour => 
              tour.location?.venue?.toLowerCase() === t.name?.toLowerCase() &&
              tour.status?.toLowerCase() !== 'finished' && 
              tour.status?.toLowerCase() !== 'cancelled'
            );

            // Get minimum price from sportConfigs or use pricePerHour
            let currentPrice = Number(t.pricePerHour || 0);
            if (t.sportConfigs && t.sportConfigs.length > 0) {
              const sportPrices = t.sportConfigs.map((sc: any) => Number(sc.pricePerHour || 0)).filter((p: number) => p > 0);
              if (sportPrices.length > 0) {
                currentPrice = Math.min(...sportPrices);
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
              title: t.name,
              location: `${t.location.landmark ? t.location.landmark + ', ' : ''}${t.location.city}`,
              fullAddress: `${t.location.address || ''} ${t.location.landmark || ''} ${t.location.city || ''}`,
              rating: t.rating || 0,
              reviewsCount: t.reviewsCount || 0,
              price: currentPrice,
              category: t.sports?.[0] || 'Sports',
              isActive: t.isActive !== undefined ? t.isActive : true,
              amenities: t.amenities?.map((a: any) => {
                const name = typeof a === 'string' ? a : (a?.name || 'Amenity');
                return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
              }) || [],
              sportTypes: t.sports || [],
              image: displayImage,
              featured: t.isFeatured || t.rating >= 4.5 || false,
              hasTournament,
              coordinates: t.location?.coordinates
            };
          });
        
        setVenues(mappedVenues);
        
        // Extract unique sports
        const sports = new Set<string>();
        mappedVenues.forEach((venue: Venue) => {
          venue.sportTypes?.forEach(sport => sports.add(sport));
        });
        setAvailableSports(Array.from(sports).sort());
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter Logic
  const filteredVenues = useMemo(() => {
    let filtered = venues.filter((venue) => {
      const matchesSearch = 
        venue.fullAddress.toLowerCase().includes(searchQuery.toLowerCase()) || 
        venue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategories.length === 0 || 
        selectedCategories.some(cat => venue.sportTypes?.includes(cat));
      
      const matchesRating = venue.rating >= minRating;
      const matchesPrice = venue.price <= maxPrice;
      const matchesTournament = !showOnlyTournaments || venue.hasTournament;
      
      return matchesSearch && matchesCategory && matchesRating && matchesPrice && venue.isActive && matchesTournament;
    });
    
    // Sort by rating and featured
    filtered.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return b.rating - a.rating;
    });
    
    return filtered;
  }, [venues, searchQuery, selectedCategories, minRating, maxPrice]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredVenues.length / itemsPerPage);
  const paginatedVenues = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredVenues.slice(start, end);
  }, [filteredVenues, currentPage, itemsPerPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategories, minRating, maxPrice]);

  // Handlers
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setMinRating(0);
    setMaxPrice(5000);
    setShowOnlyTournaments(false);
    setCurrentPage(1);
  };

  const categoriesToShow = availableSports.length > 0 ? availableSports : ["Football", "Cricket", "Tennis", "Badminton", "Basketball"];

  return (
    <div className="min-h-screen bg-[#fafafb] pb-20 font-sans relative">
      
      {/* Mobile Floating Filter Button */}
      <button 
        onClick={() => setIsMobileFilterOpen(true)}
        className="lg:hidden fixed bottom-8 left-6 z-[40] bg-[#1abc60] text-white p-4 rounded-full shadow-[0_8px_30px_rgba(26,188,96,0.4)] border-none flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
        aria-label="Open filters"
      >
        <Filter className="w-6 h-6" strokeWidth={2.5} />
      </button>

      {/* Mobile Backdrop */}
      {isMobileFilterOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[50] lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileFilterOpen(false)}
        />
      )}

      {/* Main Container */}
      <div className="w-full flex flex-col lg:flex-row pt-[120px]">
        
        {/* Sidebar Filters */}
        <aside 
          className={`
            fixed top-0 left-0 h-full w-[85%] max-w-[320px] bg-white z-[60] overflow-y-auto transition-transform duration-300 ease-in-out
            lg:static lg:h-auto lg:w-[300px] xl:w-[320px] lg:z-10 lg:translate-x-0
            py-8 px-6 md:pl-8 lg:pl-10
            lg:rounded-r-2xl lg:shadow-[4px_0_24px_rgba(0,0,0,0.02)] lg:border lg:border-gray-200 lg:border-l-0
            ${isMobileFilterOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
          `}
        >
          {/* Header with Close Button */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-gray-900 tracking-wide uppercase">Filters</h2>
            <button 
              onClick={() => setIsMobileFilterOpen(false)}
              className="lg:hidden !bg-gray-100 hover:!bg-gray-200 !p-2 !rounded-full !border-none !text-gray-600 transition-colors cursor-pointer"
              aria-label="Close filters"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">Search Venue</h3>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1abc60] transition-colors z-10" strokeWidth={2.5} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, city, or landmark..."
                className="w-full bg-white border border-gray-300 text-gray-900 text-sm font-bold rounded-lg pl-9 pr-3 py-2.5 outline-none focus:border-[#1abc60] focus:ring-1 focus:ring-[#1abc60] transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-4">Max Price per Hour (₹)</h3>
            <div className="px-1">
              <div className="relative h-1.5 bg-gray-200 rounded-full mb-4">
                <div 
                  className="absolute h-full bg-[#1abc60] rounded-full" 
                  style={{ left: '0%', right: `${100 - (maxPrice / 5000) * 100}%` }} 
                />
                <input 
                  type="range" 
                  min="500" 
                  max="5000" 
                  step="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 h-4 w-4 bg-[#1abc60] rounded-full shadow-md pointer-events-none" 
                  style={{ left: `calc(${(maxPrice / 5000) * 100}% - 8px)` }} 
                />
              </div>
              <div className="flex justify-between text-xs font-bold text-gray-600">
                <span>₹500</span>
                <span>₹{maxPrice}</span>
              </div>
            </div>
          </div>

          {/* Tournament Filter */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-4">Tournaments</h3>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" className="hidden" checked={showOnlyTournaments} onChange={() => setShowOnlyTournaments(!showOnlyTournaments)} />
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${showOnlyTournaments ? 'bg-[#1abc60] border-[#1abc60]' : 'bg-white border-gray-300'}`}>
                {showOnlyTournaments && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
              </div>
              <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">Tournament Available</span>
            </label>
          </div>

          {/* Sport Categories */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-4">Sport Categories</h3>
            <div className="flex flex-col gap-3">
              {categoriesToShow.map((sport) => (
                <label key={sport} className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="hidden" checked={selectedCategories.includes(sport)} onChange={() => toggleCategory(sport)} />
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedCategories.includes(sport) ? 'bg-[#1abc60] border-[#1abc60]' : 'bg-white border-gray-300'}`}>
                    {selectedCategories.includes(sport) && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">{sport}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-4">Minimum Rating</h3>
            <div className="flex gap-2">
              {[3.5, 4.0, 4.5].map((rating) => (
                <button 
                  key={rating}
                  onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg border transition-all cursor-pointer ${
                    minRating === rating 
                      ? 'border-[#1abc60] text-[#1abc60] bg-[#e8f8ef]' 
                      : 'border-gray-200 text-gray-700 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {rating.toFixed(1)}+
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button 
              onClick={clearFilters}
              className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors bg-transparent border-none cursor-pointer p-0"
            >
              Clear All
            </button>
            <button 
              onClick={() => setIsMobileFilterOpen(false)} 
              className="bg-[#1abc60] hover:bg-[#169c4e] transition-colors text-white text-sm font-bold px-5 py-2.5 rounded-lg border-none shadow-sm cursor-pointer"
            >
              Apply
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-4 md:px-8 lg:px-10 w-full pt-6 lg:pt-0">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
                Available Venues
              </h1>
              <p className="text-gray-500 text-sm mt-1 flex items-center gap-1.5 flex-wrap">
                Book the best sports facilities in your city
                {userLocationName && (
                  <span className="inline-flex items-center gap-1 text-[#1abc60] bg-green-50 border border-green-100 px-2 py-0.5 rounded-full text-[11px] font-bold">
                    <Navigation className="w-2.5 h-2.5 fill-current animate-pulse" />
                    Near {userLocationName}
                  </span>
                )}
              </p>
            </div>
            <div className="bg-white border border-gray-200 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg shadow-sm">
              {filteredVenues.length} Venue{filteredVenues.length !== 1 ? 's' : ''} Found
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-[#1abc60]" />
              <p className="text-gray-500 mt-4">Loading venues...</p>
            </div>
          ) : filteredVenues.length > 0 ? (
            <>
              {/* Venues Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedVenues.map((venue) => (
                  <VenueCard key={venue.id} venue={venue} userCoords={userCoords} />
                ))}
              </div>
              
              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          ) : (
            // Empty State
            <div className="py-20 text-center">
              <div className="max-w-md mx-auto">
                <div className="bg-gray-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-gray-900 font-bold text-xl mb-2">No venues found</h3>
                <p className="text-gray-500 text-sm mb-6">
                  We couldn't find any venues matching your criteria. Try adjusting your filters or search terms.
                </p>
                <button 
                  onClick={clearFilters}
                  className="bg-[#1abc60] hover:bg-[#169c4e] text-white font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Main export with Suspense
export default function GroundPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-[#1abc60]" />
        <p className="text-gray-500 mt-4">Loading page...</p>
      </div>
    }>
      <GroundContent />
    </Suspense>
  );
}