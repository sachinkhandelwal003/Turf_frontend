"use client";

import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, Bell, CheckCircle2 } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const sections = [
    {
      id: "1",
      icon: <Shield className="w-6 h-6" />,
      title: "1. Who We Are",
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            This Privacy Policy is published by <span className="font-bold text-gray-900">GameOn Sports Services Private Limited</span>, a company incorporated under the Companies Act, 2013.
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "CIN", value: "U93290UW2026PTC252581" },
              { label: "Email", value: "support@gameon-india.com" },
              { label: "Incorporated", value: "4 May 2026" },
              { label: "Headquarters", value: "Ghaziabad, Uttar Pradesh" }
            ].map((item, i) => (
              <li key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                <p className="text-sm font-bold text-gray-900">{item.value}</p>
              </li>
            ))}
          </ul>
        </div>
      )
    },
    {
      id: "2",
      icon: <Eye className="w-6 h-6" />,
      title: "2. Personal Data We Collect",
      content: (
        <div className="space-y-6">
          <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
            <h4 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Data you give us
            </h4>
            <ul className="space-y-2 text-emerald-800 text-sm">
              <li>• Identity: Name, Date of Birth, Gender</li>
              <li>• Contact: Mobile number (OTP verified), Email</li>
              <li>• Profile: Sports interests, Skill level, Preferred venues</li>
            </ul>
          </div>
          <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
            <h4 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Data we collect automatically
            </h4>
            <ul className="space-y-2 text-emerald-800 text-sm">
              <li>• Device: OS version, Unique identifiers, IP Address</li>
              <li>• Usage: Login timestamps, Session duration, Booking history</li>
              <li>• Location: With your prior in-app permission for finding nearby turfs</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "3",
      icon: <Lock className="w-6 h-6" />,
      title: "3. How We Use Your Data",
      content: (
        <ul className="space-y-4 text-gray-600">
          <li className="flex gap-3">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0" />
            <p><span className="font-bold text-gray-900">Service Delivery:</span> To process bookings, facilitate payments via Razorpay, and manage your account.</p>
          </li>
          <li className="flex gap-3">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0" />
            <p><span className="font-bold text-gray-900">Personalization:</span> To recommend venues and matches based on your location and skill level.</p>
          </li>
          <li className="flex gap-3">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0" />
            <p><span className="font-bold text-gray-900">Communication:</span> To send booking confirmations, safety alerts, and updates about the platform.</p>
          </li>
        </ul>
      )
    },
    {
      id: "4",
      icon: <FileText className="w-6 h-6" />,
      title: "4. Data Sharing & Security",
      content: (
        <div className="space-y-4 text-gray-600">
          <p>We share your data with <span className="font-bold text-gray-900">Venue Partners</span> only to the extent necessary for your booking (e.g., your name and contact for entry). We use industry-standard encryption to protect your information.</p>
          <div className="p-4 border-l-4 border-emerald-500 bg-gray-50 italic text-sm">
            GameOn does not sell your personal data to third-party advertisers.
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-white selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header */}
      <section className="bg-gradient-to-b from-emerald-50/50 to-white py-20 lg:py-32 overflow-hidden relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
              <Lock className="w-3.5 h-3.5" /> Trust & Privacy
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tight">
              Privacy <span className="text-emerald-600 underline decoration-emerald-200 underline-offset-8">Policy.</span>
            </h1>
            <div className="flex justify-center gap-6 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <p>Effective: 4 May 2026</p>
              <p>Updated: 20 May 2026</p>
            </div>
          </motion.div>
        </div>
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[500px] h-[500px] bg-emerald-100 rounded-full blur-3xl opacity-20" />
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-24">
            {sections.map((section, idx) => (
              <motion.div 
                key={section.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group"
              >
                <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                  <div className="md:w-1/4">
                    <div className="sticky top-32">
                      <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                        {section.icon}
                      </div>
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">{section.title.split('.')[1].trim()}</h3>
                    </div>
                  </div>
                  <div className="md:w-3/4">
                    <h2 className="text-3xl font-black text-gray-900 mb-8 leading-tight">{section.title}</h2>
                    <div className="text-lg">
                      {section.content}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Grievance Footer */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-32 p-10 lg:p-16 bg-gray-900 rounded-[3rem] text-white relative overflow-hidden"
          >
            <div className="relative z-10 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                <Bell className="w-3.5 h-3.5" /> Grievance Officer
              </div>
              <h2 className="text-4xl font-black">Questions or Concerns?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-gray-400 text-sm uppercase tracking-widest font-bold mb-4 opacity-50">Officer Details</p>
                  <p className="text-xl font-bold mb-1">Shivam Tiwari</p>
                  <p className="text-emerald-400 font-medium">Founder & CEO</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm uppercase tracking-widest font-bold mb-4 opacity-50">Contact</p>
                  <a href="mailto:support@gameon-india.com" className="text-xl font-bold hover:text-emerald-400 transition-colors">support@gameon-india.com</a>
                  <p className="text-gray-500 text-sm mt-2">Response time: ~48 hours</p>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-600/20 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
