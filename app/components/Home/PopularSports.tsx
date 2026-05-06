"use client";

import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/app/services/api';

interface Sport {
  _id: string;
  name: string;
  image?: string;
}

export default function PopularSports() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <section className="py-16 bg-[#f8f9fa] border-t border-gray-100">
      <div className="max-w-[1200px] mx-auto px-4">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-[32px] font-bold text-gray-900 leading-tight mb-1">
              Popular Sports
            </h2>
            <p className="text-gray-500 text-[15px]">
              Choose your arena and dominate the field.
            </p>
          </div>
          
          <Link 
            href="/ground" 
            className="flex items-center gap-1.5 text-[#1abc60] font-bold text-[15px] hover:text-[#169c4e] transition-colors"
          >
            View All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* --- Sports Cards Grid --- */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[#1abc60]" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
            {sports.map((sport) => (
              <Link 
                href={`/ground?sport=${sport.name}`} 
                key={sport._id} 
                className="group relative h-[240px] rounded-[16px] overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all block"
              >
                {/* Local Image Render */}
                <img 
                  src={sport.image} 
                  alt={sport.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out" 
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/90 via-[#0A0A0A]/20 to-transparent" />
                
                <div className="absolute bottom-5 left-0 w-full text-center px-2">
                  <span className="text-white font-bold text-[15px] tracking-wide">
                    {sport.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}