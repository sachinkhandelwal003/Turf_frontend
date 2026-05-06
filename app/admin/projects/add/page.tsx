"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Plus, 
  X, 
  Save,
  Link as LinkIcon,
  Loader2,
  CheckCircle,
  Trash2,
  AlertCircle,
  ImagePlus,
  UploadCloud
} from 'lucide-react';
import MediaUpload from '@/components/MediaUpload';

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video';
  size: number;
  originalFile?: File;
}

export default function AddProjectPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'residential' as 'residential' | 'commercial',
    description: '',
    location: '',
    completionYear: new Date().getFullYear(),
    client: '',
    technologies: '',
    materials: '',
    order: 0,
    isActive: true
  });

  const [featuredImage, setFeaturedImage] = useState<UploadedFile | null>(null);
  const [galleryImages, setGalleryImages] = useState<UploadedFile[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>(['']);

  const safeApiCall = async (url: string, options: RequestInit) => {
    console.log(`🌐 API Call to: ${url}`);
    const response = await fetch(url, options);
    const textResponse = await response.text();
    
    console.log(`📡 Response status: ${response.status}`);

    try {
      const data = JSON.parse(textResponse);
      if (!response.ok) throw new Error(data.message || "API Error");
      return data;
    } catch (err) {
      console.error(`❌ API Error for ${url}:`, textResponse.substring(0, 150));
      throw new Error(`Server Error: Could not connect to API at ${url}. Is your backend running?`);
    }
  };

  const uploadSingleFile = async (file: File) => {
    const fd = new FormData();
    fd.append('image', file);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    const data = await safeApiCall(`${API_URL}/api/upload`, {
      method: 'POST',
      body: fd
    });
    return data.url;
  };

  const handleFeaturedImageUpload = useCallback((files: UploadedFile[]) => {
    if (files.length > 0) {
      setFeaturedImage(files[0]);
    }
  }, []);

  const handleGalleryImagesUpload = useCallback((newFiles: UploadedFile[]) => {
    setGalleryImages(prev => {
      const combined = [...prev, ...newFiles];
      const unique = combined.filter(
        (file, index, self) =>
          index === self.findIndex(f => f.name === file.name && f.size === file.size)
      );
      return unique;
    });
  }, []);

  const removeFeaturedImage = () => {
    setFeaturedImage(null);
  };
  
  const removeGalleryImage = (id: string) => {
    setGalleryImages(prev => prev.filter(img => img.id !== id));
  };

  const handleVideoUrlChange = (index: number, value: string) => {
    const newUrls = [...videoUrls];
    newUrls[index] = value;
    setVideoUrls(newUrls);
  };
  
  const addVideoUrl = () => setVideoUrls([...videoUrls, '']);
  const removeVideoUrl = (index: number) => setVideoUrls(videoUrls.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);

    try {
      if (!formData.title.trim()) throw new Error('Project title is required');
      if (!formData.description.trim()) throw new Error('Project description is required');
      if (!formData.location.trim()) throw new Error('Project location is required');
      if (!formData.client.trim()) throw new Error('Client name is required');
      if (!featuredImage) throw new Error('Featured image is required');
      if (galleryImages.length === 0) throw new Error('At least one gallery image is required');

      setUploadProgress('Uploading featured image...');
      let finalFeaturedImageUrl = featuredImage.url;
      
      if (featuredImage.originalFile) {
        const cloudUrl = await uploadSingleFile(featuredImage.originalFile);
        finalFeaturedImageUrl = cloudUrl;
      }

      setUploadProgress(`Uploading ${galleryImages.length} gallery images...`);
      const galleryUploadPromises = galleryImages.map(async (img) => {
        let uploadedUrl = img.url;
        if (img.originalFile) {
          uploadedUrl = await uploadSingleFile(img.originalFile);
        }
        return uploadedUrl;
      });
      
      const finalGalleryUrls = await Promise.all(galleryUploadPromises);

      const finalVideoUrls = videoUrls.filter(url => url.trim() !== '');
      const finalTechnologies = formData.technologies.split(',').map(t => t.trim()).filter(Boolean);
      const finalMaterials = formData.materials.split(',').map(m => m.trim()).filter(Boolean);

      const projectData = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        location: formData.location,
        completionYear: formData.completionYear,
        client: formData.client,
        featuredImage: finalFeaturedImageUrl,
        images: finalGalleryUrls,
        videos: finalVideoUrls,
        technologies: finalTechnologies,
        materials: finalMaterials,
        order: formData.order,
        isActive: formData.isActive
      };

      setUploadProgress('Saving project to database...');

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      await safeApiCall(`${API_URL}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });

      setSuccess(true);
      setTimeout(() => router.push('/admin/projects'), 1500);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'An unknown error occurred';
      setErrors([errorMsg]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
      setUploadProgress('');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="text-center bg-white p-12 rounded-3xl shadow-xl border border-purple-100"
        >
          <CheckCircle className="w-24 h-24 text-purple-600 mx-auto mb-6" />
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Project Created!</h1>
          <p className="text-lg text-purple-600 font-medium">Redirecting back to your portfolio...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7FA] pb-16 font-sans selection:bg-purple-200">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b border-purple-100 sticky top-0 z-30"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <Link href="/admin/projects" className="flex items-center text-purple-600 hover:text-purple-800 mr-6 transition-colors bg-purple-50 px-3 py-2 rounded-xl font-medium">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Add New Project</h1>
            </div>
            <div className="flex items-center gap-4">
              {uploadProgress && (
                <div className="flex items-center text-sm font-semibold text-purple-600 bg-purple-50 px-4 py-2 rounded-xl">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {uploadProgress}
                </div>
              )}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center px-8 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-200 disabled:opacity-70 disabled:hover:shadow-none transition-all duration-200 transform active:scale-95"
              >
                {submitting ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-5 h-5 mr-2" /> Save Project</>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Form Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Error Messages */}
          <AnimatePresence>
            {errors.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-5 shadow-sm"
              >
                {errors.map((err, i) => (
                  <div key={i} className="flex items-center text-red-700 font-medium mb-1 last:mb-0">
                    <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                    {err}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Basic Information */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl shadow-sm border border-purple-100/50 p-8 sm:p-10"
          >
            <h2 className="text-xl font-extrabold text-gray-900 mb-8 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mr-3 text-sm">1</span>
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Project Title *</label>
                <input
                  type="text" 
                  required 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all font-medium text-gray-900"
                  placeholder="e.g., The Glass Pavilion"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
                <select
                  required 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value as 'residential' | 'commercial'})}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all cursor-pointer font-medium text-gray-900 appearance-none"
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Client Name *</label>
                <input
                  type="text" 
                  required 
                  value={formData.client}
                  onChange={(e) => setFormData({...formData, client: e.target.value})}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all font-medium text-gray-900"
                  placeholder="e.g., Mr. Sharma"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Location *</label>
                <input
                  type="text" 
                  required 
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all font-medium text-gray-900"
                  placeholder="e.g., Jaipur, Rajasthan"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Year *</label>
                  <input
                    type="number" 
                    required 
                    value={formData.completionYear}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setFormData({...formData, completionYear: isNaN(value) ? new Date().getFullYear() : value});
                    }}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all font-medium text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Display Order</label>
                  <input
                    type="number" 
                    value={formData.order}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setFormData({...formData, order: isNaN(value) ? 0 : value});
                    }}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all font-medium text-gray-900"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
                <textarea
                  required 
                  rows={5} 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all resize-none font-medium text-gray-900"
                  placeholder="Provide a detailed, captivating description of the project..."
                />
              </div>
            </div>
          </motion.div>

          {/* Technologies & Materials */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-sm border border-purple-100/50 p-8 sm:p-10"
          >
            <h2 className="text-xl font-extrabold text-gray-900 mb-8 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mr-3 text-sm">2</span>
              Technical Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Technologies Used</label>
                <input
                  type="text" 
                  value={formData.technologies}
                  onChange={(e) => setFormData({...formData, technologies: e.target.value})}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all font-medium text-gray-900"
                  placeholder="e.g., AutoCAD, 3ds Max, Revit (Comma separated)"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Core Materials</label>
                <input
                  type="text" 
                  value={formData.materials}
                  onChange={(e) => setFormData({...formData, materials: e.target.value})}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all font-medium text-gray-900"
                  placeholder="e.g., Concrete, Glass, Steel (Comma separated)"
                />
              </div>
            </div>
          </motion.div>

          {/* Media Uploads */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl shadow-sm border border-purple-100/50 p-8 sm:p-10"
          >
            <h2 className="text-xl font-extrabold text-gray-900 mb-8 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mr-3 text-sm">3</span>
              Media Gallery
            </h2>

            <div className="space-y-10">
              {/* Featured Image */}
              <div className="bg-purple-50/50 p-6 rounded-3xl border border-purple-100">
                <label className="block text-sm font-bold text-gray-900 mb-4">
                  Featured Cover Image * <span className="text-xs text-purple-500 font-normal ml-2 bg-purple-100 px-2 py-1 rounded-md">Required</span>
                </label>
                {featuredImage ? (
                  <div className="relative w-full max-w-2xl h-64 rounded-2xl overflow-hidden border-2 border-purple-200 shadow-lg group">
                    <img src={featuredImage.url} alt="Featured" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <button
                      type="button" 
                      onClick={removeFeaturedImage}
                      className="absolute top-4 right-4 p-2.5 bg-white/90 text-red-500 rounded-xl hover:bg-red-50 hover:text-red-600 shadow-lg transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 left-4 px-4 py-2 bg-purple-600/90 backdrop-blur-sm text-white text-sm font-bold rounded-xl shadow-lg flex items-center">
                      <ImagePlus className="w-4 h-4 mr-2" /> Cover Photo
                    </div>
                  </div>
                ) : (
                  <div className="max-w-2xl">
                    <MediaUpload 
                      onFilesChange={handleFeaturedImageUpload} 
                      acceptedTypes={['image']} 
                      maxFiles={1}
                    />
                  </div>
                )}
              </div>

              {/* Gallery Images */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">Project Gallery</label>
                    <p className="text-sm text-gray-500">Showcase your project from multiple angles.</p>
                  </div>
                  <span className="mt-3 sm:mt-0 inline-flex items-center text-sm font-bold bg-purple-100 text-purple-700 px-4 py-1.5 rounded-xl border border-purple-200">
                    {galleryImages.length} images selected
                  </span>
                </div>
                
                {/* GALLERY IMAGE PREVIEW GRID */}
                {galleryImages.length > 0 && (
                  <div className="mb-8">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                      {galleryImages.map((img, index) => (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          key={img.id} 
                          className="relative group cursor-pointer"
                        >
                          <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-purple-100 shadow-md bg-gray-100">
                            <img src={img.url} alt={img.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-purple-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                              <button
                                type="button" 
                                onClick={() => removeGalleryImage(img.id)}
                                className="p-3 bg-white text-red-500 rounded-xl hover:bg-red-50 hover:text-red-600 shadow-xl transform scale-75 group-hover:scale-100 transition-all duration-300"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          <div className="absolute -top-3 -right-3 w-8 h-8 bg-purple-600 text-white text-xs font-bold rounded-xl shadow-lg flex items-center justify-center border-2 border-white z-10">
                            {index + 1}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Styled Upload Area */}
                <div className="relative group max-w-2xl">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      const formatted = files.map(file => ({
                        id: crypto.randomUUID(),
                        name: file.name,
                        url: URL.createObjectURL(file),
                        type: 'image' as const,
                        size: file.size,
                        originalFile: file
                      }));

                      setGalleryImages(prev => {
                        const combined = [...prev, ...formatted];
                        return combined.filter(
                          (file, index, self) =>
                            index === self.findIndex(f => f.name === file.name && f.size === file.size)
                        );
                      });
                      e.target.value = '';
                    }}
                  />
                  <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-purple-300 rounded-3xl bg-purple-50/50 group-hover:bg-purple-50 group-hover:border-purple-400 transition-all duration-300">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <UploadCloud className="w-8 h-8 text-purple-500" />
                    </div>
                    <p className="text-base font-bold text-purple-700 mb-1">Click or drag images to upload</p>
                    <p className="text-sm text-purple-400 font-medium">SVG, PNG, JPG or GIF (max. 10MB)</p>
                  </div>
                </div>
              </div>

              {/* Video URLs */}
              <div className="pt-8 border-t border-purple-100">
                <label className="block text-sm font-bold text-gray-900 mb-4">
                  Video URLs <span className="text-sm font-normal text-gray-500 ml-2">(YouTube / Vimeo links)</span>
                </label>
                
                <div className="space-y-4 max-w-2xl">
                  {videoUrls.map((url, index) => (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={index} 
                      className="flex items-center gap-3"
                    >
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <LinkIcon className="w-5 h-5 text-purple-400" />
                        </div>
                        <input
                          type="url" 
                          value={url}
                          onChange={(e) => handleVideoUrlChange(index, e.target.value)}
                          placeholder="https://youtube.com/watch?v=..."
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all text-sm font-medium text-gray-900"
                        />
                      </div>
                      {videoUrls.length > 1 && (
                        <button
                          type="button" 
                          onClick={() => removeVideoUrl(index)}
                          className="p-4 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                        >
                          <Trash2 className="w-6 h-6" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                  
                  <button
                    type="button" 
                    onClick={addVideoUrl}
                    className="inline-flex items-center px-5 py-3 mt-2 text-sm font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
                  >
                    <Plus className="w-5 h-5 mr-2" /> Add another video link
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
          
        </form>
      </div>
    </div>
  );
}