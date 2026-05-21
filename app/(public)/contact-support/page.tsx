"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Loader2, MessageSquare, Clock, Globe, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ContactSupportPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success("Message sent! Our team will get back to you soon.");
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Us",
      value: "support@gameon-india.com",
      desc: "Response within 24 hours",
      href: "mailto:support@gameon-india.com"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Call Us",
      value: "+91 88961 72818",
      desc: "Mon-Sat, 9am - 6pm",
      href: "tel:+918896172818"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Visit Us",
      value: "Ghaziabad, UP",
      desc: "KH-126, Bypass Road",
      href: "#"
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── HERO SECTION ── */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            <span className="inline-block px-4 py-1.5 mb-2 text-[10px] font-black tracking-[0.2em] text-emerald-600 uppercase bg-emerald-100 rounded-full">
              Support Center
            </span>
            <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1.1]">
              How can we <br/>
              <span className="text-emerald-600 underline decoration-emerald-200 underline-offset-8">help you?</span>
            </h1>
            <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">
              Have a question about a booking, payment, or venue? Our team is here to ensure you never miss a match.
            </p>
          </motion.div>
        </div>
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-emerald-100 rounded-full blur-3xl opacity-30" />
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
            
            {/* Left: Contact Info */}
            <div className="space-y-12">
              <div className="space-y-8">
                <h2 className="text-3xl font-black text-gray-900">Get in touch.</h2>
                <div className="space-y-6">
                  {contactInfo.map((item, idx) => (
                    <motion.a 
                      key={idx}
                      href={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-6 group p-4 -ml-4 rounded-2xl hover:bg-gray-50 transition-all"
                    >
                      <div className="w-14 h-14 bg-white border border-gray-100 shadow-sm rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.title}</p>
                        <p className="text-lg font-bold text-gray-900 leading-tight">{item.value}</p>
                        <p className="text-xs text-gray-500 font-medium mt-1">{item.desc}</p>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </div>

              <div className="p-8 bg-gray-900 rounded-[2.5rem] text-white space-y-6 relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-2">Corporate Office</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    GameOn Sports Services Private Limited<br/>
                    KH-126, Bypass Road, Shanti Shivpuri,<br/>
                    Ghaziabad, Uttar Pradesh — 201001
                  </p>
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Globe className="w-4 h-4" />
                    <span>www.gameon-india.com</span>
                  </div>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-600/20 rounded-full blur-3xl" />
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="lg:col-span-2">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-white border border-gray-100 shadow-2xl shadow-emerald-100 rounded-[3rem] p-8 lg:p-12"
              >
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                      <input 
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="John Doe"
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-gray-900 font-medium placeholder:text-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                      <input 
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="john@example.com"
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-gray-900 font-medium placeholder:text-gray-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject</label>
                    <input 
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      placeholder="How can we help?"
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-gray-900 font-medium placeholder:text-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Message</label>
                    <textarea 
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="Tell us more about your query..."
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-gray-900 font-medium placeholder:text-gray-300 resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 disabled:opacity-70 shadow-lg shadow-emerald-200"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</>
                    ) : (
                      <>Send Message <Send className="w-5 h-5" /></>
                    )}
                  </button>
                </form>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* ── QUICK HELP CTA ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 space-y-6">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold">Check our FAQs</h3>
              <p className="text-gray-500 font-medium">Find instant answers to common questions about bookings, cancellations, and more.</p>
              <Link href="/faqs" className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:gap-4 transition-all">
                Go to FAQs <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 space-y-6">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold">Booking Issues?</h3>
              <p className="text-gray-500 font-medium">Experiencing trouble with a live booking? Call our priority support line for instant resolution.</p>
              <a href="tel:+918896172818" className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:gap-4 transition-all">
                Call Support <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
