"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Building, 
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  Grid3x3,
  Home,
  User
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
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetchProject(params.id as string);
    }
  }, [params.id]);

  const fetchProject = async (id: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/projects/${id}`);
      const data = await response.json();
      if (data.success && data.data.isActive) {
        setProject(data.data);
      } else {
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

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (!project) return;
    const total = project.images.length;
    if (direction === 'prev') {
      setLightboxIndex((prev) => (prev - 1 + total) % total);
    } else {
      setLightboxIndex((prev) => (prev + 1) % total);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a68a6b]"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <Link href="/portfolio" className="text-[#a68a6b] hover:text-[#8b7355]">
            Back to Portfolio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/portfolio"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Portfolio
            </Link>
            
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                project.category === 'residential' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {project.category}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        {/* Hero Section with Project Info */}
        <section className="bg-gray-50 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Breadcrumb */}
              <div className="flex items-center text-sm text-gray-500 mb-6">
                <Link href="/" className="hover:text-gray-900">Home</Link>
                <ChevronLeft className="w-4 h-4 mx-2 rotate-180" />
                <Link href="/portfolio" className="hover:text-gray-900">Portfolio</Link>
                <ChevronLeft className="w-4 h-4 mx-2 rotate-180" />
                <span className="text-gray-900">{project.title}</span>
              </div>

              {/* Title & Description */}
              <div className="max-w-4xl">
                <h1 className="text-4xl lg:text-6xl font-serif font-bold text-gray-900 mb-6 leading-tight">
                  {project.title}
                </h1>
                
                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#a68a6b]" />
                    <span>{project.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#a68a6b]" />
                    <span>{project.completionYear}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-[#a68a6b]" />
                    <span>{project.client}</span>
                  </div>
                </div>

                <p className="text-xl text-gray-600 leading-relaxed mb-8">
                  {project.description}
                </p>

                {/* Technologies & Materials Tags */}
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.materials.map((material, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full"
                    >
                      {material}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Images Gallery Section */}
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-3">
                <Grid3x3 className="w-6 h-6 text-[#a68a6b]" />
                <h2 className="text-2xl font-bold text-gray-900">Project Gallery</h2>
              </div>
              <span className="text-sm text-gray-500">
                {project.images.length} images • Click to view full size
              </span>
            </div>

            {/* Images Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {project.images.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group cursor-pointer"
                  onClick={() => openLightbox(index)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={image}
                      alt={`${project.title} - Image ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                      <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    {/* Image Number */}
                    <div className="absolute top-4 left-4 bg-black/60 text-white px-2 py-1 rounded text-sm font-medium">
                      {index + 1}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Videos Section */}
        {project.videos.length > 0 && (
          <section className="py-16 lg:py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3 mb-12">
                <Play className="w-6 h-6 text-[#a68a6b]" />
                <h2 className="text-2xl font-bold text-gray-900">Project Videos</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {project.videos.map((video, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <video
                        src={video}
                        controls
                        className="w-full h-full"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16 lg:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              Interested in a Similar Project?
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Let's discuss how we can bring your architectural vision to life with the same attention to detail and craftsmanship.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-[#a68a6b] text-white font-medium rounded-lg hover:bg-[#8b7355] transition-colors"
              >
                Start Your Project
                <ExternalLink className="w-4 h-4 ml-2" />
              </Link>
              <Link
                href="/portfolio"
                className="inline-flex items-center justify-center px-8 py-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                View More Projects
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && project && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 p-2 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Navigation - Previous */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateLightbox('prev');
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>

            {/* Image */}
            <div 
              className="max-w-7xl max-h-[90vh] mx-auto px-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={project.images[lightboxIndex]}
                alt={`${project.title} - Image ${lightboxIndex + 1}`}
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
              />
              {/* Counter */}
              <div className="text-center text-white/80 mt-4 text-lg">
                {lightboxIndex + 1} / {project.images.length}
              </div>
            </div>

            {/* Navigation - Next */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateLightbox('next');
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors"
            >
              <ChevronRight className="w-10 h-10" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
