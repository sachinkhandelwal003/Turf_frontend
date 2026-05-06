"use client";

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { CheckCircle2, ArrowRight, Award, TrendingUp, Star, Users, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

const THEME = {
  accent: "#C9A96E", // Premium Gold
  dark: "#0A0A0A",   // Jet Black
};

export default function ServicesPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const stats = [
    { value: '500+', label: 'Projects Delivered', icon: TrendingUp },
    { value: '15+', label: 'Years Experience', icon: Star },
    { value: '100%', label: 'Client Satisfaction', icon: Users },
    { value: '25+', label: 'Global Awards', icon: Award },
  ];

  const services = [
    {
      num: '01',
      label: 'RESIDENTIAL',
      title: 'Bespoke Residential Spaces',
      desc: 'We specialize in crafting bespoke living spaces that are both luxurious and liveable. From ground-up residential builds to complete home transformations, our approach ensures your sanctuary is a true reflection of your personality and lifestyle.',
      features: ["Custom Villa & Home Design", "Kitchen & Bathroom Remodeling", "Master Bedroom Sanctuaries", "Spatial Planning & Flow"],
      img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200',
      cta: 'Discuss Your Home',
    },
    {
      num: '02',
      label: 'COMMERCIAL',
      title: 'Dynamic Commercial Environments',
      desc: 'Your commercial space is an extension of your brand. We design dynamic environments that inspire productivity, impress clients, and foster growth — from modern corporate offices to inviting hospitality venues.',
      features: ["Corporate Office Strategy", "Retail Store Environments", "Hospitality & Restaurant Ambience", "Brand Integration"],
      img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200',
      cta: 'Elevate Your Workspace',
    },
    {
      num: '03',
      label: 'PMC',
      title: 'Project Management & Consultancy',
      desc: 'Protect your investment. As your Project Management Consultants, we act as your direct representative on-site. We oversee contractors, manage strict timelines, audit budgets, and ensure that execution flawlessly matches the architectural intent.',
      features: ["Timeline Management", "Contractor Coordination", "Site Quality Audits", "Feasibility Studies"],
      img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1200',
      cta: 'Protect Your Investment',
    },
    {
      num: '04',
      label: 'ESTIMATION',
      title: 'Precision Cost Estimation',
      desc: 'Precise budgeting and cost estimation for your interior design projects. We provide detailed financial planning, material cost analysis, and comprehensive project estimates to ensure absolute transparency.',
      features: ["Detailed Cost Breakdown", "Material Estimates", "Budget Optimization", "Financial Feasibility"],
      img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1200',
      cta: 'Get Your Estimate',
    },
  ];

  const designProcessSteps = [
    { num: '01', title: "Concept Design", desc: "Understanding lifestyle, defining vision, and setting the aesthetic direction through initial mood boards and sketches.", duration: "2-4 weeks" },
    { num: '02', title: "Schematic Layout", desc: "Translating concepts into 2D spatial realities, exploring structural modifications, and curating material palettes.", duration: "3-6 weeks" },
    { num: '03', title: "Detailed 3D Design", desc: "Refining exact finishes, custom millwork, and providing highly detailed 3D photorealistic renderings of the space.", duration: "4-8 weeks" },
    { num: '04', title: "Technical Blueprints", desc: "Producing precise master guides and construction drawings to ensure flawless execution by builders and contractors.", duration: "2-4 weeks" },
    { num: '05', title: "Execution & Styling", desc: "Managing procurement, conducting site-audits, staging the furniture, and the final handover of your completed sanctuary.", duration: "8-24 weeks" },
  ];

  return (
    <div className="min-h-screen font-sans selection:text-black" style={{ backgroundColor: THEME.dark}}>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-end overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1920&q=85"
            alt="Sophisticated Interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-[#0A0A0A]/30" />
        </motion.div>

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 pb-16 sm:pb-20 lg:pb-24 pt-32 sm:pt-40 lg:pt-48">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
            <div className="flex items-center gap-4 mb-6 sm:mb-8">
              <div className="w-8 sm:w-12 h-[2px]" style={{ backgroundColor: THEME.accent }} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em]" style={{ color: THEME.accent }}>Our Expertise</span>
            </div>
            <h1 className="text-5xl sm:text-7xl lg:text-[6rem] xl:text-[8rem] font-black text-white tracking-tighter leading-[1] sm:leading-[0.9] mb-6 sm:mb-10 font-serif">
              Services<br />
              <span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.2)' }}>That</span><br />
              <span style={{ color: THEME.accent }}>Deliver.</span>
            </h1>
            <p className="text-white/50 text-base sm:text-lg font-light mt-4 sm:mt-6 max-w-lg">
              Creating inspired spaces through strategic design, meticulous management, and seamless execution.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.4 }} className="mt-12 sm:mt-16 lg:mt-20 pt-8 sm:pt-10 border-t border-white/10 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((s, i) => (
              <div key={i}>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-serif mb-1 sm:mb-2">{s.value}</div>
                <div className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] sm:tracking-[0.25em] font-bold" style={{ color: THEME.accent }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Services Section - Zig Zag Layout */}
      <section className="py-20 sm:py-32 lg:py-48 bg-[#0A0A0A] relative border-t border-white/5">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          
          <div className="text-center mb-16 sm:mb-24 lg:mb-32">
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black text-white font-serif mb-4 sm:mb-6">
              Core <span style={{ color: THEME.accent }}>Capabilities</span>
            </h2>
            <p className="text-white/50 text-sm sm:text-base max-w-2xl mx-auto font-light px-4">
              We move beyond standard layouts, offering end-to-end solutions that guarantee structural integrity and breathtaking aesthetics.
            </p>
          </div>

          <div className="space-y-24 sm:space-y-32 lg:space-y-48">
            {services.map((service, index) => {
              const isEven = index % 2 === 0;
              return (
                <div key={index} className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 sm:gap-12 lg:gap-24 items-center`}>
                  
                  {/* Image */}
                  <motion.div 
                    initial={{ opacity: 0, x: isEven ? -50 : 50 }} 
                    whileInView={{ opacity: 1, x: 0 }} 
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="w-full lg:w-1/2 relative"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden group">
                      <img src={service.img} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                      <div className="absolute inset-0 border border-white/10 m-3 sm:m-4 pointer-events-none" />
                      <div className="absolute top-4 sm:top-8 right-4 sm:right-8 text-4xl sm:text-6xl font-black text-white/90 font-serif mix-blend-overlay">
                        {service.num}
                      </div>
                    </div>
                  </motion.div>

                  {/* Content */}
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="w-full lg:w-1/2"
                  >
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 sm:mb-6" style={{ color: THEME.accent }}>
                      {service.label}
                    </div>
                    <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-serif mb-6 sm:mb-8 leading-tight">
                      {service.title}
                    </h3>
                    <p className="text-white/60 text-base sm:text-lg font-light leading-relaxed mb-8 sm:mb-10">
                      {service.desc}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-12">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" style={{ color: THEME.accent }} />
                          <span className="text-white/80 text-xs sm:text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Link href="/contact" className="inline-flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-white hover:opacity-70 transition-opacity group">
                      {service.cta}
                      <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" style={{ color: THEME.accent }} />
                    </Link>
                  </motion.div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Methodology Section */}
      <section className="py-20 sm:py-32 bg-[#0F0F0F] relative border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          
          <div className="mb-16 sm:mb-20 lg:mb-24 md:flex md:items-end justify-between gap-12">
            <div className="max-w-2xl">
              <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white font-serif mb-4 sm:mb-6 leading-tight sm:leading-none">
                Our <span className="italic font-light text-white/50">Methodology.</span>
              </h2>
              <p className="text-white/50 text-base sm:text-lg font-light leading-relaxed">
                A systematic, phased approach ensuring absolute precision from the first sketch to the final installation. We leave nothing to chance.
              </p>
            </div>
            <div className="hidden md:block w-32 h-[2px]" style={{ backgroundColor: THEME.accent }} />
          </div>

          <div className="flex flex-col">
            {designProcessSteps.map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="group flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6 md:gap-8 py-8 sm:py-10 md:py-12 border-t border-white/10 hover:border-[#C9A96E] transition-colors duration-500"
              >
                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-serif w-24 sm:w-28 md:w-32 flex-shrink-0 transition-colors duration-500" style={{ color: THEME.accent }}>
                  {step.num}
                </div>
                
                <div className="flex-1 pr-0 md:pr-8 lg:pr-12">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white font-serif mb-2 sm:mb-3 group-hover:text-[#C9A96E] transition-colors duration-500">
                    {step.title}
                  </h3>
                  <p className="text-white/50 text-sm sm:text-base font-light leading-relaxed max-w-3xl">
                    {step.desc}
                  </p>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end gap-2 md:gap-0 flex-shrink-0 mt-2 md:mt-0">
                  <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Duration</span>
                  <span className="text-xs sm:text-sm font-medium text-white/80">{step.duration}</span>
                </div>
              </motion.div>
            ))}
            <div className="w-full h-px border-t border-white/10" />
          </div>

        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 sm:py-32 lg:py-48 bg-white relative overflow-hidden border-t border-[#C9A96E]/20">
        <div className="absolute inset-0 opacity-[0.03]">
          <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=60" alt="" className="w-full h-full object-cover" />
        </div>

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-24 items-center">
            
            {/* Left Image */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="relative order-2 lg:order-1"
            >
              <div className="aspect-[4/3] overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&q=80"
                  alt="Architecture"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 w-full h-full border-2 border-[#C9A96E] -z-10" />
            </motion.div>

            {/* Right Content */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="order-1 lg:order-2"
            >
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="w-8 sm:w-10 h-[2px] bg-[#C9A96E]" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[#C9A96E]">Initiate A Dialogue</span>
              </div>
              
              <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-[#0A0A0A] tracking-tighter font-serif leading-tight sm:leading-[1.05] mb-6 sm:mb-8">
                Craft Your<br />
                <span className="italic font-light text-[#C9A96E]">Legacy.</span>
              </h2>
              
              <p className="text-[#0A0A0A]/60 text-base sm:text-lg leading-relaxed font-medium mb-8 sm:mb-10 max-w-lg">
                Every extraordinary environment begins with a single conversation. Let our visionary architects translate your unique lifestyle into a bespoke masterpiece that transcends the ordinary.
              </p>
              
              <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-12">
                {['Tailored Spatial Planning', 'Exclusive Material Sourcing', 'Flawless Turnkey Execution'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 sm:gap-4 text-[#0A0A0A]/80 text-sm sm:text-base font-medium">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#C9A96E]" /> {item}
                  </div>
                ))}
              </div>
              
              <Link href="/contact"
                className="group inline-flex items-center gap-3 sm:gap-5 px-6 sm:px-8 py-4 sm:py-5 bg-[#0A0A0A] text-white text-xs sm:text-sm font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] hover:bg-[#C9A96E] hover:text-[#0A0A0A] hover:-translate-y-1 shadow-xl hover:shadow-[#C9A96E]/40 transition-all duration-300 rounded-sm">
                Request Consultation
                <span className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/10 group-hover:bg-[#0A0A0A]/10 transition-colors">
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            </motion.div>

          </div>
        </div>
      </section>

    </div>
  );
}