"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function OffersBanner() {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 mt-6 mb-2">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-[#0d3f26] via-[#115031] to-[#1abc60] p-6 md:p-8 text-white shadow-xl shadow-green-950/10 border border-[#1abc60]/20"
      >
        {/* Ambient background glow */}
        <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-[#1abc60]/20 blur-3xl" />
        <div className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full bg-white/5 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3.5">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-1.5 bg-[#FFB800] text-gray-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>THIS WEEK</span>
            </div>

            {/* Typography */}
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white leading-tight m-0 uppercase tracking-tight">
                Weekend games, 20% off
              </h2>
              <p className="text-green-100/90 text-[13px] md:text-[14px] font-bold mt-1.5 m-0">
                Across selected grounds - tap to explore
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex-shrink-0">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-[#1d7d45] font-black text-xs md:text-sm uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] group"
            >
              <span>View Offers</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
