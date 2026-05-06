'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle2 } from 'lucide-react';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EnquiryModal({ isOpen, onClose }: EnquiryModalProps) {
 const [formData, setFormData] = useState({
  name: '',
  email: '',
  phone: '',
  projectType: 'residential', // ✅ ADD THIS
  message: ''
});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollBarGap = window.innerWidth - document.documentElement.clientWidth;

    if (scrollBarGap > 0) {
      document.body.style.paddingRight = `${scrollBarGap}px`;
    }
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const API_URL =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const response = await fetch(`${API_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
  name: formData.name,
  email: formData.email,
  phone: formData.phone,
  subject: 'Website Enquiry',
  message: formData.message,
  projectType: formData.projectType, // ✅ SAME AS FOOTER
  budget: 'not-sure'
})
    });

    const data = await response.json(); // ✅ IMPORTANT

    if (response.ok && data.success) {
      setSubmitted(true);

      setTimeout(() => {
        onClose();
        setSubmitted(false);
      setFormData({
  name: '',
  email: '',
  phone: '',
  projectType: 'residential', // ✅ KEEP THIS
  message: ''
});
      }, 2500);
    } else {
      console.error('API Error:', data.message);
      alert(data.message || 'Form submission failed');
    }
  } catch (error) {
    console.error('Error submitting enquiry:', error);
    alert('Something went wrong. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center  justify-center p-4 sm:p-6">
          
          {/* Blur Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-950/20 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white shadow-2xl rounded-sm flex flex-col md:flex-row"
          >
            {/* Close Button (Absolute Top Right) */}
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 z-20 p-2 text-zinc-400 hover:text-slate-900 transition-colors bg-white/50 backdrop-blur-md rounded-full md:bg-transparent md:backdrop-blur-none"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Side: Visual & Minimal Text */}
            <div className="hidden md:flex md:w-2/5 relative bg-zinc-900 items-center justify-center p-10 text-center overflow-hidden">
              {/* Background Image */}
              <img 
                src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Architecture Setup" 
                className="absolute inset-0 w-full h-full object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 to-zinc-900/90"></div>
              
              <div className="relative z-10">
                <h2 className="text-3xl font-serif text-white mb-4 leading-snug">Let's build<br/>your vision.</h2>
                <div className="w-12 h-px bg-[#a68a6b] mx-auto mb-5"></div>
                <p className="text-zinc-400 font-light text-sm leading-relaxed">
                  Provide a few details, and our lead architects will be in touch shortly.
                </p>
              </div>
            </div>

            {/* Right Side: The Form */}
            <div className="w-full md:w-3/5 h-full p-8 sm:p-12 relative bg-white overflow-y-auto">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="mb-6">
                    <h3 className="text-2xl font-serif text-slate-900 md:hidden mb-2">Let's Talk</h3>
                    <p className="text-zinc-500 text-sm font-light md:hidden">Provide a few details below.</p>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1.5 font-bold">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="John Doe"
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-sm focus:border-[#a68a6b] focus:ring-1 focus:ring-[#a68a6b] outline-none transition-all text-sm text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1.5 font-bold">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="john@example.com"
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-sm focus:border-[#a68a6b] focus:ring-1 focus:ring-[#a68a6b] outline-none transition-all text-sm text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1.5 font-bold">Phone (Optional)</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (234) 567-890"
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-sm focus:border-[#a68a6b] focus:ring-1 focus:ring-[#a68a6b] outline-none transition-all text-sm text-slate-900"
                    />
                  </div>
                  

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1.5 font-bold">Project Brief</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={3}
                      required
                      placeholder="Tell us a bit about your project..."
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-sm focus:border-[#a68a6b] focus:ring-1 focus:ring-[#a68a6b] outline-none transition-all text-sm text-slate-900 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 bg-slate-900 hover:bg-[#a68a6b] text-white py-3.5 rounded-sm font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Enquiry
                        <Send className="w-3.5 h-3.5 ml-1" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Success State */
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    className="w-16 h-16 bg-[#a68a6b]/10 rounded-full flex items-center justify-center mb-6"
                  >
                    <CheckCircle2 className="w-8 h-8 text-[#a68a6b]" />
                  </motion.div>
                  <h3 className="text-2xl font-serif text-slate-900 mb-2">Message Sent</h3>
                  <p className="text-zinc-500 text-sm font-light">
                    Thank you for reaching out. Our team will contact you shortly.
                  </p>
                </div>
              )}
            </div>
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}