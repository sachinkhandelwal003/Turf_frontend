"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { MapPin, Check, Calendar, Clock, Activity, Filter, X, Loader2, Search } from 'lucide-react';
import api from '@/app/services/api';
import { toast } from 'sonner';

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

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

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
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.rkinteriorstudio.in/api';
    const baseUrl = apiUrl.replace(/\/api$/, '').replace(/\/$/, '');
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
            <button onClick={clearFilters} className="text-sm font-semibold !text-gray-500 hover:!text-gray-900 transition-colors !bg-transparent !border-none cursor-pointer !p-0">Clear All</button>
            <button onClick={() => setIsMobileFilterOpen(false)} className="!bg-[#1abc60] hover:!bg-[#169c4e] transition-colors !text-white text-sm font-semibold px-5 py-2.5 rounded-lg !border-none shadow-sm cursor-pointer">Apply</button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 px-4 md:px-8 lg:px-10 lg:pl-10 w-full pt-6 lg:pt-0">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Upcoming Tournaments</h1>
            <span className="bg-white border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg shadow-sm w-fit">
              {filteredTournaments.length} Results Found
            </span>
          </div>

          {filteredTournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTournaments.map((t) => {
                const now = new Date();
                const deadline = new Date(t.registrationDeadline);
                const isFull = t.registeredTeams?.length >= (t.maxTeams || 16);
                const terminalStatuses = ['finished', 'completed', 'cancelled', 'postponed'];
                const isDisabled = now > deadline || isFull || terminalStatuses.includes(t.status?.toLowerCase());

                return (
                  <Link href={`/tournament/${t._id}`} key={t._id} className="block group !no-underline">
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col h-full shadow-sm hover:shadow-md transition-shadow duration-300">
                      
                      {/* Image container */}
                      <div className="relative h-[200px] w-full overflow-hidden bg-gray-100">
                        <img 
                          src={getImageUrl(t.image || "")} 
                          alt={t.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          <div className="bg-white text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm border border-gray-100">
                            <Activity className="w-3.5 h-3.5 text-[#1abc60]" /> {t.sport}
                          </div>
                          <div className={`${getStatusColor(t.status)} text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm border border-black/5 inline-block w-fit capitalize`}>
                            {t.status}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-[#1abc60] transition-colors line-clamp-2">{t.title}</h3>
                        <div className="flex items-start text-gray-500 text-sm mb-4 font-medium">
                          <MapPin className="w-4 h-4 mr-1.5 mt-0.5 flex-shrink-0 text-gray-400" /> 
                          <span className="line-clamp-2">{t.location.venue}, {t.location.city}</span>
                        </div>
                        
                        <div className="flex flex-col mb-4">
                          <p className="text-xs text-gray-500 font-semibold uppercase mb-0.5">Entry Fee</p>
                          <p className="text-xl font-bold text-gray-900">₹{formatPrice(t.entryFee)}</p>
                        </div>

                        <div className="h-[1px] w-full bg-gray-100 mb-4" />

                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center text-gray-600 text-sm font-medium">
                            <Calendar className="w-4 h-4 mr-1.5 text-gray-400" /> 
                            {new Date(t.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                          <div className="flex items-center text-gray-600 text-sm font-medium">
                            <Clock className="w-4 h-4 mr-1.5 text-gray-400" /> TBA
                          </div>
                        </div>
                        
                        <div className="mt-auto">
                          <button 
                            disabled={isDisabled}
                            className={`!w-full !text-sm !font-semibold !uppercase !py-2.5 !rounded-lg !border-none !transition-all shadow-sm active:scale-95 ${
                              isDisabled
                                ? '!bg-gray-100 !text-gray-400 !cursor-not-allowed !shadow-none'
                                : '!bg-[#1abc60] hover:!bg-[#169c4e] !text-white'
                            }`}
                          >
                            {(() => {
                              if (t.status?.toLowerCase() === 'cancelled') return "Cancelled";
                              if (t.status?.toLowerCase() === 'postponed') return "Postponed";
                              if (t.status?.toLowerCase() === 'finished' || t.status?.toLowerCase() === 'completed') return "Finished";
                              if (isFull) return "Full";
                              if (now > deadline) return "Registration Closed";
                              return "Register Now";
                            })()}
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <h3 className="text-gray-900 font-bold text-xl mb-2">No Tournaments Found</h3>
              <p className="text-gray-500 text-sm mb-6">Try adjusting your category or price filters.</p>
              <button 
                onClick={clearFilters} 
                className="!bg-[#1abc60] hover:!bg-[#169c4e] transition-colors !text-white px-6 py-2.5 rounded-lg text-sm font-semibold !border-none cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}