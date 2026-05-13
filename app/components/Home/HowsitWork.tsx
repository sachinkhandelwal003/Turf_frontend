"use client";

import { useState } from 'react';
import { Search, Smartphone, Flag } from 'lucide-react';
import GroundOwnerModal from '../layout/GroundOwnerModal';

const steps = [
  {
    title: "Search",
    desc: "Find venues by sport, location, or availability near you.",
    icon: <Search className="w-8 h-8" strokeWidth={2.5} />,
    bgColor: "bg-[#0062a4]",
  },
  {
    title: "Book",
    desc: "Secure your slot with instant payment and confirmation.",
    icon: <Smartphone className="w-8 h-8" strokeWidth={2.5} />,
    bgColor: "bg-[#eb465a]",
  },
  {
    title: "Play",
    desc: "Turn up at the venue and let the competitive spirit take over.",
    icon: <Flag className="w-8 h-8" strokeWidth={2.5} />,
    bgColor: "bg-[#f7a233]",
  }
];

export default function ProcessAndPartner() {
  const [isGroundOwnerModalOpen, setIsGroundOwnerModalOpen] = useState(false);

  return (
    <section className="bg-white py-20">
      <div className="max-w-[1200px] mx-auto px-4">
        
        {/* --- 1. How It Works Section --- */}
        <div className="text-center mb-24">
          <h2 className="text-[36px] font-bold text-gray-900 mb-3">How It Works</h2>
          <p className="text-gray-500 text-[15px] max-w-lg mx-auto leading-relaxed font-medium">
            Getting on the field has never been easier. Follow these three steps and start your match.
          </p>

          <div className="relative mt-20 flex flex-col md:flex-row justify-between items-start gap-12 md:gap-4 max-w-[1000px] mx-auto">
            {/* Background Dashed Line */}
            <div className="hidden md:block absolute top-[40px] left-[10%] right-[10%] border-t-[2px] border-dashed border-gray-200 z-0" />

            {steps.map((step, index) => (
              <div key={index} className="relative z-10 flex flex-col items-center flex-1 px-4">
                <div className={`w-20 h-20 rounded-full ${step.bgColor} flex items-center justify-center text-white shadow-lg mb-6`}>
                  {step.icon}
                </div>
                <h3 className="text-[18px] font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-[14px] text-gray-500 leading-relaxed max-w-[200px]">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* --- 2. Partner CTA Section (Own a Sports Venue) --- */}
        <div className="relative rounded-[32px] overflow-hidden bg-gray-900 min-h-[380px] flex items-center p-8 md:p-16 group">
          
          {/* --- BACKGROUND IMAGE --- */}
          <div className="absolute inset-0 z-0">
            <img 
              src="/WorkGround.png" 
              alt="Turf Partner Background" 
              className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
            />
            {/* Dark fade gradient */}
            {/* <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" /> */}
          </div>

          {/* CTA Content */}
          <div className="relative z-10 max-w-2xl">
            {/* FIX: Title aur text me !text-white lagaya */}
            <h2 className="text-3xl md:text-[42px] font-bold !text-white mb-5 leading-tight">
              Own a Sports Venue?
            </h2>
            <p className="!text-white opacity-90 text-base md:text-lg font-light mb-8 leading-relaxed max-w-lg">
              Join the GameOn ecosystem. List your venue, manage bookings effortlessly, and grow your revenue today.
            </p>
            {/* FIX: Button rounded-full tha, isko design ke hisaab se normal rounded kiya hai agar chahe toh */}
            <button 
              onClick={() => setIsGroundOwnerModalOpen(true)}
              className="bg-[#1abc60] hover:bg-[#169c4e] !text-white font-bold py-3.5 px-10 rounded-[10px] transition-all duration-300 shadow-md text-[15px] border-none"
            >
              List Your Venue Now
            </button>
          </div>
        </div>

      </div>

      <GroundOwnerModal 
        isOpen={isGroundOwnerModalOpen} 
        onClose={() => setIsGroundOwnerModalOpen(false)} 
      />
    </section>
  );
}