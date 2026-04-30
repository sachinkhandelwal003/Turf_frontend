"use client";

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { MapPin, ChevronLeft, ChevronRight, Check, Calendar, Clock, Activity } from 'lucide-react';

// --- Exact Mock Data for Tournaments ---
const TOURNAMENTS = [
  { 
    id: 1, 
    title: "Summer Cricket Cup", 
    location: "Indiranagar, Bangalore", 
    sport: "CRICKET", 
    prizePool: "5,00,000", 
    entryFee: "2,500", 
    date: "Aug 15 - 20",
    time: "09:00 AM",
    image: "/Elitebox.png" 
  },
  { 
    id: 2, 
    title: "Padel Pro League", 
    location: "Koramangala, Bangalore", 
    sport: "PADEL", 
    prizePool: "1,00,000", 
    entryFee: "8,000", 
    date: "Aug 15 - 20",
    time: "09:00 AM",
    image: "/velocity.png" 
  },
  { 
    id: 3, 
    title: "Weekend Football Fiesta", 
    location: "Whitefield, Bangalore", 
    sport: "FOOTBALL", 
    prizePool: "2,50,000", 
    entryFee: "5,000", 
    date: "Sep 01 - 05",
    time: "04:00 PM",
    image: "/hub.png" 
  },
  { 
    id: 4, 
    title: "Elite Tennis Championship", 
    location: "Jayanagar, Bangalore", 
    sport: "TENNIS", 
    prizePool: "3,00,000", 
    entryFee: "6,500", 
    date: "Sep 10 - 12",
    time: "08:00 AM",
    image: "/grand.png" 
  }
];

// YAHAN DHYAN Dena - Ye line ekdum perfect honi chahiye
export default function TournamentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(5000);

  const filteredTournaments = useMemo(() => {
    return TOURNAMENTS.filter((tournament) => {
      const matchesSearch = tournament.location.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            tournament.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      const tSport = tournament.sport.charAt(0).toUpperCase() + tournament.sport.slice(1).toLowerCase();
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(tSport) || (tSport === "Padel" && selectedCategories.includes("Badminton")); 
      
      const feeNum = parseInt(tournament.entryFee.replace(/,/g, ''));
      const matchesPrice = feeNum <= (maxPrice * 2); 
      
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [searchQuery, selectedCategories, maxPrice]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setMaxPrice(5000);
  };

  return (
    <div className="min-h-screen bg-white pb-20 font-sans">
      <div className="max-w-[1300px] mx-auto px-4 md:px-6 flex flex-col lg:flex-row gap-10 pt-10">
        
        {/* ================= SIDEBAR ================= */}
        <aside className="w-full lg:w-[280px] flex-shrink-0 self-start lg:sticky lg:top-10">
          <h2 className="text-[18px] font-bold text-gray-800 tracking-wide uppercase mb-8">Filters</h2>

          <div className="mb-8">
            <h3 className="text-[11px] font-extrabold text-gray-800 uppercase tracking-wider mb-3">Location</h3>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1abc60]" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search area or landmark..."
                className="w-full bg-gray-50/50 border border-gray-200 text-[13px] rounded-lg pl-9 pr-3 py-2.5 outline-none focus:border-[#1abc60] transition-all"
              />
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-[11px] font-extrabold text-gray-800 uppercase tracking-wider mb-4">Price Per Hour</h3>
            <div className="px-1">
              <div className="relative h-1.5 bg-gray-200 rounded-full mb-3">
                <div className="absolute h-full bg-[#1abc60] rounded-full" style={{ left: '0%', right: `${100 - (maxPrice / 5000) * 100}%` }} />
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
              <div className="flex justify-between items-center text-[12px] font-bold text-gray-800">
                <span>₹500 <span className="text-[10px] text-gray-500 font-semibold">/HR</span></span>
                <span>₹{maxPrice} <span className="text-[10px] text-gray-500 font-semibold">/HR</span></span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-[11px] font-extrabold text-gray-800 uppercase tracking-wider mb-4">Sport Category</h3>
            <div className="flex flex-col gap-3">
              {["Football", "Cricket", "Tennis", "Badminton"].map((sport) => (
                <label key={sport} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox"
                    className="hidden"
                    checked={selectedCategories.includes(sport)}
                    onChange={() => toggleCategory(sport)}
                  />
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedCategories.includes(sport) ? 'bg-[#1abc60] border-[#1abc60]' : 'bg-white border-gray-300'}`}>
                    {selectedCategories.includes(sport) && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-[13px] font-medium text-gray-700">
                    {sport}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-2">
            <button 
              onClick={clearFilters}
              className="text-[12px] font-extrabold !text-gray-600 uppercase tracking-wider hover:!text-gray-900 transition-colors !bg-transparent !border-none !p-0 !m-0 !shadow-none cursor-pointer"
            >
              Clear All
            </button>
            <button className="!bg-[#1abc60] hover:!bg-[#169c4e] !text-white text-[13px] font-bold uppercase px-6 py-2.5 rounded-xl transition-colors tracking-wide !border-none !shadow-sm cursor-pointer !m-0">
              Apply Filters
            </button>
          </div>
        </aside>

        {/* ================= MAIN CONTENT ================= */}
        <main className="flex-1">
          <h1 className="text-[32px] font-bold text-gray-800 tracking-tight mb-8">
            Tournaments
          </h1>

          {filteredTournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredTournaments.map((tournament) => (
                <div key={tournament.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col group shadow-sm hover:shadow-md transition-shadow">
                  
                  <div className="relative h-[240px] w-full bg-gray-100 overflow-hidden">
                    <Image 
                      src={tournament.image} 
                      alt={tournament.title} 
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute top-4 left-4 z-10">
                      <div className="bg-white text-[#1abc60] text-[11px] font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm tracking-wider uppercase">
                        <Activity className="w-3.5 h-3.5" /> {tournament.sport}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-[20px] font-bold text-[#333333] mb-2 leading-tight">{tournament.title}</h3>
                    <div className="flex items-center text-gray-500 text-[13px] mb-6 font-medium">
                      <MapPin className="w-4 h-4 mr-1 text-gray-400" strokeWidth={2.5} /> {tournament.location}
                    </div>
                    
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1">Prize Pool</p>
                        <p className="text-[22px] font-extrabold text-[#1abc60]">₹{tournament.prizePool}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1">Entry Fee</p>
                        <p className="text-[22px] font-extrabold text-[#333333]">₹{tournament.entryFee}</p>
                      </div>
                    </div>

                    <div className="h-[1px] w-full bg-gray-100 mb-5" />

                    <div className="flex items-center gap-6 mb-6">
                      <div className="flex items-center text-gray-600 text-[13px] font-medium">
                        <Calendar className="w-4 h-4 mr-2 text-[#1abc60]" /> {tournament.date}
                      </div>
                      <div className="flex items-center text-gray-600 text-[13px] font-medium">
                        <Clock className="w-4 h-4 mr-2 text-[#1abc60]" /> {tournament.time}
                      </div>
                    </div>
                    
                    <button className="w-full !bg-[#1abc60] hover:!bg-[#169c4e] !text-white text-[14px] font-bold uppercase tracking-wider py-3.5 !rounded-xl transition-all !border-none !shadow-sm cursor-pointer !m-0 mt-auto">
                      REGISTER NOW
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <h3 className="text-gray-900 font-bold text-xl mb-2">No tournaments found</h3>
              <p className="text-gray-500 text-sm">Try adjusting your filters.</p>
            </div>
          )}

          {filteredTournaments.length > 0 && (
            <div className="mt-14 flex justify-center items-center gap-3">
              <button className="!bg-transparent !border-none !p-1 !text-gray-600 hover:!text-gray-900 !shadow-none cursor-pointer flex items-center justify-center disabled:opacity-30">
                <ChevronLeft className="w-4 h-4" strokeWidth={3} />
              </button>
              
              {[...Array(Math.ceil(filteredTournaments.length / 4))].map((_, index) => {
                const page = index + 1;
                const isActive = page === 1; 
                
                return (
                  <button 
                    key={page}
                    className={`w-8 h-8 flex items-center justify-center text-[14px] font-bold rounded-md !border-none !m-0 cursor-pointer transition-all ${
                      isActive 
                        ? '!text-white !bg-[#1abc60] !shadow-sm' 
                        : '!text-gray-700 hover:!text-gray-900 !bg-transparent !shadow-none'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button className="!bg-transparent !border-none !p-1 !text-gray-600 hover:!text-gray-900 !shadow-none cursor-pointer flex items-center justify-center disabled:opacity-30">
                <ChevronRight className="w-4 h-4" strokeWidth={3} />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}