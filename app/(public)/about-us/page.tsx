"use client";

import { motion, Variants } from 'framer-motion';
import { 
  Target, Rocket, MapPin, Heart, 
  Users, Mail, Phone, Globe, 
  CheckCircle2, ChevronRight
} from 'lucide-react';
import Link from 'next/link';

// Custom SVG Icons to replace the missing Lucide brand icons
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);

export default function AboutPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
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
      <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-emerald-600 uppercase bg-emerald-100 rounded-full">
              About Us — GameOn
            </span>
            <h1 className="text-5xl lg:text-7xl font-black text-gray-900 mb-8 leading-[1.1]">
              Making Sports <span className="text-emerald-600 underline decoration-emerald-200 underline-offset-8">Accessible</span> to Every Indian.
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed font-medium">
              That single sentence is why GameOn exists. We&apos;re here to remove the friction between you and the field.
            </p>
          </motion.div>
        </div>
        
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-emerald-100 rounded-full blur-3xl opacity-30 pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[500px] h-[500px] bg-blue-100 rounded-full blur-3xl opacity-30 pointer-events-none" />
      </section>

      {/* ── 2. OUR MISSION ── */}
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
              <motion.div variants={itemVariants} className="inline-flex items-center gap-3 p-2 bg-emerald-50 rounded-2xl text-emerald-600">
                <Target className="w-6 h-6" />
                <span className="font-bold uppercase tracking-wider text-sm">Our Mission</span>
              </motion.div>
              <motion.h2 variants={itemVariants} className="text-4xl font-black text-gray-900 leading-tight">
                Why we started GameOn
              </motion.h2>
              <motion.div variants={itemVariants} className="space-y-6 text-gray-600 leading-relaxed text-lg">
                <p>
                  If you have ever tried to play a 90-minute game of football, badminton, or cricket in your 
                  city on a weekend, you already know the problem.
                </p>
                <p>
                  You don&apos;t know which grounds are near you. The ones you do know are either full, closed, or impossible to reach on the phone. You 
                  end up on three different WhatsApp groups asking friends for numbers. By the time you&apos;ve sorted it out, the slot is gone.
                </p>
                <p className="font-bold text-gray-900 border-l-4 border-emerald-500 pl-6 py-2 italic">
                  &quot;It shouldn&apos;t be that hard.&quot;
                </p>
                <p>
                  India has more than 100 million recreational athletes who want to play more often. The friction sits between them and the field. GameOn&apos;s job is to remove that friction.
                </p>
              </motion.div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-emerald-100"
            >
              <img 
                src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000&auto=format&fit=crop" 
                alt="Mission" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                <p className="text-white font-bold text-xl leading-snug">
                  Bridging the gap between players and the playground.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 3. WHAT WE ARE ── */}
      <section className="py-20 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto space-y-4"
          >
            <div className="inline-flex items-center gap-3 p-2 bg-blue-50 rounded-2xl text-blue-600 mx-auto">
              <Rocket className="w-6 h-6" />
              <span className="font-bold uppercase tracking-wider text-sm">What We Are</span>
            </div>
            <h2 className="text-4xl font-black text-gray-900">Your All-in-One Sports Platform</h2>
            <p className="text-gray-600 font-medium">Search, see availability, and book a slot in under four taps.</p>
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Discover Venues", desc: "Find turfs, badminton courts, cricket nets, swimming pools, and academies with real-time availability." },
              { title: "Book in 4 Taps", desc: "Pick a venue, slot, and sport. Pay and get confirmation in seconds. No more endless phone calls." },
              { title: "Find & Host Matches", desc: "Invite your team, host open matches for others to join, or join as a captain or player." },
              { title: "Manage Sporting Life", desc: "Track bookings, build your profile, save favorite venues, and stay connected to your game." }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-50 transition-all group"
              >
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-16 p-10 bg-emerald-600 rounded-[2.5rem] text-white overflow-hidden relative">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-black mb-6 leading-tight">For ground owners, GameOn is a tool — not a tax.</h3>
                <p className="text-emerald-50 leading-relaxed font-medium">
                  We pay the highest commission share in India to our venue partners, because the people who own the field deserve more than the platform that lists it. Spend less time on paper and more time running your venue.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 text-center">
                  <div className="text-4xl font-black mb-1">82%</div>
                  <div className="text-xs font-bold uppercase tracking-wider opacity-80">Highest Payout</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 text-center">
                  <div className="text-4xl font-black mb-1">UPI</div>
                  <div className="text-xs font-bold uppercase tracking-wider opacity-80">Faster Settlement</div>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          </div>
        </div>
      </section>

      {/* ── 4. WHERE WE STARTED ── */}
      <section className="py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-3 p-2 bg-orange-50 rounded-2xl text-orange-600">
                <MapPin className="w-6 h-6" />
                <span className="font-bold uppercase tracking-wider text-sm">Where We Started</span>
              </div>
              <h2 className="text-4xl font-black text-gray-900">National Vision, City-by-City Execution.</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                GameOn is built in <span className="font-bold text-gray-900">Delhi NCR</span>, launching in Delhi, Noida, Gurgaon, and Ghaziabad first. We chose NCR because it is one of the densest sporting markets in India with more than 25 million people.
              </p>
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Expansion Roadmap</h4>
                <div className="flex flex-wrap gap-3">
                  {['Bengaluru', 'Mumbai', 'Hyderabad', 'Pune', 'Chandigarh'].map(city => (
                    <div key={city} className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-bold text-gray-700 flex items-center gap-2">
                      <ChevronRight className="w-3 h-3 text-emerald-500" /> {city}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
            <div className="relative">
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 gap-4"
              >
                <div className="space-y-4">
                  <div className="aspect-[3/4] bg-emerald-100 rounded-3xl overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1544698310-74ea9d1c8258?q=80&w=800" alt="NCR Sports" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                  </div>
                  <div className="aspect-square bg-emerald-600 rounded-3xl flex items-center justify-center p-8 text-white">
                    <div className="text-center">
                      <div className="text-5xl font-black mb-2">25M</div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">NCR Market Reach</div>
                    </div>
                  </div>
                </div>
                <div className="pt-12 space-y-4">
                  <div className="aspect-square bg-blue-600 rounded-3xl flex items-center justify-center p-8 text-white">
                    <div className="text-center">
                      <div className="text-3xl font-black mb-2">INDIA FIRST</div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Built for our culture</div>
                    </div>
                  </div>
                  <div className="aspect-[3/4] bg-gray-200 rounded-3xl overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?q=80&w=800" alt="Indian Turf" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. WHY WE DO IT THIS WAY ── */}
      <section className="py-20 lg:py-32 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 text-center">
          <div className="inline-flex items-center gap-3 p-2 bg-emerald-500/10 rounded-2xl text-emerald-400 mb-6">
            <Heart className="w-6 h-6" />
            <span className="font-bold uppercase tracking-wider text-sm">Why We Do It This Way</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black leading-tight">Three principles drive how we build.</h2>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {[
              { 
                title: "Players first.", 
                desc: "Every product decision passes a simple test: does it help a player play sooner, more often, or with better company? If the answer is yes, we ship it." 
              },
              { 
                title: "Partners, not inventory.", 
                desc: "We don't squeeze small business owners. We share 82% of every booking back to the venue, the highest payout in India. No hidden fees or exclusivity locks." 
              },
              { 
                title: "India-first, not imitating.", 
                desc: "Built for how Indians actually play — with UPI, in Hinglish, on patchy 4G. We don't paste a US sports app over India and hope it works." 
              }
            ].map((principle, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] hover:bg-white/10 transition-all"
              >
                <div className="text-emerald-400 text-4xl font-black mb-6">0{idx + 1}</div>
                <h3 className="text-2xl font-black mb-6">{principle.title}</h3>
                <p className="text-gray-400 leading-relaxed font-medium">{principle.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. WHO WE ARE ── */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 p-2 bg-emerald-50 rounded-2xl text-emerald-600">
                <Users className="w-6 h-6" />
                <span className="font-bold uppercase tracking-wider text-sm">Who We Are</span>
              </div>
              <h2 className="text-4xl font-black text-gray-900 leading-tight">GameOn Sports Services Private Limited</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p className="font-bold text-gray-400 text-sm tracking-widest uppercase">CIN U93290UW2026PTC252581</p>
                <p>Incorporated on 4 May 2026 and headquartered in Ghaziabad, Uttar Pradesh.</p>
                <p>We are a small team in our first year. We are also a hiring team — if you build, design, run growth campaigns, or manage venue partnerships, write to us.</p>
              </div>
              
              <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center font-black text-gray-900">ST</div>
                  <div>
                    <h4 className="font-bold text-gray-900">Shivam Tiwari</h4>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Founder & CEO</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center font-black text-gray-900">VM</div>
                  <div>
                    <h4 className="font-bold text-gray-900">Vijay Prakash Mishra</h4>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Director</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 p-10 lg:p-16 rounded-[3rem] space-y-10">
              <h3 className="text-2xl font-black text-gray-900">Stay Connected</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                      <Globe className="w-5 h-5" />
                    </div>
                    <Link href="https://www.gameon-india.com" className="text-sm font-bold text-gray-700 hover:text-emerald-600 transition-colors">gameon-india.com</Link>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                      <InstagramIcon className="w-5 h-5" />
                    </div>
                    <Link href="https://instagram.com/_gameon_india" className="text-sm font-bold text-gray-700 hover:text-emerald-600 transition-colors">@_gameon_india</Link>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                      <TwitterIcon className="w-5 h-5" />
                    </div>
                    <Link href="https://x.com/game_on_india" className="text-sm font-bold text-gray-700 hover:text-emerald-600 transition-colors">@game_on_india</Link>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                      <Mail className="w-5 h-5" />
                    </div>
                    <a href="mailto:support@gameon-india.com" className="text-sm font-bold text-gray-700 hover:text-emerald-600 transition-colors">support@gameon-india.com</a>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                      <Phone className="w-5 h-5" />
                    </div>
                    <a href="tel:+918896172818" className="text-sm font-bold text-gray-700 hover:text-emerald-600 transition-colors">+91 88961 72818</a>
                  </div>
                </div>
              </div>
              <div className="pt-8 border-t border-emerald-200/50">
                <p className="text-gray-500 text-sm leading-relaxed italic">
                  If you have a venue you&apos;d like to list, a sport we don&apos;t yet support, or just a story — write to us. We read everything.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. FOOTER CTA ── */}
      <section className="py-20 bg-white border-t border-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-6xl font-black text-gray-900 mb-8">Let&apos;s get more of India playing.</h2>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/explore" className="px-10 py-5 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all hover:shadow-xl hover:shadow-emerald-100">
              Explore Venues
            </Link>
            <Link href="/contact" className="px-10 py-5 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all hover:shadow-xl hover:shadow-gray-100">
              List Your Venue
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}