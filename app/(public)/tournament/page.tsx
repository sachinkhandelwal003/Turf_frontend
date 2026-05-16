"use client";

import { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { MapPin, Check, Calendar, Clock, Activity, Filter, X, Loader2, Search } from 'lucide-react';
import api from '@/app/services/api';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';

interface Tournament {
  _id: string;
  title: string;
  description: string;
  sport: string;
  location: {
    address: string;
    city: string;
    venue: string;
  };
  prizePool: string;
  entryFee: number;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxTeams: number;
  registeredTeams: any[];
  status: string;
  image?: string;
}

function TournamentContent() {
  const searchParams = useSearchParams();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    const sport = searchParams.get('sport');
    const location = searchParams.get('location');

    if (sport) {
      const formattedSport = sport.charAt(0).toUpperCase() + sport.slice(1).toLowerCase();
      setSelectedCategories([formattedSport]);
    }
    
    if (location) {
      setSearchQuery(location);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await api.get('tournaments');
        if (res.data.success) {
          setTournaments(res.data.tournaments);
        }
      } catch (error) {
        toast.error('Failed to load tournaments');
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  const getImageUrl = (path: string) => {
    if (!path || path === 'undefined' || path === 'null' || path === '') return '/Tournamentfootball.jpg';
    if (path.startsWith('http')) return path;
    
    // Replace backslashes with forward slashes for cross-platform compatibility
    const normalizedPath = path.replace(/\\/g, '/');
    
    // Use the dynamic API URL detection logic from api.ts
    const getApiBaseUrl = () => {
      if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/, '');
      }
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          return 'http://localhost:5001';
        }
        if (/^192\.168\./.test(hostname) || /^10\./.test(hostname)) {
          return `http://${hostname}:5001`;
        }
      }
      return 'https://api.rkinteriorstudio.in';
    };

    const baseUrl = getApiBaseUrl();
    const cleanPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
    return `${baseUrl}${cleanPath}`;
  };

  const formatPrice = (price: string | number) => {
    if (price === undefined || price === null || price === '') return '0';
    if (typeof price === 'string') {
      const cleaned = price.replace(/[^0-9]/g, '');
      if (!cleaned) return price;
      return Number(cleaned).toLocaleString('en-IN');
    }
    return Number(price).toLocaleString('en-IN');
  };

  const filteredTournaments = useMemo(() => {
    return tournaments.filter((t) => {
      const locationStr = `${t.location.venue} ${t.location.address} ${t.location.city}`;
      const matchesSearch = locationStr.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      const tSport = t.sport.charAt(0).toUpperCase() + t.sport.slice(1).toLowerCase();
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(tSport); 
      
      const matchesPrice = t.entryFee <= maxPrice; 
      
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [tournaments, searchQuery, selectedCategories, maxPrice]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setMaxPrice(10000);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'upcoming': return 'bg-[#1abc60] text-white';
      case 'ongoing': return 'bg-blue-500 text-white';
      case 'postponed': return 'bg-orange-500 text-white';
      case 'cancelled': return 'bg-red-500 text-white';
      case 'finished':
      case 'completed': return 'bg-gray-500 text-white';
      default: return 'bg-[#1abc60] text-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafb] pt-[120px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1abc60]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafb] pb-20 font-sans relative">
      
      {/* MOBILE FAB */}
      <button 
        onClick={() => setIsMobileFilterOpen(true)}
        className="lg:hidden fixed bottom-8 left-6 z-[40] !bg-[#1abc60] !text-white !p-4 !rounded-full !shadow-[0_8px_30px_rgba(26,188,96,0.4)] !border-none flex items-center justify-center active:scale-95 transition-transform"
      >
        <Filter className="w-6 h-6" />
      </button>

      {/* MOBILE OVERLAY */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 bg-black/50 z-[50] lg:hidden backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)} />
      )}

      <div className="w-full flex flex-col lg:flex-row pt-[120px]">
        
        {/* SIDEBAR */}
        <aside className={`
          fixed top-0 left-0 h-full w-[85%] max-w-[320px] bg-white z-[60] overflow-y-auto transition-transform duration-300 ease-in-out
          lg:static lg:h-auto lg:w-[300px] xl:w-[320px] lg:z-10 lg:translate-x-0
          py-8 px-6 md:pl-8 lg:pl-10
          lg:rounded-r-2xl lg:shadow-[4px_0_24px_rgba(0,0,0,0.02)] lg:border lg:border-gray-200 lg:border-l-0
          ${isMobileFilterOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        `}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-gray-900 tracking-wide uppercase">Filters</h2>
            <button onClick={() => setIsMobileFilterOpen(false)} className="lg:hidden !bg-gray-100 hover:!bg-gray-200 !p-2 !rounded-full !border-none !text-gray-600 transition-colors cursor-pointer">
              <X className="w-5 h-5"/>
            </button>
          </div>

          <div className="mb-8">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Search Tournament</h3>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1abc60] transition-colors z-10" />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name or location..."
                className="!w-full !bg-white !border !border-gray-300 !text-gray-800 !text-sm !rounded-lg !pl-9 !pr-3 !py-2.5 !outline-none focus:!border-[#1abc60] focus:!ring-1 focus:!ring-[#1abc60] !transition-all !shadow-sm"
              />
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Max Entry Fee (₹)</h3>
            <div className="px-1">
              <div className="relative h-1.5 bg-gray-200 rounded-full mb-4">
                <div className="absolute h-full bg-[#1abc60] rounded-full" style={{ left: '0%', right: `${100 - (maxPrice / 10000) * 100}%` }} />
                <input 
                  type="range" 
                  min="500" 
                  max="10000" 
                  step="500" 
                  value={maxPrice} 
                  onChange={(e) => setMaxPrice(Number(e.target.value))} 
                  className="absolute w-full h-full opacity-0 cursor-pointer z-10" 
                />
                <div className="absolute top-1/2 -translate-y-1/2 h-4 w-4 bg-[#1abc60] rounded-full shadow-md pointer-events-none" style={{ left: `calc(${(maxPrice / 10000) * 100}% - 8px)` }} />
              </div>
              <div className="flex justify-between text-xs font-semibold text-gray-600">
                <span>₹500</span>
                <span>₹{maxPrice}</span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Sport Category</h3>
            <div className="flex flex-col gap-3">
              {["Cricket", "Football", "Padel", "Tennis"].map((sport) => (
                <label key={sport} className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="hidden" checked={selectedCategories.includes(sport)} onChange={() => toggleCategory(sport)} />
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedCategories.includes(sport) ? '!bg-[#1abc60] !border-[#1abc60]' : '!bg-white !border-gray-300'}`}>
                    {selectedCategories.includes(sport) && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{sport}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button onClick={clearFilters} className="text-sm font-semibold !text-gray-500 hover:!text-gray-900 transition-colors !bg-transparent !border-none cursor-pointer">
              Clear All
            </button>
            <button onClick={() => setIsMobileFilterOpen(false)} className="!bg-[#1abc60] hover:!bg-[#169c4e] transition-colors !text-white text-sm font-semibold px-5 py-2.5 rounded-lg !border-none shadow-sm cursor-pointer">
              Apply
            </button>
          </div>
        </aside>

        {/* MAIN LIST */}
        <main className="flex-1 px-4 md:px-8 lg:px-10 w-full pt-6 lg:pt-0">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">Active Tournaments</h1>
              <p className="text-gray-500 text-sm mt-1">Join the most competitive sports events in your city</p>
            </div>
            <div className="bg-white border border-gray-200 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg shadow-sm">
              {filteredTournaments.length} Tournament{filteredTournaments.length !== 1 ? 's' : ''} Found
            </div>
          </div>

          {filteredTournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTournaments.map((t) => (
                <Link key={t._id} href={`/tournament/${t._id}`} className="block group">
                  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden flex flex-col h-full shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className="relative h-[200px] w-full bg-gray-100">
                      <img src={getImageUrl(t.image || '')} alt={t.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-3 left-3">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm ${getStatusColor(t.status)}`}>
                          {t.status}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm text-gray-800 text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-[#1abc60]" /> {t.sport}
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-[17px] font-bold text-gray-900 mb-2 leading-tight group-hover:text-[#1abc60] transition-colors line-clamp-1">{t.title}</h3>
                      <div className="flex items-center text-gray-500 text-[12px] mb-4">
                        <MapPin className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                        <span className="line-clamp-1">{t.location.venue}, {t.location.city}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-5">
                        <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Start Date</p>
                          <div className="flex items-center gap-1.5 text-gray-700">
                            <Calendar className="w-3 h-3 text-[#1abc60]" />
                            <span className="text-[11px] font-bold">{new Date(t.startDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Entry Fee</p>
                          <div className="flex items-center gap-1.5 text-gray-700">
                            <span className="text-[11px] font-extrabold">₹{formatPrice(t.entryFee)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex flex-col">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Prize Pool</p>
                          <span className="text-[15px] font-black text-gray-900">₹{formatPrice(t.prizePool)}</span>
                        </div>
                        <button className="!bg-[#1abc60] hover:!bg-[#169c4e] text-white text-[12px] font-bold px-5 py-2 rounded-lg transition-all shadow-sm">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-white rounded-2xl border border-gray-100">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-gray-900 font-bold text-xl mb-2">No tournaments found</h3>
              <p className="text-gray-500 text-sm mb-6">Try adjusting your filters or search terms.</p>
              <button onClick={clearFilters} className="bg-[#1abc60] hover:bg-[#169c4e] text-white font-bold px-6 py-2.5 rounded-lg transition-colors">
                Clear all filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function TournamentsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#fafafb] pt-[120px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1abc60]" />
      </div>
    }>
      <TournamentContent />
    </Suspense>
  );
}