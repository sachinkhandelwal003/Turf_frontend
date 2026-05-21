"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Lock, Eye, FileText, 
  Bell, CheckCircle2, Info, Scale, 
  Users, Globe, ShieldCheck, HelpCircle,
  ChevronDown, Search
} from 'lucide-react';
import { useState } from 'react';

const sections = [
  {
    id: "who-we-are",
    title: "1. Who We Are",
    icon: <Shield className="w-6 h-6" />,
    content: (
      <div className="space-y-4">
        <p className="text-gray-600 leading-relaxed">
          This Privacy Policy is published by <span className="font-bold text-gray-900">GameOn Sports Services Private Limited</span> ("GameOn", "we", "us", "our"), a company incorporated under the Companies Act, 2013.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "CIN", value: "U93290UW2026PTC252581" },
            { label: "Incorporated", value: "4 May 2026" },
            { label: "Registered Office", value: "KH-126, Bypass Road, Shanti Shivpuri, Ghaziabad, UP — 201001" },
            { label: "Email", value: "support@gameon-india.com" },
            { label: "Phone", value: "+91 88961 72818" }
          ].map((item, i) => (
            <div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
              <p className="text-sm font-bold text-gray-900">{item.value}</p>
            </div>
          ))}
        </div>
        <p className="text-gray-600 leading-relaxed italic text-sm">
          We are the data fiduciary under the Digital Personal Data Protection Act, 2023 ("DPDP Act") and comply with IT Act, 2000.
        </p>
      </div>
    )
  },
  {
    id: "scope",
    title: "2. Scope and Acceptance",
    icon: <Info className="w-6 h-6" />,
    content: (
      <div className="space-y-4">
        <p className="text-gray-600 leading-relaxed">
          By using the GameOn Platform, you confirm that you have read, understood, and agreed to this Privacy Policy. This Policy applies to all Users, Venue Partners, and Visitors.
        </p>
        <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
          <h4 className="font-bold text-emerald-900 mb-3">Policy applies to:</h4>
          <ul className="space-y-2 text-emerald-800 text-sm">
            <li>• Registered users booking venues or joining matches</li>
            <li>• Venue Partners listing facilities</li>
            <li>• Website visitors and data providers</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: "data-collected",
    title: "3. Personal Data We Collect",
    icon: <Eye className="w-6 h-6" />,
    content: (
      <div className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-bold text-gray-900">3.1 Data you give us directly</h4>
          <ul className="grid grid-cols-1 gap-2 text-sm text-gray-600">
            <li className="flex gap-2"><strong>Identity:</strong> Name, DOB, Gender, Profile photo.</li>
            <li className="flex gap-2"><strong>Contact:</strong> Mobile (OTP verified), Email, Address.</li>
            <li className="flex gap-2"><strong>Sports:</strong> Interests, Skill level, Match history.</li>
            <li className="flex gap-2"><strong>Booking:</strong> Venues, Slots, Transaction details.</li>
          </ul>
        </div>
        <div className="space-y-4">
          <h4 className="font-bold text-gray-900">3.2 Data we collect automatically</h4>
          <ul className="grid grid-cols-1 gap-2 text-sm text-gray-600">
            <li className="flex gap-2"><strong>Device:</strong> Model, OS, Unique identifiers.</li>
            <li className="flex gap-2"><strong>Usage:</strong> IP address, Timestamps, Search queries.</li>
            <li className="flex gap-2"><strong>Location:</strong> Precise GPS (with prior in-app permission).</li>
          </ul>
        </div>
        <div className="p-4 border-l-4 border-emerald-500 bg-emerald-50 text-emerald-800 text-sm font-medium">
          We use Razorpay for payments. We never see or store your full card number, CVV, or UPI PIN.
        </div>
      </div>
    )
  },
  {
    id: "how-we-use",
    title: "4. How We Use Your Data",
    icon: <CheckCircle2 className="w-6 h-6" />,
    content: (
      <div className="space-y-4">
        <p className="text-gray-600 leading-relaxed">
          We use your data to operate the platform, process payments, and improve your experience.
        </p>
        <div className="overflow-hidden rounded-2xl border border-gray-100">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Purpose</th>
                <th className="px-4 py-3">Legal Basis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-4 py-3 font-medium">Account & Bookings</td>
                <td className="px-4 py-3">Performance of contract</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Payments & Refunds</td>
                <td className="px-4 py-3">Contract; Tax law</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Personalization</td>
                <td className="px-4 py-3">Legitimate interests; Consent</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Marketing</td>
                <td className="px-4 py-3">Opt-in consent only</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  },
  {
    id: "sharing",
    title: "5. Sharing of Personal Data",
    icon: <Users className="w-6 h-6" />,
    content: (
      <div className="space-y-4">
        <p className="text-gray-900 font-bold">We do not sell your personal data to anyone, ever.</p>
        <ul className="space-y-3 text-sm text-gray-600">
          <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" /> Shared with <strong>Venue Partners</strong> for confirmed bookings.</li>
          <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" /> Shared with <strong>Razorpay</strong> for payment processing.</li>
          <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" /> Shared with <strong>Cloud Providers</strong> (AWS) for hosting.</li>
        </ul>
      </div>
    )
  },
  {
    id: "retention",
    title: "6. Data Retention",
    icon: <Scale className="w-6 h-6" />,
    content: (
      <div className="space-y-4">
        <p className="text-gray-600 text-sm">We retain data as long as necessary for services and legal compliance.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tax Records</p>
            <p className="text-sm font-bold text-gray-900">8 Years (Statutory)</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Inactive Accounts</p>
            <p className="text-sm font-bold text-gray-900">24 Months Inactivity</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "grievance",
    title: "7. Grievance Officer",
    icon: <Bell className="w-6 h-6" />,
    content: (
      <div className="space-y-4">
        <p className="text-gray-600 text-sm">For any privacy concerns or grievances:</p>
        <div className="bg-gray-900 text-white p-6 rounded-[2rem] space-y-4">
          <div>
            <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-1">Grievance Officer</p>
            <p className="text-lg font-bold">Shivam Tiwari</p>
            <p className="text-gray-400 text-xs">Founder & CEO</p>
          </div>
          <div>
            <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-1">Contact</p>
            <p className="text-lg font-bold">support@gameon-india.com</p>
            <p className="text-gray-400 text-xs">Response time: ~48 hours</p>
          </div>
        </div>
      </div>
    )
  }
];

export default function PrivacyPolicyPage() {
  const [openIndex, setOpenIndex] = useState<string | null>("who-we-are");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* ── HERO SECTION ── */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-b from-emerald-50 to-white border-b border-emerald-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
              <Lock className="w-3.5 h-3.5" /> Trust & Privacy
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1.1]">
              Privacy <span className="text-emerald-600 underline decoration-emerald-200 underline-offset-8">Policy.</span>
            </h1>
            <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">
              We value your trust. This policy explains how we collect, use, and protect your data at GameOn.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto mt-12">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text"
                placeholder="Search privacy terms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-8 py-5 bg-white border border-emerald-100 shadow-xl shadow-emerald-100/20 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-gray-900 font-medium"
              />
            </div>
          </motion.div>
        </div>
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-emerald-100 rounded-full blur-3xl opacity-30 pointer-events-none" />
      </section>

      {/* ── CONTENT ── */}
      <section className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {sections.map((section, idx) => {
              const isOpen = openIndex === section.id;
              
              if (searchQuery && !section.title.toLowerCase().includes(searchQuery.toLowerCase())) {
                return null;
              }

              return (
                <motion.div 
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className={`group border border-emerald-50 rounded-3xl transition-all duration-300 ${isOpen ? 'bg-emerald-50/20 border-emerald-200 shadow-sm' : 'hover:bg-gray-50'}`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : section.id)}
                    className="w-full flex justify-between items-center p-6 lg:p-8 text-left focus:outline-none"
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-emerald-600 text-white' : 'bg-white border border-emerald-100 text-emerald-600 shadow-sm'}`}>
                        {section.icon}
                      </div>
                      <h2 className="text-xl lg:text-2xl font-black text-gray-900 tracking-tight">{section.title}</h2>
                    </div>
                    <div className={`shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center border border-emerald-100 transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-600 shadow-md' : 'text-gray-400'}`}>
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="px-6 lg:px-8 pb-8 lg:pb-12 pt-2 ml-0 lg:ml-18">
                          <div className="h-px bg-emerald-100 w-full mb-8 opacity-50" />
                          <div className="text-lg">
                            {section.content}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Footer Meta */}
          <div className="mt-20 flex flex-col sm:flex-row justify-center gap-8 text-xs font-bold text-gray-400 uppercase tracking-widest border-t border-gray-100 pt-10">
            <p>Effective: 4 May 2026</p>
            <p>Last Updated: 20 May 2026</p>
            <p>© GameOn Sports Services Pvt Ltd</p>
          </div>

          {/* Contact CTA */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-32 p-10 lg:p-16 bg-emerald-600 rounded-[3rem] text-white text-center relative overflow-hidden"
          >
            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl lg:text-4xl font-black">Questions about Privacy?</h2>
              <p className="text-emerald-100 max-w-xl mx-auto font-medium">
                Our team is committed to your data security. If you have any questions, reach out to our Grievance Officer.
              </p>
              <div className="pt-4">
                <a 
                  href="mailto:support@gameon-india.com" 
                  className="inline-flex items-center gap-3 bg-white text-emerald-600 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-emerald-50 transition-all shadow-xl shadow-emerald-900/20"
                >
                  Contact Support <ShieldCheck className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
