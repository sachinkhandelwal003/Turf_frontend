"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit2, Trash2, Eye, Search, Filter, 
  Building, Home, Calendar, MapPin, Image as ImageIcon, 
  Play, CheckCircle, XCircle, ArrowUpDown, ArrowLeft, User, 
  Loader2, AlertCircle
} from 'lucide-react';

interface Project {
  _id: string;
  title: string;
  category: 'residential' | 'commercial';
  description: string;
  location: string;
  completionYear: number;
  client: string;
  featuredImage: string;
  images?: string[];
  videos?: string[];
  technologies?: string[];
  materials?: string[];
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'residential' | 'commercial'>('all');
  const [sortBy, setSortBy] = useState<'order' | 'title' | 'date'>('order');
  
  // Global Alert State
  const [alert, setAlert] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const showAlert = (type: 'success' | 'error', text: string) => {
    setAlert({ type, text });
    setTimeout(() => setAlert(null), 4000);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/projects`);
      const data = await response.json();
      if (data.success) {
        setProjects(data.data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      showAlert('error', 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/projects/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        setProjects(projects.filter(p => p._id !== id));
        showAlert('success', 'Project deleted successfully.');
      } else {
        showAlert('error', data.message || 'Failed to delete project.');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      showAlert('error', 'An error occurred while deleting.');
    }
  };

  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            project.client.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'order') return (a.order || 0) - (b.order || 0);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });

  // Safe calculation for total media (fixes the undefined length bug)
  const totalMedia = projects.reduce((acc, p) => 
    acc + (p.images?.length || 0) + (p.videos?.length || 0), 0
  );

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-[#a68a6b] mb-4" />
        <p className="text-zinc-500 uppercase tracking-widest text-sm font-semibold">Loading Projects...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12">
      
      {/* Global Floating Alert */}
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-6 left-1/2 z-[100] px-6 py-3 rounded-full shadow-xl flex items-center gap-3 font-medium text-sm border ${
              alert.type === 'success' ? 'bg-white border-green-200 text-green-800' : 'bg-white border-red-200 text-red-800'
            }`}
          >
            {alert.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
            {alert.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- HEADER --- */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between h-auto sm:h-20 py-4 sm:py-0 gap-4">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="p-2 -ml-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Project Portfolio</h1>
                <p className="text-xs text-gray-500 mt-0.5">Manage your showcased architectural works.</p>
              </div>
            </div>
            
            <Link
              href="/admin/projects/add"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-[#a68a6b] text-sm font-medium transition-all shadow-sm w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Project
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* --- STATS CARDS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Projects', value: projects.length, icon: Building, color: 'text-blue-600', bg: 'bg-blue-50' },
            { title: 'Active Projects', value: projects.filter(p => p.isActive).length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
            { title: 'Hidden Projects', value: projects.filter(p => !p.isActive).length, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
            { title: 'Total Media Files', value: totalMedia, icon: ImageIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex items-center gap-5">
              <div className={`p-4 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* --- FILTERS & SEARCH --- */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-8 flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, client, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#a68a6b] focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-all"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="w-full sm:w-auto pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#a68a6b] outline-none bg-gray-50 cursor-pointer appearance-none"
              >
                <option value="all">All Categories</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>

            <div className="relative">
              <ArrowUpDown className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full sm:w-auto pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#a68a6b] outline-none bg-gray-50 cursor-pointer appearance-none"
              >
                <option value="order">Sort by Order</option>
                <option value="title">Sort by Title (A-Z)</option>
                <option value="date">Sort by Newest</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- PROJECTS GRID --- */}
        {filteredProjects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Building className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Projects Found</h3>
            <p className="text-gray-500 mb-6 max-w-md">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your filters or search terms.'
                : 'Your portfolio is currently empty. Get started by adding your first architectural masterpiece.'
              }
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <Link href="/admin/projects/add" className="inline-flex items-center px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-[#a68a6b] transition-colors font-medium">
                <Plus className="w-4 h-4 mr-2" /> Add Your First Project
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-lg hover:border-[#a68a6b]/50 transition-all duration-300 group"
              >
                {/* Project Image Header */}
                <div className="relative h-56 overflow-hidden bg-gray-100">
                  <img 
                    src={project.featuredImage} 
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded bg-white text-gray-900 shadow-sm">
                      {project.category === 'residential' ? <Home className="w-3 h-3 mr-1 text-[#a68a6b]" /> : <Building className="w-3 h-3 mr-1 text-[#a68a6b]" />}
                      {project.category}
                    </span>
                  </div>
                  
                  <div className="absolute top-4 right-4">
                    <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded shadow-sm ${
                      project.isActive ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {project.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </div>

                  {/* Media Count */}
                  <div className="absolute bottom-4 left-4 flex items-center space-x-4 text-white text-xs font-semibold">
                    <span className="flex items-center drop-shadow-md">
                      <ImageIcon className="w-3.5 h-3.5 mr-1.5 opacity-80" />
                      {project.images?.length || 0} Photos
                    </span>
                    <span className="flex items-center drop-shadow-md">
                      <Play className="w-3.5 h-3.5 mr-1.5 opacity-80" />
                      {project.videos?.length || 0} Videos
                    </span>
                  </div>
                </div>

                {/* Project Details Body */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-1 mb-2">
                    {project.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-5 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Meta Details */}
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 mr-2 text-[#a68a6b] shrink-0" />
                      <span className="truncate">{project.location}</span>
                    </div>
                    <div className="flex items-start">
                      <User className="w-4 h-4 mr-2 text-[#a68a6b] shrink-0" />
                      <span className="truncate" title={project.client}>{project.client}</span>
                    </div>
                    <div className="flex items-center col-span-2">
                      <Calendar className="w-4 h-4 mr-2 text-[#a68a6b] shrink-0" />
                      <span>Completed in {project.completionYear}</span>
                    </div>
                  </div>

                  <div className="mt-auto">
                    {/* Tech Pills */}
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {project.technologies.slice(0, 3).map((tech, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-600 text-[10px] uppercase font-semibold tracking-wider rounded">
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-500 text-[10px] font-semibold rounded">
                            +{project.technologies.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Fixed Action Bar */}
                    <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                      <Link
                        href={`/portfolio/${project._id}`}
                        target="_blank"
                        className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4 mr-1.5 text-gray-400" /> View
                      </Link>
                      <Link
                        href={`/admin/projects/${project._id}?mode=edit`}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-slate-900 text-white rounded-lg hover:bg-[#a68a6b] transition-colors text-sm font-medium"
                      >
                        <Edit2 className="w-4 h-4 mr-1.5 opacity-80" /> Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(project._id)}
                        className="px-3 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 