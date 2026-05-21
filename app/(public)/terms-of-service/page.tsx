"use client";

import { motion } from 'framer-motion';
import { Shield, Scale, Gavel, AlertCircle, FileText, Info, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function TermsOfServicePage() {
  const sections = [
    {
      id: "1",
      icon: <Info className="w-6 h-6" />,
      title: "1. About GameOn",
      content: (
        <div className="space-y-6">
          <p className="text-gray-600 leading-relaxed">
            GameOn operates a Platform that allows users in India to discover, book, and pay for sports venues. We act as an intermediary under Section 2(1)(w) of the IT Act, 2000.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Legal Entity</p>
              <p className="text-sm font-bold text-gray-900">GameOn Sports Services Private Limited</p>
              <p className="text-xs text-gray-500 mt-1">CIN: U93290UW2026PTC252581</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Registered Office</p>
              <p className="text-sm font-bold text-gray-900 leading-tight">KH-126, Bypass Road, Shanti Shivpuri, Ghaziabad, UP — 201001</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "2",
      icon: <CheckCircle2 className="w-6 h-6" />,
      title: "2. Eligibility",
      content: (
        <div className="space-y-4 text-gray-600">
          <p>To use GameOn, you must:</p>
          <ul className="space-y-3">
            {[
              "Be at least 18 years of age (or have guardian supervision)",
              "Provide accurate registration details",
              "Not have been previously suspended from the platform",
              "Comply with all applicable Indian laws"
            ].map((item, i) => (
              <li key={i} className="flex gap-3 items-start">
                <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                </div>
                <span className="text-sm font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )
    },
    {
      id: "3",
      icon: <Scale className="w-6 h-6" />,
      title: "3. Booking & Payments",
      content: (
        <div className="space-y-6">
          <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
            <h4 className="font-bold text-emerald-900 mb-2">Secure Payments</h4>
            <p className="text-sm text-emerald-800 leading-relaxed">
              All payments are processed by Razorpay (RBI regulated). We do not store sensitive details like CVV or PINs.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900">Cancellation Policy</h4>
            <div className="overflow-hidden rounded-2xl border border-gray-100">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-4">Timeframe</th>
                    <th className="px-6 py-4">Refund</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-6 py-4 font-medium">24h or more before</td>
                    <td className="px-6 py-4 text-emerald-600 font-bold">100% Refund</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium">12h to 24h before</td>
                    <td className="px-6 py-4 text-orange-600 font-bold">50% Refund</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium">Less than 12h before</td>
                    <td className="px-6 py-4 text-red-600 font-bold">No Refund</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 italic font-medium">
              * Convenience fees are non-refundable. Refunds take 5-7 business days.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "4",
      icon: <Gavel className="w-6 h-6" />,
      title: "4. User Conduct",
      content: (
        <p className="text-gray-600 leading-relaxed">
          Users must respect venue rules, maintain sportsmanship, and not engage in any illegal activities on the platform or at the venues. We reserve the right to terminate accounts for misconduct.
        </p>
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
              <Shield className="w-3.5 h-3.5" /> Legal Framework
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tight">
              Terms of <span className="text-emerald-600 underline decoration-emerald-200 underline-offset-8">Service.</span>
            </h1>
            <div className="flex justify-center gap-6 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <p>Effective: 4 May 2026</p>
              <p>Last Updated: 20 May 2026</p>
            </div>
          </motion.div>
        </div>
        <div className="absolute top-0 left-0 -translate-y-1/4 -translate-x-1/4 w-[500px] h-[500px] bg-emerald-100 rounded-full blur-3xl opacity-20" />
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
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Section {section.id}</h3>
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

          {/* Contact CTA */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-32 p-10 lg:p-16 bg-gray-900 rounded-[3rem] text-white text-center"
          >
            <h2 className="text-4xl font-black mb-6">Need Clarification?</h2>
            <p className="text-gray-400 mb-10 max-w-lg mx-auto font-medium">
              If you have any questions about these terms, our support team is ready to help you out.
            </p>
            <a 
              href="mailto:support@gameon-india.com" 
              className="inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all"
            >
              Contact Support <ArrowRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
