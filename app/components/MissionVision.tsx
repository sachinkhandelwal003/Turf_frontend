"use client";

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function MissionVision() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const leftY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const rightY = useTransform(scrollYProgress, [0, 1], [-60, 60]);

  return (
    <section ref={ref} className="relative bg-[#0A0A0A] overflow-hidden">

      {/* Decorative BG */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&q=60"
          alt=""
          className="w-full h-full object-cover opacity-5"
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="text-[25vw] font-black text-white/[0.015] leading-none tracking-tighter font-serif">SD</span>
        </div>
      </div>

      {/* Top border */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-[#C9A96E]/40 to-transparent" />

      <div className="max-w-[1700px] mx-auto px-6 lg:px-12">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center pt-24 pb-16 relative z-10"
        >
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="h-px w-12 bg-[#C9A96E]" />
            <span className="text-[#C9A96E] text-[9px] font-black uppercase tracking-[0.4em]">Philosophy</span>
            <div className="h-px w-12 bg-[#C9A96E]" />
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white uppercase tracking-tight leading-none font-serif">
            Our Design <span className="italic font-light text-[#C9A96E]">Philosophy</span>
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/5 mb-24">

          {/* Mission */}
          <motion.div
            style={{ y: leftY }}
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            className="relative bg-[#0A0A0A] p-12 lg:p-20 group overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-[#C9A96E]/20 group-hover:border-[#C9A96E]/60 transition-colors duration-700" />
            <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-[#C9A96E]/20 group-hover:border-[#C9A96E]/60 transition-colors duration-700" />
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#C9A96E]/5 rounded-full blur-3xl group-hover:bg-[#C9A96E]/10 transition-colors duration-1000" />

            {/* BG image */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700">
              <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=60" alt="" className="w-full h-full object-cover" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-10">
                <span className="text-6xl font-black text-[#C9A96E]/20 leading-none font-serif">01</span>
                <div>
                  <p className="text-[#C9A96E] text-[9px] font-black uppercase tracking-[0.4em] mb-1">Our Mission</p>
                  <div className="h-px w-16 bg-[#C9A96E]" />
                </div>
              </div>

              <h3 className="text-3xl xl:text-4xl font-black text-white uppercase leading-tight tracking-tight mb-6 font-serif">
                Design That<br />
                <span className="text-[#C9A96E] italic font-light">Transcends</span><br />
                Time
              </h3>

              <p className="text-white/40 text-base leading-relaxed font-light mb-10 max-w-md">
                We craft sophisticated spaces where elegance meets precision. Through curated materials, refined detailing, and a focus on timeless design, we create interiors that exude luxury while remaining functional and enduring.
              </p>

              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/5">
                {[{ v: '500+', l: 'Projects' }, { v: '15+', l: 'Years' }, { v: '100%', l: 'Satisfaction' }].map((s, i) => (
                  <div key={i}>
                    <div className="text-2xl font-black text-white font-serif mb-1">{s.v}</div>
                    <div className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Vision */}
          <motion.div
            style={{ y: rightY }}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="relative bg-[#111111] p-12 lg:p-20 group overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-[#C9A96E]/20 group-hover:border-[#C9A96E]/60 transition-colors duration-700" />
            <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-[#C9A96E]/20 group-hover:border-[#C9A96E]/60 transition-colors duration-700" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#C9A96E]/5 rounded-full blur-3xl group-hover:bg-[#C9A96E]/10 transition-colors duration-1000" />

            {/* BG image */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700">
              <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=60" alt="" className="w-full h-full object-cover" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-10">
                <span className="text-6xl font-black text-[#C9A96E]/20 leading-none font-serif">02</span>
                <div>
                  <p className="text-[#C9A96E] text-[9px] font-black uppercase tracking-[0.4em] mb-1">Our Vision</p>
                  <div className="h-px w-16 bg-[#C9A96E]" />
                </div>
              </div>

              <h3 className="text-3xl xl:text-4xl font-black text-white uppercase leading-tight tracking-tight mb-6 font-serif">
                Shaping The<br />
                <span className="text-[#C9A96E] italic font-light">Future</span> Of<br />
                Living
              </h3>

              <p className="text-white/40 text-base leading-relaxed font-light mb-10 max-w-md">
                Inspiring spaces with lasting impact. Developing spaces that combine visual appeal, functionality, and durability—ensuring they influence users positively and perform efficiently in the long run.
              </p>

              <div className="space-y-3 pt-8 border-t border-white/5">
                {['Global Recognition', 'Timeless Craft', 'Client-First Approach'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-[#C9A96E] rotate-45 flex-shrink-0" />
                    <span className="text-white/40 text-xs uppercase tracking-[0.15em] font-bold">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-[#C9A96E]/40 to-transparent" />
    </section>
  );
}