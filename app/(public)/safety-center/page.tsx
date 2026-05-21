"use client";

import { motion } from 'framer-motion';
import { 
  ShieldCheck, HeartPulse, UserCheck, 
  MapPin, AlertTriangle, PhoneCall,
  CheckCircle2, ArrowRight, ShieldAlert
} from 'lucide-react';

export default function SafetyCenterPage() {
  const safetySections = [
    {
      icon: <UserCheck className="w-8 h-8" />,
      title: "Verified Community",
      desc: "Every player on GameOn is verified via OTP. We maintain a rating system to ensure a respectful and safe environment for everyone.",
      points: ["OTP Verified Accounts", "Player Rating System", "Zero Tolerance for Misconduct"]
    },
    {
      icon: <ShieldCheck className="w-8 h-8" />,
      title: "Venue Standards",
      desc: "We partner with venues that meet our strict safety and hygiene criteria, ensuring you can focus entirely on your game.",
      points: ["First Aid Kits on-site", "Proper Lighting Standards", "Safe Playing Surfaces"]
    },
    {
      icon: <HeartPulse className="w-8 h-8" />,
      title: "Play Safe Guidelines",
      desc: "Your physical safety is paramount. Follow these basic guidelines to prevent injuries and ensure a great match.",
      points: ["Always Warm Up", "Stay Hydrated", "Use Proper Footwear"]
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── HERO SECTION ── */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto space-y-8"
          >
            <span className="inline-block px-4 py-1.5 mb-2 text-[10px] font-black tracking-[0.2em] text-emerald-600 uppercase bg-emerald-100 rounded-full">
              Safe Play Always
            </span>
            <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1.1]">
              Your Safety is our <br/>
              <span className="text-emerald-600 underline decoration-emerald-200 underline-offset-8">Priority.</span>
            </h1>
            <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">
              At GameOn, we are committed to building a safe, inclusive, and secure sports ecosystem for players and venue owners alike.
            </p>
          </motion.div>
        </div>
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-emerald-100 rounded-full blur-3xl opacity-30 pointer-events-none" />
      </section>

      {/* ── SAFETY PILLARS ── */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {safetySections.map((section, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-10 bg-gray-50 rounded-[3rem] border border-gray-100 hover:border-emerald-200 hover:bg-white hover:shadow-2xl hover:shadow-emerald-50 transition-all group"
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-emerald-600 mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                  {section.icon}
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-6">{section.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed mb-8">{section.desc}</p>
                <ul className="space-y-4">
                  {section.points.map((point, pIdx) => (
                    <li key={pIdx} className="flex items-center gap-3 text-sm font-bold text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      {point}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EMERGENCY INFO ── */}
      <section className="py-20 lg:py-32 bg-gray-900 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-red-400">
                <ShieldAlert className="w-4 h-4" /> Instant Support
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">Emergency? <br/>We&apos;re here for you.</h2>
              <p className="text-gray-400 font-medium text-lg">
                If you encounter any safety issue or emergency at a venue during your booking, please use our 24/7 priority line.
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <a href="tel:+918896172818" className="bg-white text-gray-900 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-gray-100 transition-all">
                  <PhoneCall className="w-5 h-5" /> +91 88961 72818
                </a>
                <a href="/contact-support" className="bg-white/10 text-white border border-white/10 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-white/20 transition-all">
                  Report an Incident
                </a>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-10 lg:p-16 rounded-[3.5rem] border border-white/10 space-y-8">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg mb-1">Location Tracking</h4>
                  <p className="text-gray-400 text-sm font-medium">Always share your live booking details with a friend or family member before heading to a new venue.</p>
                </div>
              </div>
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg mb-1">Incident Reporting</h4>
                  <p className="text-gray-400 text-sm font-medium">Report any facility issues or improper behavior. We take every report seriously to improve the community.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/20 rounded-full blur-[100px]" />
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-4xl font-black text-gray-900">Let&apos;s keep the game clean.</h2>
          <p className="text-gray-500 font-medium text-lg">
            Safety is a shared responsibility. By following our guidelines, you help us create the best sports community in India.
          </p>
          <div className="pt-8">
            <a href="/faqs" className="inline-flex items-center gap-2 text-emerald-600 font-black uppercase tracking-widest text-sm hover:gap-4 transition-all">
              Read Safety FAQs <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
