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
      </section>

      {/* ── SAFETY SECTIONS ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {safetySections.map((section, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:border-emerald-200 transition-colors group"
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {section.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h3>
                <p className="text-gray-600 mb-6 line-height-relaxed">{section.desc}</p>
                <ul className="space-y-3">
                  {section.points.map((point, pIndex) => (
                    <li key={pIndex} className="flex items-center gap-3 text-sm font-semibold text-gray-700">
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

      {/* ── EMERGENCY CONTACTS ── */}
      <section className="py-20 bg-emerald-600 text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl lg:text-5xl font-black leading-tight">
                Need help during <br/>a match?
              </h2>
              <p className="text-emerald-100 text-lg font-medium">
                Our safety team is available during all operational hours to assist you with any issues or emergencies.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="tel:+911234567890" className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-emerald-600 rounded-2xl font-black hover:bg-emerald-50 transition-colors">
                  <PhoneCall className="w-5 h-5" />
                  Call Support
                </a>
                <a href="/contact" className="flex items-center justify-center gap-3 px-8 py-4 bg-emerald-700 text-white rounded-2xl font-black hover:bg-emerald-800 transition-colors">
                  Report an Issue
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
                <ShieldAlert className="w-10 h-10 mb-4 text-emerald-200" />
                <h4 className="font-bold text-xl mb-2">Immediate Help</h4>
                <p className="text-emerald-100 text-sm">Contact on-site venue managers for immediate assistance during your slot.</p>
              </div>
              <div className="p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
                <AlertTriangle className="w-10 h-10 mb-4 text-emerald-200" />
                <h4 className="font-bold text-xl mb-2">Report Abuse</h4>
                <p className="text-emerald-100 text-sm">We take misconduct seriously. Report any inappropriate behavior via the app.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}