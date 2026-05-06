"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, Calculator, Receipt, ChevronRight, ChevronLeft, 
  Building2, LineChart, ShieldCheck, CheckCircle2, Home, Building, Utensils
} from 'lucide-react';

export default function CalculatorPage() {
  // --- STATE FOR MULTI-STEP FORM ---
  const [step, setStep] = useState(1);
  const [isCalculating, setIsCalculating] = useState(false);
  
  const [formData, setFormData] = useState({
    projectType: 'Residential',
    area: '',
    style: 'Premium',
    rooms: '2 BHK',
    name: '',
    email: '',
    budget: 'not-decided'
  });

  const [estimateData, setEstimateData] = useState<{
    total: number;
    baseRate: number;
    styleFactor: number;
    area: number;
  } | null>(null);

  // --- HANDLERS ---
  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelection = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const calculateEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);

    try {
      // 1. Calculate estimate locally
      const area = parseInt(formData.area) || 0;
      let baseRate = 100;
      if (formData.projectType === 'Commercial') baseRate = 120;
      if (formData.projectType === 'Restaurant') baseRate = 150;

      let styleFactor = 1.0;
      if (formData.style === 'Premium') styleFactor = 1.3;
      if (formData.style === 'Luxury') styleFactor = 1.6;

      const totalCost = area * baseRate * styleFactor;

      // Artificial delay for a "processing" feel
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setEstimateData({ total: totalCost, baseRate, styleFactor, area });

      // 2. Submit to backend API (Fire and forget)
      const estimatePayload = {
        customerName: formData.name,
        email: formData.email,
        projectType: formData.projectType.toLowerCase(),
        builtUpArea: area,
        areaUnit: 'sqft',
        qualityLevel: formData.style.toLowerCase(),
        numberOfFloors: 1,
        features: [],
        city: '',
        location: '',
        customerBudget: formData.budget
      };

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      fetch(`${API_URL}/api/estimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(estimatePayload)
      }).catch(err => console.warn('API Error, continuing locally', err));

      setIsCalculating(false);
      setStep(4); 
    } catch (error) {
      console.error('Error calculating estimate:', error);
      setIsCalculating(false);
      setStep(4);
    }
  };

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0,
    }).format(amount);
  };

  const resetCalculator = () => {
    setStep(1);
    setEstimateData(null);
  };

  // --- PAGE CONTENT DATA ---
  const stats = [
    { value: "200+", label: "Projects Delivered" },
    { value: "10k+", label: "Estimates Provided" },
    { value: "2000 Cr", label: "Value Estimated" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 font-sans selection:bg-[#a68a6b] selection:text-white">

      {/* --- HERO SPLIT SECTION WITH EMBEDDED CALCULATOR --- */}
      <main className="relative min-h-[90vh] flex items-center pt-24 pb-20 lg:pt-32 lg:pb-24 overflow-hidden bg-zinc-900">
        
        {/* Cinematic Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Architecture Background" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-900/40"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* LEFT: Copy & Value Prop */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.8 }}
              className="lg:col-span-6"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="h-[1px] w-12 bg-[#a68a6b]"></div>
                <span className="text-[#a68a6b] font-medium uppercase tracking-[0.2em] text-xs">Project Planning</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif text-white mb-6 leading-[1.1]">
                Reliable <span className="italic font-light text-zinc-400">estimates</span>,<br/> delivered instantly.
              </h1>
              
              <p className="text-lg text-zinc-400 font-light mb-12 max-w-lg leading-relaxed">
                Get detailed, highly accurate cost projections for your residential or commercial projects in under two minutes. No commitments, just clarity.
              </p>

              {/* Stats Grid inside Hero */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10 max-w-lg">
                {stats.map((stat, i) => (
                  <div key={i}>
                    <div className="text-2xl md:text-3xl font-serif text-white mb-1">{stat.value}</div>
                    <div className="text-[10px] uppercase tracking-widest text-[#a68a6b] font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* RIGHT: The Interactive Calculator Card */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-6 relative"
            >
              <div className="bg-white rounded-sm shadow-2xl overflow-hidden min-h-[550px] flex flex-col relative">
                
                {/* Visual Header / Progress Indicator */}
                <div className="bg-zinc-50 px-8 py-6 border-b border-zinc-100 shrink-0">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-serif text-xl text-slate-900">Cost Estimator</h3>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#a68a6b]">
                      {step === 4 ? 'Result' : `Step ${step} of 3`}
                    </span>
                  </div>
                  {/* Progress Line */}
                  <div className="w-full bg-zinc-200 h-1 flex">
                    <div className="bg-[#a68a6b] h-1 transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }}></div>
                  </div>
                </div>

                {/* Dynamic Form Content */}
                <div className="p-8 flex-1 flex flex-col relative">
                  <form onSubmit={step === 3 ? calculateEstimate : (e) => { e.preventDefault(); nextStep(); }} className="flex-1 flex flex-col">
                    
                    <AnimatePresence mode="wait">
                      
                      {/* --- STEP 1: SPACE --- */}
                      {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="flex-1">
                          <h2 className="text-2xl font-serif text-slate-900 mb-6">Tell us about your space</h2>
                          
                          <label className="block text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-3">Project Type</label>
                          <div className="grid grid-cols-3 gap-3 mb-8">
                            {[
                              { id: 'Residential', icon: Home },
                              { id: 'Commercial', icon: Building },
                              { id: 'Restaurant', icon: Utensils }
                            ].map((type) => (
                              <button
                                key={type.id} type="button"
                                onClick={() => handleSelection('projectType', type.id)}
                                className={`p-4 border flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
                                  formData.projectType === type.id 
                                  ? 'border-[#a68a6b] bg-[#a68a6b]/5 text-[#a68a6b]' 
                                  : 'border-zinc-200 text-zinc-500 hover:border-zinc-300'
                                }`}
                              >
                                <type.icon className="w-6 h-6 mb-1" strokeWidth={1.5} />
                                <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-center">{type.id}</span>
                              </button>
                            ))}
                          </div>

                          <label className="block text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-3">Carpet Area (Sq. Ft.)</label>
                          <input 
                            type="number" name="area" value={formData.area} onChange={handleInputChange} required min="100" placeholder="e.g. 1500" 
                            className="w-full border border-zinc-200 p-4 bg-zinc-50 focus:bg-white focus:border-[#a68a6b] focus:ring-1 focus:ring-[#a68a6b] outline-none transition-all text-lg font-light text-slate-900" 
                          />
                        </motion.div>
                      )}

                      {/* --- STEP 2: STYLE --- */}
                      {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="flex-1">
                          <h2 className="text-2xl font-serif text-slate-900 mb-6">Refine your requirements</h2>
                          
                          <label className="block text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-3">Desired Finish</label>
                          <div className="space-y-3 mb-6">
                            {[
                              { id: 'Standard', desc: 'Durable & Cost-Effective materials.' },
                              { id: 'Premium', desc: 'Branded fittings & Custom finishes.' },
                              { id: 'Luxury', desc: 'Imported materials & Bespoke detailing.' }
                            ].map((style) => (
                              <div 
                                key={style.id} onClick={() => handleSelection('style', style.id)}
                                className={`p-4 border cursor-pointer flex items-center justify-between transition-all duration-300 ${
                                  formData.style === style.id ? 'border-[#a68a6b] bg-[#a68a6b]/5' : 'border-zinc-200 hover:border-zinc-300'
                                }`}
                              >
                                <div>
                                  <div className={`font-serif text-lg mb-1 ${formData.style === style.id ? 'text-[#a68a6b]' : 'text-slate-900'}`}>{style.id}</div>
                                  <div className="text-xs text-zinc-500 font-light">{style.desc}</div>
                                </div>
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.style === style.id ? 'border-[#a68a6b]' : 'border-zinc-300'}`}>
                                  {formData.style === style.id && <div className="w-2.5 h-2.5 bg-[#a68a6b] rounded-full"></div>}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className={`transition-opacity ${formData.projectType !== 'Residential' ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                              <label className="block text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-3">Rooms</label>
                              <select name="rooms" value={formData.rooms} onChange={handleInputChange} className="w-full border border-zinc-200 p-3 bg-zinc-50 focus:bg-white focus:border-[#a68a6b] outline-none transition-all text-slate-700">
                                <option value="1 BHK">1 BHK</option>
                                <option value="2 BHK">2 BHK</option>
                                <option value="3 BHK">3 BHK</option>
                                <option value="4+ BHK">4+ BHK / Villa</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-3">Budget Range</label>
                              <select name="budget" value={formData.budget} onChange={handleInputChange} className="w-full border border-zinc-200 p-3 bg-zinc-50 focus:bg-white focus:border-[#a68a6b] outline-none transition-all text-slate-700">
                                <option value="not-decided">Undecided</option>
                                <option value="under-10lakh">Under ₹10L</option>
                                <option value="10-20-lakh">₹10L - ₹20L</option>
                                <option value="20-50-lakh">₹20L - ₹50L</option>
                                <option value="50lakh-plus">Above ₹50L</option>
                              </select>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* --- STEP 3: CONTACT --- */}
                      {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="flex-1 flex flex-col justify-center">
                          <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6">
                              <Receipt className="w-8 h-8 text-[#a68a6b]" />
                            </div>
                            <h2 className="text-3xl font-serif text-slate-900 mb-3">Where should we send this?</h2>
                            <p className="text-zinc-500 font-light">Enter your details to generate your customized estimate instantly.</p>
                          </div>
                          
                          <div className="space-y-5">
                            <div>
                              <label className="block text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-2">Full Name</label>
                              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="John Doe" className="w-full border border-zinc-200 p-4 bg-zinc-50 focus:bg-white focus:border-[#a68a6b] outline-none transition-all text-slate-900" />
                            </div>
                            <div>
                              <label className="block text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-2">Email Address</label>
                              <input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="john@example.com" className="w-full border border-zinc-200 p-4 bg-zinc-50 focus:bg-white focus:border-[#a68a6b] outline-none transition-all text-slate-900" />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* --- STEP 4: RESULTS --- */}
                      {step === 4 && estimateData && (
                        <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="flex-1 flex flex-col">
                          <div className="text-center mb-8 pt-4">
                            <h2 className="text-3xl font-serif text-slate-900 mb-2">Estimate Ready, {formData.name.split(' ')[0]}</h2>
                            <p className="text-zinc-500 font-light">Based on {formData.area} sqft {formData.projectType} space.</p>
                          </div>

                          <div className="bg-zinc-50 border border-zinc-100 p-8 text-center relative overflow-hidden mb-8">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#a68a6b] to-transparent opacity-50"></div>
                            <h3 className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold mb-3">Estimated Range</h3>
                            <div className="text-4xl lg:text-5xl font-serif text-slate-900">
                              {formatINR(estimateData.total * 0.9)} 
                              <span className="text-xl text-zinc-300 font-sans font-light mx-3">to</span> 
                              {formatINR(estimateData.total * 1.1)}
                            </div>
                          </div>

                          <div className="space-y-3 text-sm text-zinc-600 font-light mb-8 px-4">
                            <div className="flex justify-between border-b border-zinc-100 pb-2">
                              <span>Base Rate ({formData.projectType}):</span>
                              <span className="font-medium text-slate-900">₹{estimateData.baseRate}/sqft</span>
                            </div>
                            <div className="flex justify-between border-b border-zinc-100 pb-2">
                              <span>Style Multiplier ({formData.style}):</span>
                              <span className="font-medium text-slate-900">x {estimateData.styleFactor}</span>
                            </div>
                          </div>
                          
                          <div className="mt-auto">
                            <button type="button" onClick={resetCalculator} className="w-full text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-slate-900 transition-colors py-3">
                              Calculate Another Project
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Navigation Buttons (Hidden on Step 4) */}
                    {step < 4 && (
                      <div className="mt-10 flex justify-between items-center pt-6 border-t border-zinc-100 shrink-0">
                        {step > 1 ? (
                          <button type="button" onClick={prevStep} className="text-zinc-400 hover:text-slate-900 font-medium flex items-center transition-colors text-sm uppercase tracking-widest">
                            <ChevronLeft className="w-4 h-4 mr-1" /> Back
                          </button>
                        ) : <div></div>}
                        
                        <button 
                          type="submit" 
                          disabled={isCalculating || (step === 1 && !formData.area) || (step === 3 && (!formData.name || !formData.email))} 
                          className="bg-slate-900 text-white px-8 py-4 flex items-center hover:bg-[#a68a6b] transition-colors font-bold uppercase tracking-widest text-xs disabled:opacity-50 disabled:hover:bg-slate-900 group"
                        >
                          {isCalculating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : 
                          step === 3 ? 'Reveal Estimate' : 
                          <>Next Step <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></>}
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </main>

      {/* --- WHY CHOOSE US --- */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif text-slate-900 mb-4">Smarter Project Planning</h2>
            <div className="h-[1px] w-16 bg-[#a68a6b] mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: LineChart, title: "Data-Driven Precision", desc: "Our algorithm uses real-time market rates and historical project data to generate highly accurate baselines." },
              { icon: ShieldCheck, title: "Transparent Breakdown", desc: "No hidden fees or surprise costs. We provide a clear, understandable breakdown of where your budget goes." },
              { icon: Building2, title: "Expert Architecture", desc: "Every estimate serves as a foundation for our master architects to build your perfect, customized space." }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.2 }}
                  className="p-8 border border-zinc-100 hover:border-[#a68a6b]/30 transition-colors group"
                >
                  <Icon className="w-8 h-8 text-[#a68a6b] mb-6" strokeWidth={1.5} />
                  <h3 className="text-xl font-medium text-slate-900 mb-3 tracking-wide">{feature.title}</h3>
                  <p className="text-slate-500 font-light leading-relaxed">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-24 bg-zinc-50 border-t border-zinc-200">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif text-slate-900 mb-4">Frequently Asked Questions</h2>
            <div className="h-[1px] w-16 bg-[#a68a6b] mx-auto"></div>
          </div>
          <div className="space-y-4">
            {[
              { q: "Are these estimates 100% accurate?", a: "They provide a highly reliable baseline based on current market rates. Final costs vary depending on specific materials, site conditions, and final design selections." },
              { q: "What is the difference between Premium and Luxury?", a: "Premium introduces high-quality branded finishes and custom cabinetry. Luxury includes imported stones, smart home automation, and bespoke architectural detailing curated specifically for you." },
              { q: "Does this estimate include taxes?", a: "No, this represents core material and labor costs. Government taxes (like GST) and necessary building permits are calculated separately in the final formal quotation." }
            ].map((faq, index) => (
              <div key={index} className="bg-white border border-zinc-200 p-6 md:p-8 hover:border-[#a68a6b]/50 transition-colors">
                <h3 className="font-medium text-slate-900 mb-3 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#a68a6b] shrink-0 mt-0.5" strokeWidth={1.5} /> 
                  <span className="leading-snug">{faq.q}</span>
                </h3>
                <p className="text-slate-500 font-light pl-8 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}