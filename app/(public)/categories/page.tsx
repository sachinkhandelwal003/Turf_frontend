"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Search } from 'lucide-react';
import api from '@/app/services/api';

interface Sport {
  _id: string;
  name: string;
  image?: string;
}

export default function CategoriesPage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const res = await api.get('/masters');
        if (res.data.success) {
          const sportsData = res.data.masters
            .filter((m: any) => m.category === 'sport')
            .map((m: any) => ({
              _id: m._id,
              name: m.name,
              image: m.image ? (m.image.startsWith('http') ? m.image : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '')}${m.image}`) : '/Cricket.png'
            }));
          setSports(sportsData);
        }
      } catch (error) {
        console.error('Failed to fetch sports:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSports();
  }, []);

  const filteredSports = sports.filter(sport => 
    sport.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="!min-h-screen !bg-[#f8fafc] !pt-28 !pb-24 !font-sans">
      <div className="!max-w-7xl !mx-auto !px-4 sm:!px-6 lg:!px-8">
        
        {/* Header Section */}
        <div className="!flex !flex-col !gap-6 !mb-12">
          <Link 
            href="/" 
            className="!group !flex !items-center !gap-2 !w-fit !text-gray-500 hover:!text-[#1abc60] !transition-colors !text-[13px] !font-bold !uppercase !tracking-wider !no-underline"
          >
            <ArrowLeft className="!w-4 !h-4 group-hover:!-translate-x-1 !transition-transform" /> Back
          </Link>

          <div className="!flex !flex-col lg:!flex-row lg:!items-end !justify-between !gap-6">
            <div className="!max-w-2xl">
              <h1 className="!text-3xl md:!text-4xl lg:!text-5xl !font-bold !text-gray-900 !tracking-tight !m-0 !mb-4">
                Discover Your <span className="!text-[#1abc60] !relative !inline-block">Perfect Game
                <div className="!absolute !-bottom-1.5 !left-0 !w-full !h-1.5 !bg-[#1abc60]/20 !rounded-full"></div></span>
              </h1>
              <p className="!text-sm md:!text-base !text-gray-500 !font-medium !m-0 !leading-relaxed">
                Choose from our wide range of professional sports facilities and start your match today.
              </p>
            </div>

            {/* Search Bar */}
            <div className="!relative !w-full lg:!w-[400px]">
              <div className="!relative !bg-white !border !border-gray-200 !p-1.5 !rounded-2xl !shadow-sm focus-within:!shadow-md focus-within:!border-[#1abc60]/50 !transition-all !flex !items-center">
                <div className="!w-10 !h-10 !flex !items-center !justify-center !text-gray-400 !shrink-0">
                  <Search className="!w-5 !h-5" />
                </div>
                <input 
                  type="text"
                  placeholder="Find a sport (e.g. Football)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="!flex-1 !bg-transparent !border-none !text-gray-900 !font-semibold placeholder:!text-gray-400 focus:!outline-none !text-[15px] !pr-4 !w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="!flex !flex-col !items-center !justify-center !py-32 !gap-4">
            <Loader2 className="!w-10 !h-10 !animate-spin !text-[#1abc60]" />
            <p className="!text-[#1abc60] !font-bold !uppercase !tracking-widest !text-[11px]">Loading Arena...</p>
          </div>
        ) : filteredSports.length > 0 ? (
          <div className="!grid !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-3 xl:!grid-cols-4 !gap-6">
            {filteredSports.map((sport) => (
              <Link 
                href={`/ground?sport=${sport.name}`} 
                key={sport._id} 
                className="!group !relative !h-[320px] !rounded-2xl !overflow-hidden !cursor-pointer !shadow-sm hover:!shadow-xl hover:!-translate-y-1.5 !transition-all !duration-300 !block !bg-gray-100 !border !border-gray-200"
              >
                {/* Background Image */}
                <img 
                  src={sport.image} 
                  alt={sport.name} 
                  className="!absolute !inset-0 !w-full !h-full !object-cover group-hover:!scale-105 !transition-transform !duration-700 !ease-out !z-0" 
                />
                
                {/* Overlay Gradient (Ensures Text Visibility) */}
                <div className="!absolute !inset-0 !bg-gradient-to-t !from-gray-900/95 !via-gray-900/40 !to-transparent !z-[1]" />
                
                {/* Floating Badge */}
                <div className="!absolute !top-4 !right-4 !z-10 !opacity-0 group-hover:!opacity-100 !transition-opacity !duration-300">
                  <div className="!bg-white/20 !backdrop-blur-md !border !border-white/30 !text-white !px-3 !py-1.5 !rounded-lg !text-[10px] !font-bold !uppercase !tracking-wider">
                    Explore
                  </div>
                </div>

                {/* Text Content (Added strict z-10 so global CSS doesn't hide it) */}
                <div className="!absolute !bottom-0 !left-0 !right-0 !p-6 !z-10 !flex !flex-col !justify-end">
                  <span className="!text-[#1abc60] !text-[11px] !font-bold !uppercase !tracking-widest !mb-1.5 !block !opacity-0 group-hover:!opacity-100 !translate-y-2 group-hover:!translate-y-0 !transition-all !duration-300">
                    Category
                  </span>
                  <h3 className="!text-white !font-bold !text-2xl !tracking-tight !m-0 !leading-none">
                    {sport.name}
                  </h3>
                  <div className="!mt-3 !h-1 !w-8 !bg-[#1abc60] !rounded-full group-hover:!w-16 !transition-all !duration-500 !ease-in-out" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="!text-center !py-32 !bg-white !rounded-3xl !border !border-dashed !border-gray-200 !shadow-sm">
            <div className="!w-20 !h-20 !bg-gray-50 !rounded-2xl !flex !items-center !justify-center !mx-auto !mb-5 !border !border-gray-100">
              <Search className="!w-8 !h-8 !text-gray-300" />
            </div>
            <h2 className="!text-xl !font-bold !text-gray-900 !tracking-tight !m-0">No results found</h2>
            <p className="!text-sm !text-gray-500 !mt-2 !font-medium">We couldn't find any sports matching "{searchQuery}".</p>
            <button 
              onClick={() => setSearchQuery("")}
              className="!mt-6 !text-[#1abc60] !font-bold !text-[13px] hover:!text-[#169c4e] !transition-colors !border-none !bg-transparent !cursor-pointer"
            >
              Clear Search
            </button>
          </div>
        )}

      </div>
    </div>
  );
}