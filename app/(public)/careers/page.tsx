"use client";

import { motion, Variants } from 'framer-motion';
import { 
  Briefcase, Send, Rocket, 
  Mail, MapPin, Globe, 
  Code, Palette, TrendingUp, Users, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

export default function CareersPage() {
  // Fix 1: Added ': Variants' type to framer-motion variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ── 1. HERO SECTION ── */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-blue-600 uppercase bg-blue-100 rounded-full">
              Careers at GameOn
            </span>
            <h1 className="text-5xl lg:text-7xl font-black text-gray-900 mb-8 leading-[1.1]">
              We&apos;re <span className="text-blue-600 underline decoration-blue-200 underline-offset-8">Hiring.</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed font-medium">
              Join the team building India&apos;s most ground-owner-friendly, player-first sports booking platform.
            </p>
          </motion.div>
        </div>
        
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-blue-100 rounded-full blur-3xl opacity-30 pointer-events-none" />
      </section>

      {/* ── 2. OUR VISION ── */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-8"
            >
              <motion.div variants={itemVariants} className="inline-flex items-center gap-3 p-2 bg-blue-50 rounded-2xl text-blue-600">
                <Rocket className="w-6 h-6" />
                <span className="font-bold uppercase tracking-wider text-sm">Join the Early Team</span>
              </motion.div>
              <motion.h2 variants={itemVariants} className="text-4xl font-black text-gray-900 leading-tight">
                Help an entire country play more sport.
              </motion.h2>
              <motion.div variants={itemVariants} className="space-y-6 text-gray-600 leading-relaxed text-lg">
                <p>
                  GameOn is building India&apos;s most ground-owner-friendly, player-first sports booking platform. 
                </p>
                <p>
                  We are a small, early team in our first year, headquartered in Ghaziabad and launching across Delhi, Noida, and Gurgaon. 
                </p>
                <p className="font-bold text-gray-900 border-l-4 border-blue-500 pl-6 py-2">
                  The product, the partnerships, and the culture are still being shaped — which means the people who join now actually get to shape them.
                </p>
                <p>
                  If you&apos;ve ever wanted to help an entire country play more sport — and you can build, design, sell, market, or run operations on the ground — we&apos;d love to hear from you.
                </p>
              </motion.div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative aspect-video lg:aspect-square rounded-[3rem] overflow-hidden shadow-2xl shadow-blue-100"
            >
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000&auto=format&fit=crop" 
                alt="Working at GameOn" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent flex items-end p-10">
                <p className="text-white font-bold text-2xl leading-tight">
                  Shape the future of Indian sports infrastructure.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 3. ROLES WE LOOK FOR ── */}
      <section className="py-20 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto space-y-4"
          >
            <div className="inline-flex items-center gap-3 p-2 bg-emerald-50 rounded-2xl text-emerald-600 mx-auto">
              <Briefcase className="w-6 h-6" />
              <span className="font-bold uppercase tracking-wider text-sm">Who We&apos;re Looking For</span>
            </div>
            <h2 className="text-4xl font-black text-gray-900">Always looking for talent in:</h2>
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Code, title: "Engineering", desc: "Build robust, scalable systems for UPI payments, real-time booking, and a seamless mobile experience." },
              { icon: Palette, title: "Design", desc: "Craft an India-first UI that works across diverse user demographics and network conditions." },
              { icon: TrendingUp, title: "Growth & Marketing", desc: "Scale GameOn across NCR and beyond through community-led growth and smart partnerships." },
              { icon: Users, title: "Operations", desc: "Manage venue partnerships on the ground and ensure a world-class experience for our partners." }
            ].map((role, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-8 rounded-[2.5rem] border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-all group"
              >
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <role.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{role.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{role.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. HOW TO APPLY ── */}
      <section className="py-20 lg:py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900 rounded-[3.5rem] p-10 lg:p-20 text-white relative overflow-hidden">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-3 p-2 bg-blue-500/10 rounded-2xl text-blue-400">
                  <Send className="w-6 h-6" />
                  <span className="font-bold uppercase tracking-wider text-sm">How to Apply</span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-black leading-tight">Ready to play? <br/>Write to us.</h2>
                <div className="space-y-6 text-gray-400 font-medium">
                  <p>Send your application to <a href="mailto:support@gameon-india.com" className="text-blue-400 underline decoration-blue-400/30 underline-offset-4 hover:text-blue-300 transition-colors">support@gameon-india.com</a> with:</p>
                  <ul className="space-y-4">
                    {[
                      "A short note on what you'd want to work on at GameOn and why",
                      "Your CV, GitHub, portfolio, or anything that shows what you've done",
                      "The earliest you could start and where you're currently based"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-1" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="pt-4 text-sm italic">We read every email. You&apos;ll hear back from a human, usually within 5 business days.</p>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm p-10 rounded-[3rem] border border-white/10 space-y-8">
                <h3 className="text-2xl font-bold">Contact Details</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-blue-400">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white mb-1 uppercase tracking-widest opacity-50">Headquarters</p>
                      <p className="text-sm leading-relaxed">
                        GameOn Sports Services Private Limited <br/>
                        KH-126, Bypass Road, Shanti Shivpuri, <br/>
                        Ghaziabad, Uttar Pradesh — 201001
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-blue-400">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white mb-1 uppercase tracking-widest opacity-50">Website</p>
                      <Link href="https://www.gameon-india.com" className="text-sm hover:text-blue-400 transition-colors">www.gameon-india.com</Link>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-blue-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white mb-1 uppercase tracking-widest opacity-50">Email</p>
                      <a href="mailto:support@gameon-india.com" className="text-sm hover:text-blue-400 transition-colors">support@gameon-india.com</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
          </div>
        </div>
      </section>

      {/* ── 5. FOOTER CTA ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-black text-gray-900 mb-8">Let&apos;s get more of India playing.</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/about-us" className="px-8 py-4 bg-gray-100 text-gray-900 rounded-2xl font-bold hover:bg-gray-200 transition-all">
              Our Story
            </Link>
            <Link href="mailto:support@gameon-india.com" className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
              Drop an Email
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}