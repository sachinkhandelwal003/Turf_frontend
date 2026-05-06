"use client";

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MapPin, Phone, Mail, ArrowRight, Calculator, Send, Loader2, Clock } from 'lucide-react';

interface ContactDetails {
  companyName: string;
  address: { street: string; city: string; state: string; zipCode: string; country: string; };
  phone: string;
  email: string;
  businessHours?: { [key: string]: { closed?: boolean; open?: string; close?: string; } };
}

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [contactDetails, setContactDetails] = useState<ContactDetails | null>(null);
  const [loadingContact, setLoadingContact] = useState(true);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', projectType: 'residential', subject: '', message: '', budget: 'not-sure'
  });
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchContactDetails = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/contact-details`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) setContactDetails(data.data);
        }
      } catch { } finally {
        setLoadingContact(false);
      }
    };
    fetchContactDetails();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsSubmitted(true);
        setFormData({ name: '', email: '', phone: '', projectType: 'residential', subject: '', message: '', budget: 'not-sure' });
        setTimeout(() => setIsSubmitted(false), 5000);
      } else {
        setErrorMessage(data.message || 'Failed to submit. Please try again.');
      }
    } catch {
      setErrorMessage('Error submitting form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full bg-[#111111] border border-white/10 text-white px-4 py-4 focus:outline-none focus:border-[#C9A96E] focus:ring-1 focus:ring-[#C9A96E] transition-colors placeholder-white/20 text-sm";
  const selectClass = inputClass;

  return (
    <div className="min-h-screen bg-[#0A0A0A]">

      {/* 1. HERO — Split layout like Studia 54 */}
      <section className="min-h-screen grid lg:grid-cols-2">

        {/* Left — Image */}
        <div className="relative hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&q=85"
            alt="Architecture"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0A0A0A]/30" />

          {/* Overlay text on image */}
          <div className="absolute bottom-16 left-12">
            <div className="h-px w-12 bg-[#C9A96E] mb-4" />
            <p className="text-white/60 text-sm font-light max-w-xs leading-relaxed">
              A place where your ideas take shape in our studio's original designs.
            </p>
          </div>
        </div>

        {/* Right — Form */}
        <div className="flex flex-col justify-center px-8 lg:px-16 xl:px-24 pt-40 pb-20 bg-[#0A0A0A]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px w-10 bg-[#C9A96E]" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#C9A96E]">Get In Touch</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-white font-serif leading-tight mb-4">
              TAKE A STEP INTO
            </h1>
            <h1 className="text-4xl sm:text-6xl font-black text-[#C9A96E] font-serif leading-tight mb-10">
              OUR WORLD
            </h1>

            <p className="text-white/40 text-base font-light mb-10">
              Fill out the form and our manager will contact you within 24 hours.
            </p>

            {errorMessage && (
              <div className="mb-6 p-4 border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
                {errorMessage}
              </div>
            )}
            {isSubmitted && (
              <div className="mb-6 p-4 border border-[#C9A96E]/30 bg-[#C9A96E]/10 text-[#C9A96E] text-sm">
                ✓ Message sent successfully! We'll be in touch soon.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Your Name" className={inputClass} />
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="Email Address" className={inputClass} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone (Optional)" className={inputClass} />
                <select name="budget" value={formData.budget} onChange={handleInputChange} className={selectClass}>
                  <option value="not-sure">Budget Range</option>
                  <option value="under-5lakh">Under 5 Lakh</option>
                  <option value="5-10-lakh">5-10 Lakh</option>
                  <option value="10-25-lakh">10-25 Lakh</option>
                  <option value="25-50-lakh">25-50 Lakh</option>
                  <option value="50-lakh-plus">50 Lakh+</option>
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select name="projectType" value={formData.projectType} onChange={handleInputChange} className={selectClass}>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="renovation">Renovation</option>
                  <option value="interior">Interior Design</option>
                  <option value="other">Other</option>
                </select>
                <input type="text" name="subject" value={formData.subject} onChange={handleInputChange} required placeholder="Subject / Project Title" className={inputClass} />
              </div>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={4}
                required
                placeholder="Tell us about your vision, requirements, timeline..."
                className={`${inputClass} resize-none`}
              />

              <button
                type="submit"
                disabled={isSubmitting || isSubmitted}
                className="w-full bg-[#C9A96E] hover:bg-white text-[#0A0A0A] px-8 py-5 font-black uppercase tracking-[0.3em] text-[10px] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</>
                ) : isSubmitted ? (
                  '✓ Message Sent!'
                ) : (
                  <>SEND MESSAGE <Send className="w-4 h-4" /></>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* 2. ESTIMATE CTA */}
      <section className="py-20 bg-[#111111] border-t border-white/5">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col lg:flex-row items-center justify-between gap-10 p-10 lg:p-16 border border-[#C9A96E]/20 hover:border-[#C9A96E]/50 transition-colors group"
          >
            <div className="flex items-center gap-8">
              <div className="hidden md:flex items-center justify-center w-16 h-16 border border-[#C9A96E]/30 group-hover:border-[#C9A96E] transition-colors">
                <Calculator className="w-7 h-7 text-[#C9A96E]" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white font-serif mb-2">Want a quick cost projection?</h3>
                <p className="text-white/40 font-light text-sm">Use our smart calculator for an instant estimate.</p>
              </div>
            </div>
            <Link
              href="/calculator"
              className="flex-shrink-0 bg-[#C9A96E] hover:bg-white text-[#0A0A0A] px-8 py-4 font-black uppercase tracking-[0.3em] text-[10px] transition-all duration-300 flex items-center gap-3"
            >
              Calculate Estimate <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 3. STUDIO INFO */}
      <section className="py-32 bg-[#0A0A0A]">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5">
            {[
              {
                Icon: MapPin,
                title: 'Headquarters',
                content: loadingContact ? 'Loading...' : contactDetails
                  ? `${contactDetails.address.street}, ${contactDetails.address.city}, ${contactDetails.address.state}`
                  : 'Jaipur, Rajasthan, India'
              },
              {
                Icon: Phone,
                title: 'Call Us',
                content: loadingContact ? 'Loading...' : (contactDetails?.phone || '+91 XXXXX XXXXX')
              },
              {
                Icon: Mail,
                title: 'Email Us',
                content: loadingContact ? 'Loading...' : (contactDetails?.email || 'hello@rkinterior.in')
              },
              {
                Icon: Clock,
                title: 'Business Hours',
                content: 'Mon - Fri: 09:00 - 18:00\nSat: 10:00 - 16:00\nSun: Closed'
              },
            ].map(({ Icon, title, content }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#111111] p-10 hover:bg-[#141414] group transition-colors"
              >
                <div className="w-12 h-12 border border-[#C9A96E]/20 group-hover:border-[#C9A96E] flex items-center justify-center mb-6 transition-colors">
                  <Icon className="w-5 h-5 text-[#C9A96E]" />
                </div>
                <div className="text-[9px] uppercase tracking-[0.3em] text-[#C9A96E] font-black mb-3">{title}</div>
                <p className="text-white/40 text-sm font-light leading-relaxed whitespace-pre-line">{content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}