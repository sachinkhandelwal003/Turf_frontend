"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Star, ChevronDown, Loader2 } from 'lucide-react';
import api from '@/app/services/api';

export default function FeaturedVenues() {
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await api.get('/turfs');
        if (res.data.success) {
          // Filter only active venues and take top 3 for featured section
          const activeVenues = res.data.turfs
            .filter((t: any) => t.isActive)
            .slice(0, 3)
            .map((t: any) => ({
              id: t._id,
              name: t.name,
              location: `${t.location.landmark ? t.location.landmark + ', ' : ''}${t.location.city}`,
              price: `₹${t.pricePerHour}`,
              rating: t.rating || '4.5',
              img: t.images?.[0]?.startsWith('http') 
                ? t.images[0] 
                : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '')}${t.images?.[0] || '/Perreferred1.png'}`,
            }));
          setVenues(activeVenues);
        }
      } catch (error) {
        console.error("Failed to fetch featured venues:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVenues();
  }, []);

  if (loading) {
    return (
      <div className="py-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1abc60]" />
      </div>
    );
  }

  return (
    <section className="py-16 bg-gray-50/50">
      <div className="max-w-[1200px] mx-auto px-4">
        
        {/* --- Header Section --- */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">Featured Venues</h2>
            <p className="text-gray-500 text-[14px]">Curated selection of high-performance grounds.</p>
          </div>
          
          {/* Sort By Dropdown - Exactly like screenshot */}
          <button className="flex items-center gap-1 text-[#1abc60] text-[14px] font-medium hover:text-[#169c4e] transition-colors mt-2">
            Sort By <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* --- Cards Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {venues.map((venue) => (
            <div 
              key={venue.id} 
              className="bg-white rounded-[16px] overflow-hidden border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              {/* Image Container with Rating Badge */}
              <Link href={`/ground/${venue.id}`} className="relative h-[200px] w-full p-2.5 block">
                {/* Under image div for rounded corners specifically matching the design */}
                <div className="w-full h-full rounded-[12px] overflow-hidden relative">
                   <img 
                     src={venue.img} 
                     alt={venue.name} 
                     className="w-full h-full object-cover" 
                   />
                </div>
                
                {/* Rating Badge (Top Right) */}
                <div className="absolute top-5 right-5 bg-white px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <span className="text-[12px] font-bold text-gray-800">{venue.rating}</span>
                  {/* Fill prop use kiya hai solid star ke liye */}
                  <Star className="w-3 h-3 text-[#FFB800] fill-[#FFB800]" />
                </div>
              </Link>

              {/* Card Content */}
              <div className="p-5 pt-3 flex flex-col flex-1">
                <Link href={`/ground/${venue.id}`} className="block hover:text-[#1abc60] transition-colors">
                  <h3 className="font-bold text-[17px] text-gray-900 mb-1.5">{venue.name}</h3>
                </Link>
                
                <p className="text-gray-500 text-[13px] flex items-center gap-1.5 mb-6">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" /> 
                  {venue.location}
                </p>
                
                {/* Bottom Section: Price & Button */}
                <div className="flex items-center justify-between mt-auto">
                  <div className="text-gray-900 font-bold text-xl flex items-baseline gap-1">
                    {venue.price}
                    <span className="text-[12px] font-medium text-gray-400">/ HR</span>
                  </div>
                  
                  <Link href={`/ground/${venue.id}`} className="bg-[#1abc60] hover:bg-[#169c4e] !text-white px-5 py-2 rounded-lg text-[13px] font-medium transition-colors no-underline">
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}