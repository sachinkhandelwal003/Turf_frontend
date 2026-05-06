"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: "Are these estimates 100% accurate?",
    answer: "This calculator provides a highly reliable baseline estimate based on current market rates. However, final costs may vary depending on specific material choices, site conditions, and custom structural requirements."
  },
  {
    question: "What is the difference between Standard, Premium, and Luxury?",
    answer: "Standard utilizes cost-effective, durable materials. Premium introduces branded finishes, custom cabinetry, and upgraded fixtures. Luxury includes imported stones, smart home automation, bespoke furniture, and high-end architectural detailing."
  },
  {
    question: "Does this estimate include taxes and permits?",
    answer: "No, the calculated range represents the core material and labor costs. Government taxes (like GST), local building permits, and specialized architectural consulting fees are calculated separately during the formal quotation phase."
  },
  {
    question: "How do I proceed after getting my estimate?",
    answer: "Once you have your baseline estimate, you can click 'Connect With Us' or reach out via our contact page to schedule a free site consultation. Our senior architects will draft a precise, finalized quotation."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 bg-white border-t border-zinc-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
          <div className="h-1 w-20 bg-[#a68a6b] mx-auto mb-6"></div>
          <p className="text-lg text-slate-600 font-light">Everything you need to know about our estimation process and pricing.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`border rounded-md transition-colors duration-300 ${openIndex === index ? 'border-[#a68a6b] bg-amber-50/30' : 'border-zinc-200 bg-white hover:border-zinc-300'}`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
              >
                <span className="font-semibold text-slate-900">{faq.question}</span>
                <ChevronDown 
                  className={`w-5 h-5 text-[#a68a6b] transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} 
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 text-slate-600 font-light leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}