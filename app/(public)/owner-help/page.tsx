"use client";

import { motion } from 'framer-motion';
import { 
  TrendingUp, Shield, Smartphone, 
  BarChart3, Users, Zap, 
  ArrowRight, CheckCircle2, DollarSign
} from 'lucide-react';

export default function OwnerHelpPage() {
  const benefits = [
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Highest Payouts",
      desc: "Get 82% of every booking value. No hidden fees, no complex tiers. You earn more with GameOn."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Setup",
      desc: "List your venue in under 10 minutes. Our team helps you with high-quality photography and slot configuration."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Smart Analytics",
      desc: "Track your peak hours, revenue trends, and player demographics with our powerful owner dashboard."
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Mobile Management",
      desc: "Manage slots, block times for maintenance, and track live bookings directly from your phone."
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── HERO SECTION ── */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <span className="inline-block px-4 py-1.5 text-[10px] font-black tracking-[0.2em] text-blue-600 uppercase bg-blue-100 rounded-full">
                Partner with GameOn
              </span>
              <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-[1.1] tracking-tight">
                Grow your <br/>
                <span className="text-blue-600 underline decoration-blue-200 underline-offset-8">Sports Venue.</span>
              </h1>
              <p className="text-lg text-gray-500 font-medium leading-relaxed">
                Join India&apos;s fastest-growing sports infrastructure network. We handle the bookings, you handle the game.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/contact-support" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
                  List Your Venue <ArrowRight className="w-5 h-5" />
                </a>
                <div className="flex items-center gap-3 px-6 py-4 bg-white border border-gray-100 rounded-2xl">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm font-bold text-gray-900">82% Revenue Share</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl shadow-blue-100 border-8 border-white">
                <img 
                  src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000&auto=format&fit=crop" 
                  alt="Sports Venue" 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating Stat Card */}
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl border border-gray-100 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Updates</span>
                </div>
                <p className="text-2xl font-black text-gray-900">+140%</p>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-tight">Avg. Revenue Growth</p>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-blue-100 rounded-full blur-3xl opacity-30 pointer-events-none" />
      </section>

      {/* ── BENEFITS ── */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl font-black text-gray-900">Why partner with us?</h2>
            <p className="text-gray-500 font-medium">We provide the tools, you provide the space.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 hover:border-blue-200 hover:bg-white hover:shadow-xl hover:shadow-blue-50 transition-all group"
              >
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm font-medium">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVENUE MODEL ── */}
      <section className="py-20 lg:py-32 bg-gray-900 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white/5 backdrop-blur-md rounded-[3.5rem] p-10 lg:p-20 border border-white/10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">India&apos;s Most <br/>Partner-Friendly Model.</h2>
                <div className="space-y-6">
                  {[
                    "82% share on every single booking",
                    "Weekly automated payouts to your bank",
                    "Zero upfront listing or setup fees",
                    "Full control over your pricing and slots"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 text-gray-300">
                      <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-center lg:text-right">
                <div className="inline-block bg-gradient-to-br from-blue-600 to-blue-800 p-12 rounded-[3rem] shadow-2xl shadow-blue-500/20">
                  <p className="text-blue-100 text-sm font-black uppercase tracking-[0.3em] mb-4">You Keep</p>
                  <p className="text-8xl font-black text-white tracking-tighter">82%</p>
                  <p className="text-blue-200 text-xs font-bold mt-4 uppercase tracking-widest">Of every booking</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />
      </section>

      {/* ── FAQ PREVIEW ── */}
      <section className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <h2 className="text-4xl font-black text-gray-900">Frequently Asked Questions</h2>
          <div className="space-y-4 text-left">
            {[
              { q: "When do I get my money?", a: "All earnings are settled weekly directly into your registered bank account via automated IMPS/NEFT." },
              { q: "Can I manage multiple venues?", a: "Yes, our dashboard allows you to manage multiple turfs or facilities from a single owner account." },
              { q: "What if I have an existing offline booking?", a: "You can 'Block' slots on the GameOn Dashboard at any time to prevent double bookings." }
            ].map((faq, i) => (
              <div key={i} className="p-8 bg-gray-50 rounded-3xl border border-gray-100">
                <h4 className="font-bold text-gray-900 mb-2">{faq.q}</h4>
                <p className="text-gray-500 text-sm font-medium">{faq.a}</p>
              </div>
            ))}
          </div>
          <div className="pt-8">
            <a href="/contact-support" className="inline-flex items-center gap-2 text-blue-600 font-black uppercase tracking-widest text-sm hover:gap-4 transition-all">
              Talk to a Partner Manager <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
