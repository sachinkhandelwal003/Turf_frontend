"use client";

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { User } from 'lucide-react';

interface TeamMember {
  _id: string;
  name: string;
  position: string;
  bio: string;
  image: string;
  email?: string;
  linkedin?: string;
  twitter?: string;
}

interface Founder {
  _id?: string;
  name: string;
  title: string;
  quote: string;
  image: string;
  bio?: string;
}

const journeySteps = [
  { year: "2010", title: "The Inception", description: "Founded with a vision to redefine interior spaces through thoughtful design and premium craftsmanship." },
  { year: "2015", title: "First Major Recognition", description: "Awarded the National Design Excellence Award for our groundbreaking work on the Horizon Residential Complex." },
  { year: "2020", title: "Global Expansion", description: "Opened our first international studio in Dubai, bringing our unique interior design philosophy to the global stage." },
  { year: "2024", title: "Sustainable Future", description: "Committed to 100% eco-friendly designs, integrating sustainable materials into all new projects." },
];

// Fallback Premium Data to ensure the UI never breaks
const fallbackTeam: TeamMember[] = [
  { 
    _id: 't1', 
    name: 'Eleanor Vance', 
    position: 'Principal Architect', 
    bio: 'With over 20 years of experience, Eleanor leads the studio with a distinct vision for blending modern minimalism with timeless warmth.', 
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80' 
  },
  { 
    _id: 't2', 
    name: 'Marcus Sterling', 
    position: 'Design Director', 
    bio: 'Marcus oversees all creative operations, ensuring every project aligns with our uncompromising standards of luxury and functionality.', 
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80' 
  },
  { 
    _id: 't3', 
    name: 'Sophia Lin', 
    position: 'Lead Interior Designer', 
    bio: 'Sophia specializes in bespoke furniture curation and textile selection, bringing distinct character to every residential and commercial space.', 
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&q=80' 
  }
];

export default function AboutPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [founder, setFounder] = useState<Founder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/team`);
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
          setTeamMembers(data.data);
        } else {
          setTeamMembers(fallbackTeam);
        }
      } catch {
        setTeamMembers(fallbackTeam);
      }
    };

    const fetchFounder = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/founder`);
        const data = await res.json();
        if (data.success && data.data) {
          setFounder(data.data);
        }
      } catch {
        // Silently fail, founder section will just show a loading state or nothing if missing
      }
    };

    Promise.all([fetchTeam(), fetchFounder()]).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white selection:bg-[#C9A96E] selection:text-[#0A0A0A]">

      {/* ── 1. HERO ── */}
      <section className="relative min-h-[90vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=85"
            alt="Luxury Interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/50 to-[#0A0A0A]/10" />
        </div>

        <div className="relative z-10 max-w-[1600px] mx-auto px-6 lg:px-12 pb-24 pt-48 w-full">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px w-12 bg-[#C9A96E]" />
              <span className="text-[#C9A96E] text-[9px] font-black uppercase tracking-[0.4em]">About The Studio</span>
            </div>
            <h1 className="text-6xl sm:text-8xl lg:text-[10rem] font-black text-white tracking-tight font-serif leading-none mb-8">
              ABOUT<br />
              <span className="text-[#C9A96E]">US</span>
            </h1>
            <p className="text-white/50 text-lg font-light max-w-2xl">
              We are a collective of visionary designers and interior professionals dedicated to creating enduring masterpieces.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── 2. ABOUT CONTENT ── */}
      <section className="bg-white py-32">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px w-10 bg-[#C9A96E]" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#C9A96E]">The Studio</span>
              </div>
              <h2 className="text-4xl lg:text-6xl font-black text-[#0A0A0A] font-serif mb-2 leading-tight">Designing spaces that</h2>
              <h2 className="text-4xl lg:text-6xl font-black text-[#0A0A0A] font-serif mb-8 leading-tight italic font-light">inspire and endure.</h2>
              <div className="h-[2px] w-16 bg-[#C9A96E] mb-8" />
              <div className="space-y-5 text-[#0A0A0A]/60 text-base leading-relaxed font-light mb-10">
                <p>At our Studio, every space begins with a deep focus on detail — the foundation of exceptional design. From material selection to finishing touches, each element is carefully considered and thoughtfully executed.</p>
                <p>We craft smart, elegant and customised interiors that balance design, comfort and functionality. Our expertise spans residential, commercial and bespoke interior solutions.</p>
              </div>
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-black/10">
                {[{ v: '15+', l: 'Years Experience' }, { v: '120', l: 'Global Awards' }].map((s, i) => (
                  <div key={i}>
                    <div className="text-4xl font-black text-[#C9A96E] font-serif mb-1">{s.v}</div>
                    <div className="text-[9px] uppercase tracking-[0.3em] text-[#0A0A0A]/40 font-bold">{s.l}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="relative"
            >
              <div className="aspect-[3/4] overflow-hidden bg-stone-100">
                <img
                  src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1000&q=80"
                  alt="Interior Design"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-[1200ms]"
                />
              </div>
              <div className="absolute -bottom-5 -left-5 w-full h-full border-2 border-[#C9A96E]/30 -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 3. TIMELINE (Moved Up: History comes before the Team) ── */}
      <section className="py-32 bg-stone-50 border-y border-stone-200 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-32">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px w-10 bg-[#C9A96E]" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#C9A96E]">History</span>
              <div className="h-px w-10 bg-[#C9A96E]" />
            </div>
            <h2 className="text-5xl lg:text-7xl font-black text-[#0A0A0A] font-serif">Our Journey</h2>
          </div>

          <div className="relative">
            {/* Center Line for Desktop */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-stone-200 -translate-x-1/2" />

            <div className="space-y-20 md:space-y-32">
              {journeySteps.map((step, index) => {
                const isEven = index % 2 === 0;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: index * 0.1 }}
                    className={`relative flex flex-col md:flex-row items-center ${isEven ? 'md:flex-row-reverse' : ''}`}
                  >
                    {/* Center Node (Desktop) */}
                    <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-[#C9A96E] rotate-45 z-10 shadow-sm" />

                    {/* Content Half */}
                    <div className={`w-full md:w-1/2 ${isEven ? 'md:pl-16 lg:pl-24' : 'md:pr-16 lg:pr-24 text-left md:text-right'} relative`}>
                      {/* Massive Background Year */}
                      <span className={`absolute top-1/2 -translate-y-1/2 ${isEven ? '-left-4 md:left-12' : '-left-4 md:auto md:-right-8'} text-[6rem] sm:text-[8rem] lg:text-[10rem] font-black text-stone-200/50 font-serif pointer-events-none -z-10`}>
                        {step.year}
                      </span>
                      
                      <span className="text-[#C9A96E] font-black text-2xl lg:text-3xl font-serif block mb-2">{step.year}</span>
                      <h3 className="text-2xl lg:text-3xl font-black text-[#0A0A0A] font-serif mb-4">{step.title}</h3>
                      <p className="text-[#0A0A0A]/60 font-light leading-relaxed text-base max-w-sm ml-0 md:mx-auto">
                        {step.description}
                      </p>
                    </div>

                    {/* Empty Half (Desktop spacing) */}
                    <div className="hidden md:block w-1/2" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. FOUNDER ── */}
      <section className="py-32 bg-white">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="flex items-center gap-4 mb-16">
            <div className="h-px w-10 bg-[#C9A96E]" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#C9A96E]">Leadership</span>
          </div>

          {founder ? (
            <div className="grid lg:grid-cols-2 gap-0 relative">
              {/* Image */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative aspect-[4/3] lg:aspect-auto lg:h-[600px] overflow-hidden z-0"
              >
                <img src={founder.image} alt={founder.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
              </motion.div>

              {/* Overlapping Content Box */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-white p-12 lg:p-20 flex flex-col justify-center relative shadow-xl lg:-ml-20 lg:mt-20 z-10 border border-stone-100"
              >
                <div className="absolute top-4 right-8 text-[10rem] text-stone-100 font-serif font-black leading-none pointer-events-none">"</div>
                <span className="text-[#C9A96E] text-[9px] font-black uppercase tracking-[0.4em] mb-4 block">Meet The Founder</span>
                <h2 className="text-4xl font-black text-[#0A0A0A] font-serif mb-8">{founder.name}</h2>
                <p className="text-xl text-[#0A0A0A]/60 font-light leading-relaxed mb-8 italic relative z-10">
                  "{founder.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="h-px w-10 bg-[#C9A96E]/50" />
                  <span className="text-[9px] uppercase tracking-[0.3em] text-[#0A0A0A]/40 font-bold">{founder.title}</span>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-10 h-10 border-2 border-stone-200 border-t-[#C9A96E] rounded-full animate-spin mx-auto" />
            </div>
          )}
        </div>
      </section>

      {/* ── 5. TEAM (Upgraded Editorial UI) ── */}
      <section className="py-32 bg-stone-50 border-t border-stone-200">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-24">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="h-px w-8 bg-[#C9A96E]" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#C9A96E]">The Masterminds</span>
                <div className="h-px w-8 bg-[#C9A96E]" />
              </div>
              <h2 className="text-4xl lg:text-6xl font-black text-[#0A0A0A] font-serif">Our Team</h2>
            </motion.div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="w-10 h-10 border-2 border-stone-200 border-t-[#C9A96E] rounded-full animate-spin mx-auto" />
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-stone-200 bg-white">
              <User className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <p className="text-[#0A0A0A]/40">No team members available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group cursor-pointer flex flex-col"
                >
                  {/* Editorial Image Wrapper */}
                  <div className="relative w-full aspect-[4/5] overflow-hidden mb-8 bg-stone-200">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out grayscale group-hover:grayscale-0"
                    />
                    {/* Subtle Overlay Border */}
                    <div className="absolute inset-0 border border-[#0A0A0A]/5 pointer-events-none z-10" />
                  </div>

                  {/* Refined Typography */}
                  <div className="text-center px-4">
                    <h3 className="text-3xl font-serif text-[#0A0A0A] mb-2 transition-colors">{member.name}</h3>
                    <p className="text-[#C9A96E] text-[10px] uppercase tracking-[0.25em] font-bold mb-5">{member.position}</p>
                    <div className="w-6 h-px bg-[#C9A96E]/50 mx-auto mb-5 transition-all duration-300 group-hover:w-12" />
                    <p className="text-[#0A0A0A]/60 font-light text-sm leading-relaxed max-w-sm mx-auto">{member.bio}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}