"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Check, Calendar, Clock, Activity, Filter, X, Loader2 } from 'lucide-react';
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
      case 'upcoming': return 'bg-[#1abc60]';
      case 'ongoing': return 'bg-blue-500';
      case 'postponed': return 'bg-orange-500';
      case 'cancelled': return 'bg-red-500';
      case 'finished':
      case 'completed': return 'bg-gray-500';
      default: return 'bg-[#1abc60]';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafb] pt-[120px]">
        <Loader2 className="w-12 h-12 animate-spin text-[#1abc60]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafb] pb-20 font-sans relative">
      
      {/* MOBILE FAB */}
      <button 
        onClick={() => setIsMobileFilterOpen(true)}
        className="lg:hidden fixed bottom-8 left-6 z-[40] !bg-[#1abc60] !text-white !p-4 !rounded-full shadow-lg !border-none flex items-center justify-center active:scale-95 transition-transform"
      >
        <Filter className="w-6 h-6" />
      </button>

      {isMobileFilterOpen && (
        <div className="fixed inset-0 bg-black/50 z-[50] lg:hidden backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)} />
      )}

      <div className="w-full flex flex-col lg:flex-row pt-[120px]">
        
        {/* SIDEBAR */}
        <aside className={`
          fixed top-0 left-0 h-full w-[85%] max-w-[320px] bg-white z-[60] overflow-y-auto transition-transform duration-300
          lg:static lg:h-auto lg:w-[300px] xl:w-[320px] lg:z-10 lg:translate-x-0
          py-8 px-6 md:pl-8 lg:pl-10
          lg:rounded-r-[24px] lg:shadow-sm lg:border lg:border-gray-100 lg:border-l-0
          ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[18px] font-bold text-gray-800 tracking-wide uppercase">Filters</h2>
            <button onClick={() => setIsMobileFilterOpen(false)} className="lg:hidden !bg-gray-100 !p-2 !rounded-full !border-none"><X className="w-5 h-5"/></button>
          </div>

          <div className="mb-8">
            <h3 className="text-[11px] font-extrabold text-gray-800 uppercase tracking-wider mb-3">Location</h3>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1abc60]" />
              <input 
                type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search area..."
                className="w-full bg-gray-50 border border-gray-200 text-[13px] rounded-lg pl-9 pr-3 py-3 outline-none focus:border-[#1abc60]"
              />
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-[11px] font-extrabold text-gray-800 uppercase tracking-wider mb-4">Max Entry Fee (₹)</h3>
            <div className="px-1">
              <div className="relative h-1.5 bg-gray-200 rounded-full mb-4">
                <div className="absolute h-full bg-[#1abc60] rounded-full" style={{ left: '0%', right: `${100 - (maxPrice / 10000) * 100}%` }} />
                <input type="range" min="500" max="10000" step="500" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="absolute w-full h-full opacity-0 cursor-pointer z-10" />
                <div className="absolute top-1/2 -translate-y-1/2 h-4 w-4 bg-[#1abc60] rounded-full shadow-md pointer-events-none" style={{ left: `calc(${(maxPrice / 10000) * 100}% - 8px)` }} />
              </div>
              <div className="flex justify-between text-[12px] font-bold text-gray-800">
                <span>₹500</span>
                <span>₹{maxPrice}</span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-[11px] font-extrabold text-gray-800 uppercase tracking-wider mb-4">Sport Category</h3>
            <div className="flex flex-col gap-3.5">
              {["Cricket", "Football", "Padel", "Tennis"].map((sport) => (
                <label key={sport} className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="hidden" checked={selectedCategories.includes(sport)} onChange={() => toggleCategory(sport)} />
                  <div className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center transition-all ${selectedCategories.includes(sport) ? 'bg-[#1abc60] border-[#1abc60]' : 'bg-white border-gray-300'}`}>
                    {selectedCategories.includes(sport) && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-[13px] font-bold text-gray-700 group-hover:text-black">{sport}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
            <button onClick={clearFilters} className="text-[12px] font-extrabold !text-gray-500 uppercase !bg-transparent !border-none cursor-pointer">Clear All</button>
            <button onClick={() => setIsMobileFilterOpen(false)} className="!bg-[#1abc60] !text-white text-[12px] font-extrabold uppercase px-6 py-3 rounded-lg !border-none">Apply</button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 px-4 md:px-8 lg:px-10 lg:pl-10 w-full pt-6 lg:pt-0">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-[32px] font-extrabold text-[#111111] tracking-tight">Upcoming Tournaments</h1>
            <span className="bg-white border border-gray-200 text-gray-600 text-[13px] font-bold px-4 py-2 rounded-lg shadow-sm">
              {filteredTournaments.length} Results Found
            </span>
          </div>

          {filteredTournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredTournaments.map((t) => (
                <Link href={`/tournament/${t._id}`} key={t._id} className="block group !no-underline">
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col h-full shadow-sm hover:shadow-xl transition-all duration-300">
                    
                    <div className="relative h-[240px] w-full overflow-hidden">
                      <img 
                        src={getImageUrl(t.image || "")} 
                        alt={t.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <div className="bg-white/95 backdrop-blur-sm text-[#1abc60] text-[11px] font-extrabold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm uppercase">
                          <Activity className="w-3.5 h-3.5" /> {t.sport}
                        </div>
                        <div className={`${getStatusColor(t.status)} text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm inline-block w-fit`}>
                          {t.status}
                        </div>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-[19px] font-extrabold text-[#2d2d2d] mb-2 leading-tight group-hover:text-[#1abc60] transition-colors">{t.title}</h3>
                      <div className="flex items-center text-gray-500 text-[13px] mb-6 font-medium italic">
                        <MapPin className="w-4 h-4 mr-1.5 text-[#1abc60]" /> {t.location.venue}, {t.location.city}
                      </div>
                      
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <p className="text-[10px] text-gray-400 font-extrabold uppercase mb-1">Entry Fee</p>
                          <p className="text-[22px] font-black text-[#333333]">₹{formatPrice(t.entryFee)}</p>
                        </div>
                      </div>

                      <div className="h-[1px] w-full bg-gray-100 mb-6" />

                      <div className="flex items-center gap-6 mb-8">
                        <div className="flex items-center text-gray-600 text-[13px] font-bold">
                          <Calendar className="w-4 h-4 mr-1.5 text-[#1abc60]" /> 
                          {new Date(t.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(t.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex items-center text-gray-600 text-[13px] font-bold"><Clock className="w-4 h-4 mr-1.5 text-[#1abc60]" /> TBA</div>
                      </div>
                      
                      <button 
                        disabled={(() => {
                          const now = new Date();
                          const deadline = new Date(t.registrationDeadline);
                          const isFull = t.registeredTeams?.length >= (t.maxTeams || 16);
                          const terminalStatuses = ['finished', 'completed', 'cancelled', 'postponed'];
                          return now > deadline || isFull || terminalStatuses.includes(t.status?.toLowerCase());
                        })()}
                        className={`w-full text-[14px] font-extrabold uppercase py-4 rounded-xl !border-none transition-all shadow-md active:scale-95 ${
                          (() => {
                            const now = new Date();
                            const deadline = new Date(t.registrationDeadline);
                            const isFull = t.registeredTeams?.length >= (t.maxTeams || 16);
                            const terminalStatuses = ['finished', 'completed', 'cancelled', 'postponed'];
                            return now > deadline || isFull || terminalStatuses.includes(t.status?.toLowerCase());
                          })()
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                            : '!bg-[#1abc60] hover:!bg-[#169c4e] !text-white'
                        }`}
                      >
                        {(() => {
                          const now = new Date();
                          const deadline = new Date(t.registrationDeadline);
                          const isFull = t.registeredTeams?.length >= (t.maxTeams || 16);
                          if (t.status?.toLowerCase() === 'cancelled') return "Cancelled";
                          if (t.status?.toLowerCase() === 'postponed') return "Postponed";
                          if (t.status?.toLowerCase() === 'finished' || t.status?.toLowerCase() === 'completed') return "Finished";
                          if (isFull) return "Full";
                          if (now > deadline) return "Closed";
                          return "REGISTER NOW";
                        })()}
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center bg-white rounded-2xl border border-dashed border-gray-200">
              <h3 className="text-gray-900 font-extrabold text-2xl mb-2">No Tournaments Found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your category or price filters.</p>
              <button onClick={clearFilters} className="!bg-[#1abc60] !text-white px-8 py-3 rounded-xl font-bold !border-none">Reset Filters</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}