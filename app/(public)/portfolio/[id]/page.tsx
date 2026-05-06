"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, MapPin, Calendar, User, Play, X, 
  ChevronLeft, ChevronRight, Grid3x3, Tag, Eye, Building 
} from 'lucide-react';
import Link from 'next/link';

interface Project {
  _id: string;
  title: string;
  category: 'residential' | 'commercial';
  description: string;
  location: string;
  completionYear: number;
  client: string;
  featuredImage: string;
  images: string[];
  videos: string[];
  technologies: string[];
  materials: string[];
  isActive: boolean;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    if (params.id) fetchProject(params.id as string);
  }, [params.id]);

  const fetchProject = async (id: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      console.log('Fetching project from:', `${API_URL}/api/projects/${id}`);
      const response = await fetch(`${API_URL}/api/projects/${id}`);
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      if (data.success && data.data.isActive) {
        setProject(data.data);
      } else {
        console.log('Project not active or success false, redirecting...');
        router.push('/portfolio');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      router.push('/portfolio');
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };
  
  const closeLightbox = () => setLightboxOpen(false);
  
  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (!project) return;
    const total = project.images.length;
    setLightboxIndex((prev) => direction === 'prev' ? (prev - 1 + total) % total : (prev + 1) % total);
  };

  // Dynamic Helper for the Mosaic Gallery Grid
  const getGallerySpan = (idx: number) => {
    const pattern = idx % 6; 
    switch (pattern) {
      case 0: return "md:col-span-2 md:row-span-2"; // Big Square
      case 1: return "md:col-span-1 md:row-span-1"; // Standard
      case 2: return "md:col-span-1 md:row-span-1"; // Standard
      case 3: return "md:col-span-3 md:row-span-1"; // Wide Panorama
      case 4: return "md:col-span-1 md:row-span-2"; // Tall Portrait
      case 5: return "md:col-span-2 md:row-span-2"; // Big Square
      default: return "md:col-span-1 md:row-span-1";
    }
  };

  // --- PREMIUM LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a68a6b] mb-4"></div>
        <p className="text-zinc-500 uppercase tracking-widest text-sm font-semibold">Loading Case Study...</p>
      </div>
    );
  }

  // --- ERROR / NOT FOUND STATE ---
  if (!project) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center font-sans">
        <h1 className="text-3xl font-serif text-slate-900 mb-4">Project Not Found</h1>
        <Link href="/portfolio" className="text-[#a68a6b] hover:text-[#8b7355] border-b border-[#a68a6b] pb-1 uppercase tracking-widest text-sm font-semibold transition-colors">
          Return to Portfolio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* --- HERO SECTION (Optimized for Mobile Height) --- */}
      <section className="relative h-[50vh] sm:h-[60vh] lg:h-[80vh] w-full bg-zinc-900 flex items-end">
        <div className="absolute inset-0 z-0">
          <img 
            src={project.featuredImage} 
            alt={project.title} 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 md:pb-16">
          <Link href="/portfolio" className="inline-flex items-center gap-2 text-zinc-300 hover:text-[#a68a6b] mb-6 md:mb-8 transition-colors text-xs md:text-sm uppercase tracking-widest font-bold">
            <ArrowLeft className="w-4 h-4" /> Back to Portfolio
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="bg-[#a68a6b] text-white text-[10px] md:text-xs font-bold uppercase tracking-widest px-3 py-1.5 mb-4 md:mb-6 inline-block shadow-md rounded-sm">
              {project.category}
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif text-white mb-4 md:mb-6 leading-tight drop-shadow-lg">
              {project.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-zinc-300 font-light text-sm md:text-base">
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 md:w-5 md:h-5 text-[#a68a6b]" /> {project.location}</div>
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4 md:w-5 md:h-5 text-[#a68a6b]" /> {project.completionYear}</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- MAIN CONTENT (Two Columns) --- */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            
            {/* Left Col: Story & Gallery */}
            <div className="lg:col-span-8">
              <h2 className="text-2xl md:text-3xl font-serif text-slate-900 mb-6 pb-4 border-b border-zinc-200">Project Overview</h2>
              <p className="text-base md:text-lg text-slate-600 leading-relaxed font-light mb-16 whitespace-pre-line">
                {project.description}
              </p>

              {/* Dynamic Mosaic Image Gallery */}
              {project.images.length > 0 && (
                <div className="mb-16">
                  <div className="flex items-center gap-3 mb-8">
                    <Grid3x3 className="w-5 h-5 md:w-6 md:h-6 text-[#a68a6b]" />
                    <h3 className="text-xl md:text-2xl font-serif text-slate-900">Gallery</h3>
                  </div>
                  
                  {/* Grid Setup: auto-rows to keep items strictly proportioned */}
                  <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[250px] gap-4">
                    {project.images.map((img, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => openLightbox(idx)}
                        className={`group relative overflow-hidden bg-zinc-100 cursor-pointer rounded-sm shadow-sm hover:shadow-xl transition-all duration-500 ${getGallerySpan(idx)}`}
                      >
                        <img 
                          src={img} 
                          alt={`Gallery ${idx + 1}`} 
                          className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                        />
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                            <Eye className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos */}
              {project.videos && project.videos.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-8">
                    <Play className="w-5 h-5 md:w-6 md:h-6 text-[#a68a6b]" />
                    <h3 className="text-xl md:text-2xl font-serif text-slate-900">Cinematic Tour</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    {project.videos.map((vid, idx) => (
                      <div key={idx} className="aspect-video bg-black rounded-sm overflow-hidden shadow-lg border-4 border-zinc-100">
                        <video src={vid} controls className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Col: Details Card */}
            <div className="lg:col-span-4">
              <div className="sticky top-32 bg-zinc-50 border border-zinc-200 p-6 md:p-8 rounded-sm shadow-sm">
                <h3 className="text-lg md:text-xl font-serif text-slate-900 mb-6">Project Details</h3>
                
                <div className="space-y-6 mb-8">
                  <div>
                    <p className="text-[10px] md:text-xs text-zinc-400 uppercase tracking-widest font-bold mb-1">Client</p>
                    <p className="text-sm md:text-base text-slate-900 flex items-center gap-2"><User className="w-4 h-4 text-[#a68a6b]" /> {project.client}</p>
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs text-zinc-400 uppercase tracking-widest font-bold mb-1">Location</p>
                    <p className="text-sm md:text-base text-slate-900 flex items-center gap-2"><MapPin className="w-4 h-4 text-[#a68a6b]" /> {project.location}</p>
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs text-zinc-400 uppercase tracking-widest font-bold mb-1">Completed</p>
                    <p className="text-sm md:text-base text-slate-900 flex items-center gap-2"><Calendar className="w-4 h-4 text-[#a68a6b]" /> {project.completionYear}</p>
                  </div>
                </div>

                {project.technologies && project.technologies.length > 0 && (
                  <div className="mb-6 pt-6 border-t border-zinc-200">
                    <p className="text-[10px] md:text-xs text-zinc-400 uppercase tracking-widest font-bold mb-3 flex items-center gap-2"><Tag className="w-4 h-4"/> Technologies</p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map(tech => (
                        <span key={tech} className="px-2 py-1 md:px-3 md:py-1 bg-white border border-zinc-200 text-slate-600 text-xs rounded-sm">{tech}</span>
                      ))}
                    </div>
                  </div>
                )}

                {project.materials && project.materials.length > 0 && (
                  <div className="pt-6 border-t border-zinc-200">
                    <p className="text-[10px] md:text-xs text-zinc-400 uppercase tracking-widest font-bold mb-3 flex items-center gap-2"><Building className="w-4 h-4"/> Core Materials</p>
                    <div className="flex flex-wrap gap-2">
                      {project.materials.map(mat => (
                        <span key={mat} className="px-2 py-1 md:px-3 md:py-1 bg-[#a68a6b]/10 text-[#a68a6b] border border-[#a68a6b]/20 text-[10px] md:text-xs font-semibold uppercase tracking-wider rounded-sm">{mat}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-10">
                  <Link href="/contact" className="block w-full bg-slate-900 hover:bg-[#a68a6b] text-white text-center py-3 md:py-4 rounded-sm font-bold uppercase tracking-widest text-sm transition-colors duration-300 shadow-md hover:shadow-xl">
                    Discuss A Project
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- LIGHT THEME LIGHTBOX MODAL --- */}
      <AnimatePresence>
        {lightboxOpen && project && (
          <motion.div
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-md flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button 
              onClick={closeLightbox} 
              className="absolute top-4 right-4 md:top-6 md:right-6 z-10 p-2 md:p-3 bg-zinc-100 text-slate-500 hover:text-slate-900 hover:bg-zinc-200 rounded-full transition-colors shadow-sm"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            
            {/* Previous Button (Desktop) */}
            <button 
              onClick={(e) => { e.stopPropagation(); navigateLightbox('prev'); }} 
              className="absolute left-6 top-1/2 -translate-y-1/2 z-10 p-3 bg-zinc-100 text-slate-500 hover:text-slate-900 hover:bg-zinc-200 rounded-full transition-colors shadow-sm hidden md:block"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            
            {/* Image Container */}
            <div className="relative w-full max-w-7xl max-h-[90vh] mx-auto px-4 md:px-20 flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
              
              <AnimatePresence mode="wait">
                <motion.img
                  key={lightboxIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  src={project.images[lightboxIndex]}
                  alt="Enlarged gallery view"
                  className="max-w-full max-h-[70vh] md:max-h-[80vh] object-contain shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-sm border border-zinc-200"
                />
              </AnimatePresence>

              {/* Mobile Controls (Visible only on small screens) */}
              <div className="flex md:hidden items-center justify-center gap-6 mt-6">
                <button onClick={(e) => { e.stopPropagation(); navigateLightbox('prev'); }} className="p-2 bg-zinc-100 text-slate-500 hover:text-slate-900 rounded-full shadow-sm"><ChevronLeft className="w-5 h-5" /></button>
                <div className="text-slate-500 tracking-widest text-xs font-bold">
                  {lightboxIndex + 1} / {project.images.length}
                </div>
                <button onClick={(e) => { e.stopPropagation(); navigateLightbox('next'); }} className="p-2 bg-zinc-100 text-slate-500 hover:text-slate-900 rounded-full shadow-sm"><ChevronRight className="w-5 h-5" /></button>
              </div>

              {/* Desktop Counter */}
              <div className="hidden md:block text-center text-slate-500 mt-6 tracking-widest text-sm font-bold uppercase">
                {lightboxIndex + 1} <span className="mx-2 font-normal text-zinc-300">|</span> {project.images.length}
              </div>
            </div>

            {/* Next Button (Desktop) */}
            <button 
              onClick={(e) => { e.stopPropagation(); navigateLightbox('next'); }} 
              className="absolute right-6 top-1/2 -translate-y-1/2 z-10 p-3 bg-zinc-100 text-slate-500 hover:text-slate-900 hover:bg-zinc-200 rounded-full transition-colors shadow-sm hidden md:block"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}