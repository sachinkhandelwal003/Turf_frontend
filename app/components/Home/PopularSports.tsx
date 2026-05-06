"use client";

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
// Agar tu Next.js ka optimized Image component use karna chahe toh isko import kar sakta hai:
// import Image from 'next/image'; 

// Local images ka path (public folder ke andar wale)
const sportsData = [
  { name: 'Badminton', img: '/badminton.png' },
  { name: 'Football', img: '/football.png' },
  { name: 'Tennis', img: '/tennis.png' },
  { name: 'Swimming', img: '/Swimming.png' },
  { name: 'Cricket', img: '/Cricket.png' },
  { name: 'Table Tennis', img: '/tabletennis.png' },
];

export default function PopularSports() {
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
            href="/sports" 
            className="flex items-center gap-1.5 text-[#1abc60] font-bold text-[15px] hover:text-[#169c4e] transition-colors"
          >
            View All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* --- Sports Cards Grid --- */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
          {sportsData.map((sport, idx) => (
            <Link 
              href={`/sports/${sport.name.toLowerCase().replace(' ', '-')}`} 
              key={idx} 
              className="group relative h-[240px] rounded-[16px] overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all block"
            >
              {/* Local Image Render */}
              <img 
                src={sport.img} 
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

      </div>
    </section>
  );
}