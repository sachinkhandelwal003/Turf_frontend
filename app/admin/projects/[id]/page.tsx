"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Image as ImageIcon, 
  Eye,
  EyeOff,
  Save,
  X,
  Plus,
  Loader2,
  CheckCircle
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
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminProjectDetail() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Project | null>(null);
  const [newFeaturedImage, setNewFeaturedImage] = useState<UploadedFile | null>(null);
  const [newGalleryImages, setNewGalleryImages] = useState<UploadedFile[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const searchParams = useSearchParams();

  const fetchProject = useCallback(async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/projects/${projectId}`);
      const data = await response.json();
      if (data.success) {
        setProject(data.data);
        setFormData(data.data);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  useEffect(() => {
    if (project && searchParams?.get('mode') === 'edit') {
      setIsEditing(true);
    }
  }, [project, searchParams]);

  // --- UPLOAD SINGLE FILE TO CLOUDINARY ---
  const uploadSingleFile = async (file: File) => {
    const fd = new FormData();
    fd.append('image', file);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    const response = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      body: fd
    });
    const data = await response.json();
    return data.url;
  };

  // Gallery Images Handler - STORE NEW SELECTED IMAGES
  const handleGalleryImagesUpload = useCallback((newFiles: UploadedFile[]) => {
    console.log('🖼️ New gallery images selected:', newFiles.length);
    setNewGalleryImages(prev => {
      const combined = [...prev, ...newFiles];
      return combined.filter(
        (file, index, self) =>
          index === self.findIndex(f => f.name === file.name && f.size === file.size)
      );
    });
  }, []);

  // Featured Image Handler
  const handleFeaturedImageUpload = useCallback((files: UploadedFile[]) => {
    console.log('📸 Featured image selected:', files);
    if (files.length > 0) {
      setNewFeaturedImage(files[0]);
    }
  }, []);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/projects/${projectId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        router.push('/admin/projects');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleSave = async () => {
    if (!formData) return;
    
    try {
      setIsUploadingImages(true);
      console.log('💾 Starting to save project...');
      
      // Upload new featured image if any
      let finalFeaturedImageUrl = formData.featuredImage;
      
      if (newFeaturedImage?.originalFile) {
        console.log(`📸 Uploading new featured image...`);
        finalFeaturedImageUrl = await uploadSingleFile(newFeaturedImage.originalFile);
        console.log(`✅ Featured image uploaded`);
      }
      
      // Upload new gallery images if any
      let allGalleryUrls = [...formData.images];
      
      if (newGalleryImages.length > 0) {
        console.log(`📤 Uploading ${newGalleryImages.length} new gallery images...`);
        const uploadPromises = newGalleryImages.map(async (img) => {
          if (img.originalFile) {
            console.log(`  ⬆️ Uploading: ${img.name}`);
            return await uploadSingleFile(img.originalFile);
          }
          return img.url;
        });
        
        const newUrls = await Promise.all(uploadPromises);
        allGalleryUrls = [...allGalleryUrls, ...newUrls];
        console.log(`✅ All new images uploaded. Total: ${allGalleryUrls.length}`);
      }
      
      // Update formData with all images
      const updatedFormData = {
        ...formData,
        featuredImage: finalFeaturedImageUrl,
        images: allGalleryUrls
      };
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedFormData)
      });
      
      if (response.ok) {
        const data = await response.json();
        setProject(data.data);
        setFormData(data.data);
        setNewFeaturedImage(null);
        setNewGalleryImages([]);
        setIsEditing(false);
        setEditSuccess(true);
        console.log('✅ Project saved successfully!');
        setTimeout(() => {
          setEditSuccess(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Error saving project. Check console for details.');
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleToggleActive = async () => {
    if (!project || !project.isActive) return;
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/projects/${projectId}/deactivate`, {
        method: 'PATCH'
      });
      
      if (response.ok) {
        const data = await response.json();
        setProject(data.data);
        setFormData(data.data);
      }
    } catch (error) {
      console.error('Error deactivating project:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <Link href="/admin/projects" className="text-blue-600 hover:text-blue-800">
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  if (editSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white p-12 rounded-xl shadow-lg"
        >
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Updated!</h1>
          <p className="text-gray-500">Your changes have been saved successfully.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/admin/projects"
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Projects
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                {isEditing ? 'Edit Project' : project.title}
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              {!isEditing && (
                <>
                  <button
                    onClick={handleToggleActive}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                      project.isActive 
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {project.isActive ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Activate
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </>
              )}
              {isEditing && (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(project);
                      setNewFeaturedImage(null);
                      setNewGalleryImages([]);
                    }}
                    disabled={isUploadingImages}
                    className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm disabled:opacity-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isUploadingImages}
                    className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:opacity-70"
                  >
                    {isUploadingImages ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Featured Image */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {isEditing && formData ? (
                <div className="space-y-4 p-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Featured Image</label>
                    <div className="space-y-4">
                      {/* Preview of selected new image */}
                      {newFeaturedImage ? (
                        <div className="relative">
                          <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-blue-300 shadow-md bg-gray-100">
                            <img src={newFeaturedImage.url} alt="New Featured" className="w-full h-full object-cover" />
                            <div className="absolute top-2 right-2 px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded">
                              📤 New
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setNewFeaturedImage(null)}
                            className="mt-2 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            Remove New Image
                          </button>
                        </div>
                      ) : (
                        <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-300 shadow-md bg-gray-100">
                          <img src={formData.featuredImage} alt="Current Featured" className="w-full h-full object-cover" />
                          <div className="absolute top-2 right-2 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded">
                            ✓ Current
                          </div>
                        </div>
                      )}
                      
                      {/* Upload new featured image */}
                      {!newFeaturedImage && (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setNewFeaturedImage({
                                id: crypto.randomUUID(),
                                name: file.name,
                                url: URL.createObjectURL(file),
                                type: 'image',
                                size: file.size,
                                originalFile: file
                              });
                            }
                            e.target.value = '';
                          }}
                          className="w-full px-4 py-2.5 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors text-sm"
                        />
                      )}
                      <p className="text-xs text-gray-500">💡 Choose a new image to update the featured image</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-96 bg-gray-100">
                  <img
                    src={project.featuredImage}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Project Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h2>
              
              {isEditing && formData ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value as 'residential' | 'commercial'})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="residential">Residential</option>
                        <option value="commercial">Commercial</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Completion Year</label>
                      <input
                        type="number"
                        value={formData.completionYear}
                        onChange={(e) => setFormData({...formData, completionYear: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                      <input
                        type="text"
                        value={formData.client}
                        onChange={(e) => setFormData({...formData, client: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                      <input
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Technologies (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.technologies.join(', ')}
                      onChange={(e) => setFormData({...formData, technologies: e.target.value.split(',').map(t => t.trim()).filter(t => t)})}
                      placeholder="AutoCAD, Revit, SketchUp"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Materials (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.materials.join(', ')}
                      onChange={(e) => setFormData({...formData, materials: e.target.value.split(',').map(m => m.trim()).filter(m => m)})}
                      placeholder="Steel, Glass, Concrete"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Images (one URL per line)</label>
                    <textarea
                      value={formData.images.join('\n')}
                      onChange={(e) => setFormData({...formData, images: e.target.value.split('\n').map(url => url.trim()).filter(url => url)})}
                      rows={4}
                      placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Videos (one URL per line)</label>
                    <textarea
                      value={formData.videos.join('\n')}
                      onChange={(e) => setFormData({...formData, videos: e.target.value.split('\n').map(url => url.trim()).filter(url => url)})}
                      rows={3}
                      placeholder="https://example.com/video1.mp4&#10;https://example.com/video2.mp4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image URL</label>
                    <input
                      type="url"
                      value={formData.featuredImage}
                      onChange={(e) => setFormData({...formData, featuredImage: e.target.value})}
                      placeholder="https://example.com/featured-image.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Description</h3>
                    <p className="mt-1 text-gray-900">{project.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Category</h3>
                      <p className="mt-1 text-gray-900 capitalize">{project.category}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Completion Year</h3>
                      <p className="mt-1 text-gray-900">{project.completionYear}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Location</h3>
                      <p className="mt-1 text-gray-900">{project.location}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Client</h3>
                      <p className="mt-1 text-gray-900">{project.client}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Images Gallery */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Images Gallery</h2>
              
              {isEditing && formData ? (
                <div className="space-y-6">
                  {/* Existing Images */}
                  {formData.images.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-600 mb-3 font-semibold">📋 Current Images ({formData.images.length}):</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-green-300 shadow-md bg-gray-100">
                              <img src={image} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = formData.images.filter((_, i) => i !== index);
                                    setFormData({...formData, images: updated});
                                  }}
                                  className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 mt-2 truncate">{index + 1}. Image</p>
                            <div className="absolute top-1 right-1 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Images Selected */}
                  {newGalleryImages.length > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-600 mb-3 font-semibold">🆕 New Images ({newGalleryImages.length}):</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {newGalleryImages.map((img, index) => (
                          <div key={img.id} className="relative group">
                            <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-blue-300 shadow-md bg-gray-100">
                              <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewGalleryImages(prev => prev.filter(i => i.id !== img.id));
                                  }}
                                  className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="absolute top-1 right-1 px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded">
                                📤
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 mt-2 truncate">{img.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload New Images */}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-600 mb-3 font-semibold">📤 Add More Images:</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
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
                        
                        setNewGalleryImages(prev => {
                          const combined = [...prev, ...formatted];
                          return combined.filter(
                            (file, index, self) =>
                              index === self.findIndex(f => f.name === file.name && f.size === file.size)
                          );
                        });
                        e.target.value = '';
                      }}
                      className="w-full px-4 py-2.5 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Choose images to add. Click "Save" to upload all new images.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {project.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 shadow-md bg-gray-100">
                        <img src={image} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-2 truncate">{index + 1}. Image</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Videos */}
            {project.videos.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Videos</h2>
                <div className="space-y-4">
                  {project.videos.map((video, index) => (
                    <div key={index} className="aspect-w-16 aspect-h-9">
                      <video
                        src={video}
                        controls
                        className="w-full rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                    project.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {project.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Display Order</span>
                  <span className="text-sm font-medium text-gray-900">{project.order}</span>
                </div>
              </div>
            </div>

            {/* Technologies */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Technologies</h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Materials */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Materials</h3>
              <div className="flex flex-wrap gap-2">
                {project.materials.map((material, index) => (
                  <span
                    key={index}
                    className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded"
                  >
                    {material}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href={`/portfolio/${project._id}`}
                  className="flex items-center justify-center w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Public Page
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
