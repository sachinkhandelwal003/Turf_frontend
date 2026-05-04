"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link'; 
import { MapPin, Star, ChevronLeft, ChevronRight, Check, Filter, X, Loader2 } from 'lucide-react';
import api from '@/app/services/api';

export default function GroundPage() {
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- States for Filtering ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  
  // FIX: Mobile Filter Drawer State
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await api.get('/turfs');
        if (res.data.success) {
          // Show all venues but prioritize active ones in mapping
          const mappedVenues = res.data.turfs
            .map((t: any) => ({
              id: t._id,
              title: t.name,
              location: `${t.location.landmark ? t.location.landmark + ', ' : ''}${t.location.city}`,
              rating: t.rating || 4.5,
              price: t.pricePerHour,
              category: t.sports?.[0] || 'Sports',
              isActive: t.isActive,
              amenities: t.amenities?.map((a: any) => {
                const name = typeof a === 'string' ? a : (a?.name || 'Amenity');
                return name.toUpperCase();
              }) || [],
              image: t.images && t.images.length > 0 
                ? (t.images[0].startsWith('http') 
                    ? t.images[0] 
                    : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '')}${t.images[0]}`)
                : '/Perreferred1.png',
              featured: t.isFeatured || false
            }));
          setVenues(mappedVenues);
        }
      } catch (error) {
        console.error("Failed to fetch grounds:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVenues();
  }, []);

  // --- Filter Logic ---
  const filteredVenues = useMemo(() => {
    return venues.filter((venue) => {
      const matchesSearch = venue.location.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            venue.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(venue.category);
      const matchesRating = venue.rating >= minRating;
      const matchesPrice = venue.price <= maxPrice;
      
      // If user wants to see all, we don't filter by isActive here
      // But usually we only show active ones on public site.
      // Given the user complaint, let's show all for now or check if isActive is the culprit.
      return matchesSearch && matchesCategory && matchesRating && matchesPrice;
    });
  }, [venues, searchQuery, selectedCategories, minRating, maxPrice]);

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
    <div className="min-h-screen bg-[#fafafb] pb-20 font-sans relative">
      
      {/* ================= MOBILE FLOATING BUTTON (FAB) ================= */}
      <button 
        onClick={() => setIsMobileFilterOpen(true)}
        className="lg:hidden fixed bottom-8 left-6 z-[40] !bg-[#1abc60] !text-white !p-4 !rounded-full shadow-[0_8px_30px_rgba(92,3,155,0.4)] !border-none flex items-center justify-center active:scale-95 transition-transform"
      >
        <Filter className="w-6 h-6" />
      </button>

      {/* ================= MOBILE BACKDROP OVERLAY ================= */}
      {isMobileFilterOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[50] lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileFilterOpen(false)}
        />
      )}

      {/* Main Container - Left edge se start hoga w-full ke sath */}
      <div className="w-full flex flex-col lg:flex-row pt-[120px]">
        
        {/* ================= SIDEBAR ================= */}
        <aside 
          className={`
            fixed top-0 left-0 h-full w-[85%] max-w-[320px] bg-white z-[60] overflow-y-auto transition-transform duration-300 ease-in-out
            lg:static lg:h-auto lg:w-[300px] xl:w-[320px] lg:z-10 lg:translate-x-0
            py-8 px-6 md:pl-8 lg:pl-10
            lg:rounded-r-[24px] lg:shadow-[4px_0_24px_rgba(0,0,0,0.02)] lg:border lg:border-gray-100 lg:border-l-0
            ${isMobileFilterOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
          `}
        >
          {/* Header with Mobile Close Button */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[18px] font-bold text-gray-800 tracking-wide uppercase">Filters</h2>
            <button 
              onClick={() => setIsMobileFilterOpen(false)}
              className="lg:hidden !bg-gray-100 hover:!bg-gray-200 !p-2 !rounded-full !border-none !text-gray-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

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
                <span>₹500 <span className="text-[10px] text-gray-500 font-semibold uppercase">/HR</span></span>
                <span>₹{maxPrice} <span className="text-[10px] text-gray-500 font-semibold uppercase">/HR</span></span>
              </div>
            </div>
          </div>

          {/* Sport Category */}
          <div className="mb-8">
            <h3 className="text-[11px] font-extrabold text-gray-800 uppercase tracking-wider mb-4">Sport Category</h3>
            <div className="flex flex-col gap-3">
              {["Football", "Cricket", "Tennis", "Badminton", "Basketball"].map((sport) => (
                <label key={sport} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox"
                    className="hidden"
                    checked={selectedCategories.includes(sport)}
                    onChange={() => toggleCategory(sport)}
                  />
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedCategories.includes(sport) ? 'bg-[#5C039B] border-[#5C039B]' : 'bg-white border-gray-300'}`}>
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
            <button 
              onClick={() => setIsMobileFilterOpen(false)} // Mobile drawer close 
              className="!bg-[#1abc60] hover:!bg-[#169c4e] !text-white text-[13px] font-bold uppercase px-6 py-2.5 rounded-xl transition-colors tracking-wide !border-none !shadow-sm cursor-pointer !m-0"
            >
              Apply
            </button>
          </div>
        </aside>

        {/* ================= MAIN CONTENT ================= */}
        {/* Main Content ki apni alag padding */}
        <main className="flex-1 px-4 md:px-8 lg:px-10 lg:pl-10 w-full pt-6 lg:pt-0">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-[28px] font-bold text-gray-800 tracking-tight">
              Available Venues
            </h1>
            <span className="bg-white border border-gray-200 text-gray-600 text-[13px] font-bold px-4 py-2 rounded-lg shadow-sm w-fit">
              {filteredVenues.length} Venues Found
            </span>
          </div>

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
                        {venue.amenities.map((a: string) => (
                          <span key={a} className="bg-gray-100 text-gray-600 text-[9px] font-bold px-2 py-1 rounded uppercase">{a}</span>
                        ))}
                      </div>
                      
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-[20px] font-bold text-gray-900">₹{venue.price}</span>
                          <span className="text-[11px] text-gray-500 font-semibold uppercase">/HR</span>
                        </div>
                        <button type="button" className="bg-[#1abc60] hover:bg-[#169c4e] text-white text-[13px] font-bold px-5 py-2.5 rounded-lg transition-colors pointer-events-none">
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
              <h3 className="text-gray-900 font-bold text-xl mb-2">No venues found</h3>
              <p className="text-gray-500 text-sm">Try adjusting your filters.</p>
            </div>
          )}

          {/* Dynamic Pagination */}
          {filteredVenues.length > 0 && (
            <div className="mt-14 flex justify-center items-center gap-3">
              <button className="!bg-transparent !border-none !p-1 !text-gray-600 hover:!text-gray-900 !shadow-none cursor-pointer flex items-center justify-center disabled:opacity-30">
                <ChevronLeft className="w-4 h-4" strokeWidth={3} />
              </button>
              
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