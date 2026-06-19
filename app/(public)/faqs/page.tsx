"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, MessageCircle, HelpCircle, ArrowRight } from 'lucide-react';

const faqCategories = [
  {
    name: "Bookings",
    questions: [
      {
        question: "How do I book a sports venue on GameOn?",
        answer: "Booking is simple! Just browse the venues on our Explore page, select your preferred sport, date, and time slot. Once you confirm the details and complete the payment via UPI or Cards, your booking is instantly confirmed."
      },
      {
        question: "Can I book multiple slots at once?",
        answer: "Yes, you can select multiple consecutive or non-consecutive slots for a single venue in one transaction."
      },
      {
        question: "Do I get a confirmation after booking?",
        answer: "Absolutely! You will receive an instant confirmation on the app, and a summary will be available in your 'My Bookings' section. You just need to show this at the venue."
      }
    ]
  },
  {
    name: "Payments & Refunds",
    questions: [
      {
        question: "What payment methods are supported?",
        answer: "We support all major UPI apps (Google Pay, PhonePe, Paytm), Credit/Debit Cards, and Net Banking through our secure payment partner, Razorpay."
      },
      {
        question: "What is the cancellation policy?",
        answer: "Cancellations made 24 hours or more before the slot time get a 100% refund of the venue fee. Between 12-24 hours, you get a 50% refund. Cancellations under 12 hours are non-refundable."
      },
      {
        question: "How long does it take to get a refund?",
        answer: "Once approved, refunds typically reflect in your original payment method within 5-7 business days."
      }
    ]
  },
  {
    name: "GameOn Coins",
    questions: [
      {
        question: "What are GameOn Coins?",
        answer: "GameOn Coins are our loyalty rewards. You earn 1000 coins on your first booking and 50 coins on your second booking. These can be used for discounts on future bookings."
      },
      {
        question: "How do I redeem my coins?",
        answer: "During checkout, you will see an option to apply your available GameOn Coins to get a discount on the total booking amount."
      }
    ]
  }
];

export default function FAQsPage() {
  const [openIndex, setOpenIndex] = useState<string | null>("0-0");
  const [searchQuery, setSearchQuery] = useState("");

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
              Knowledge Base
            </span>
            <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1.1]">
              Frequently Asked <br/>
              <span className="text-emerald-600 underline decoration-emerald-200 underline-offset-8">Questions.</span>
            </h1>
            
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto mt-12">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-8 py-5 bg-white border border-gray-100 shadow-xl shadow-emerald-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-gray-900 font-medium"
              />
            </div>
          </motion.div>
        </div>
        <div className="absolute top-0 left-0 -translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] bg-emerald-100 rounded-full blur-3xl opacity-30" />
      </section>

      {/* ── FAQ CONTENT ── */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {faqCategories.map((category, catIdx) => (
              <div key={catIdx} className="space-y-6">
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest flex items-center gap-3">
                  <span className="w-8 h-1 bg-emerald-500 rounded-full" />
                  {category.name}
                </h2>
                <div className="space-y-4">
                  {category.questions.map((faq, qIdx) => {
                    const id = `${catIdx}-${qIdx}`;
                    const isOpen = openIndex === id;
                    
                    // Filter logic
                    if (searchQuery && !faq.question.toLowerCase().includes(searchQuery.toLowerCase())) {
                      return null;
                    }

                    return (
                      <motion.div 
                        key={id}
                        initial={false}
                        className={`border border-gray-100 rounded-2xl transition-all duration-300 ${isOpen ? 'bg-emerald-50/30 border-emerald-100 shadow-sm' : 'hover:bg-gray-50'}`}
                      >
                        <button
                          onClick={() => setOpenIndex(isOpen ? null : id)}
                          className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
                        >
                          <span className="text-lg font-bold text-gray-900 pr-8">{faq.question}</span>
                          <div className={`shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-100 transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-600 border-emerald-100' : 'text-gray-400'}`}>
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
                              <div className="px-6 pb-6 text-gray-600 text-lg leading-relaxed font-medium">
                                {faq.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Footer */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-32 p-10 lg:p-16 bg-gray-900 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden"
          >
            <div className="relative z-10 space-y-4 text-center md:text-left">
              <h2 className="text-3xl lg:text-4xl font-black">Still have questions?</h2>
              <p className="text-gray-400 font-medium">Can&apos;t find the answer you&apos;re looking for? Please chat with our team.</p>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row gap-4">
              <a href="/contact-support" className="bg-emerald-600 hover:bg-emerald-500 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2">
                <HelpCircle className="w-5 h-5" /> Contact Us
              </a>
              <a href="/chat" className="bg-white/10 hover:bg-white/20 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2">
                <MessageCircle className="w-5 h-5" /> Live Chat
              </a>
            </div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-600/20 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
