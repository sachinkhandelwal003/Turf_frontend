"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link'; 
import { MapPin, Star, ChevronLeft, ChevronRight, Check } from 'lucide-react';

// --- Exact Mock Data based on Image ---
const INITIAL_VENUES = [
  { id: 1, title: "Elite Box Cricket Arena", location: "Koramangala, Bangalore", rating: 4.8, price: 1200, category: "Cricket", amenities: ["FLOODLIGHTS", "CHANGING ROOM", "PARKING"], image: "/Elitebox.png", featured: true },
  { id: 2, title: "Champions Football Hub", location: "Indiranagar, Bangalore", rating: 4.9, price: 1800, category: "Football", amenities: ["PRO TURF", "SHOWER", "CAFETERIA"], image: "/hub.png", featured: false },
  { id: 3, title: "Velocity Padel & Sports", location: "Whitefield, Bangalore", rating: 4.7, price: 1500, category: "Badminton", amenities: ["AIR CONDITIONED", "EQUIPMENT HIRE"], image: "/velocity.png", featured: false },
  { id: 4, title: "Grand Slam Tennis Club", location: "Jayanagar, Bangalore", rating: 4.5, price: 800, category: "Tennis", amenities: ["CLAY COURTS", "BALL MACHINE"], image: "/grand.png", featured: false },
  { id: 5, title: "SvHigh Basketball Park", location: "MG Road, Bangalore", rating: 4.6, price: 1000, category: "Basketball", amenities: ["ROOFTOP", "NIGHT LIGHTS"], image: "/svhigh.png", featured: false },
  { id: 6, title: "Ace Padel Club", location: "Sarjapur, Bangalore", rating: 4.8, price: 2200, category: "Badminton", amenities: ["PANORAMIC GLASS", "COACHING"], image: "/ace.jpg", featured: false }
];

export default function GroundPage() {
  // --- States for Filtering ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(5000);

  // --- Filter Logic ---
  const filteredVenues = useMemo(() => {
    return INITIAL_VENUES.filter((venue) => {
      const matchesSearch = venue.location.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            venue.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(venue.category);
      const matchesRating = venue.rating >= minRating;
      const matchesPrice = venue.price <= maxPrice;
      
      return matchesSearch && matchesCategory && matchesRating && matchesPrice;
    });
  }, [searchQuery, selectedCategories, minRating, maxPrice]);

  // --- Handlers ---
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
  };

  return (
    <div className="min-h-screen bg-white pb-20 font-sans">
      <div className="max-w-[1300px] mx-auto px-4 md:px-6 flex flex-col lg:flex-row gap-10 pt-10">
        
        {/* ================= SIDEBAR: FILTERS ================= */}
        <aside className="w-full lg:w-[280px] flex-shrink-0 self-start lg:sticky lg:top-10">
          <h2 className="text-[18px] font-bold text-gray-800 tracking-wide uppercase mb-8">Filters</h2>

          {/* Location */}
          <div className="mb-8">
            <h3 className="text-[11px] font-extrabold text-gray-800 uppercase tracking-wider mb-3">Location</h3>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search area or landmark..."
                className="w-full bg-gray-50/50 border border-gray-200 text-[13px] rounded-lg pl-9 pr-3 py-2.5 outline-none focus:border-[#5C039B] transition-all"
              />
            </div>
          </div>

          {/* Price Slider */}
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

          {/* Sport Category */}
          <div className="mb-8">
            <h3 className="text-[11px] font-extrabold text-gray-800 uppercase tracking-wider mb-4">Sport Category</h3>
            <div className="flex flex-col gap-3">
              {/* FIX: Basketball add kiya gaya hai data se match karne ke liye */}
              {["Football", "Cricket", "Tennis", "Badminton", "Basketball"].map((sport) => (
                <label key={sport} className="flex items-center gap-3 cursor-pointer group">
                  {/* FIX: Hidden input add kiya jisse click par state update ho */}
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

         {/* Minimum Rating */}
          <div className="mb-6">
            <h3 className="text-[11px] font-extrabold text-gray-800 uppercase tracking-wider mb-4">Minimum Rating</h3>
            <div className="flex gap-2">
              {[4.0, 4.5, 4.8].map((rating) => (
                <button 
                  key={rating}
                  onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                  className={`flex-1 py-2 text-[13px] font-bold rounded-xl border border-solid transition-all !shadow-none m-0 ${
                    minRating === rating 
                      ? '!border-[#1abc60] !text-[#1abc60] !bg-[#e8f8ef]' 
                      : '!border-gray-200 !text-gray-700 !bg-white hover:!border-gray-300 hover:!bg-gray-50'
                  }`}
                >
                  {rating.toFixed(1)}+
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
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

        {/* ================= MAIN CONTENT: GRID ================= */}
        <main className="flex-1">
          <h1 className="text-[28px] font-bold text-gray-800 tracking-tight mb-8">
            Available Grounds
          </h1>

          {filteredVenues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredVenues.map((venue) => (
                <Link 
                  href={`/ground/${venue.id}`} 
                  key={venue.id} 
                  className="block group" 
                >
                  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
                    {/* Image Area */}
                    <div className="relative h-[200px] w-full bg-gray-100 overflow-hidden">
                      <img src={venue.image} alt={venue.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                        {venue.featured ? (
                           <span className="bg-[#1abc60] text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Featured</span>
                        ) : <div />}
                        <div className="bg-white text-gray-800 text-[11px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                          {venue.rating} <Star className="w-3 h-3 fill-[#FFB800] text-[#FFB800]" />
                        </div>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-[16px] font-bold text-gray-900 mb-1 leading-tight group-hover:text-[#1abc60] transition-colors">{venue.title}</h3>
                      <div className="flex items-center text-gray-500 text-[12px] mb-4">
                        <MapPin className="w-3.5 h-3.5 mr-1" /> {venue.location}
                      </div>
                      
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {venue.amenities.map(a => (
                          <span key={a} className="bg-gray-100 text-gray-600 text-[9px] font-bold px-2 py-1 rounded uppercase">{a}</span>
                        ))}
                      </div>
                      
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-[20px] font-bold text-gray-900">₹{venue.price}</span>
                          <span className="text-[11px] text-gray-500 font-semibold">/HR</span>
                        </div>
                        <button type="button" className="bg-[#5C039B] hover:bg-[#4a027d] text-white text-[13px] font-bold px-5 py-2.5 rounded-lg transition-colors pointer-events-none">
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <h3 className="text-gray-900 font-bold text-xl mb-2">No grounds found</h3>
              <p className="text-gray-500 text-sm">Try adjusting your filters.</p>
            </div>
          )}

          {/* Dynamic Pagination */}
          {filteredVenues.length > 0 && (
            <div className="mt-14 flex justify-center items-center gap-3">
              {/* Prev Button */}
              <button className="!bg-transparent !border-none !p-1 !text-gray-600 hover:!text-gray-900 !shadow-none cursor-pointer flex items-center justify-center disabled:opacity-30">
                <ChevronLeft className="w-4 h-4" strokeWidth={3} />
              </button>
              
              {/* Dynamic Page Numbers */}
              {[...Array(Math.ceil(filteredVenues.length / 6))].map((_, index) => {
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
              
              {/* Next Button */}
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