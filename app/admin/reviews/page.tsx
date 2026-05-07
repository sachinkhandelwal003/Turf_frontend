"use client";

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { 
  Star, Search, Loader2, 
  XCircle, User as UserIcon,
  ChevronLeft, ChevronRight, MapPin, Trash2, Eye, EyeOff
} from 'lucide-react';
import api from '@/app/services/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Review {
  _id: string;
  turf: {
    _id: string;
    name: string;
  };
  user: {
    _id: string;
    name: string;
    email: string;
    profilePhoto?: string;
  };
  booking: {
    date: string;
    startTime: string;
    endTime: string;
  };
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

interface Turf {
  _id: string;
  name: string;
}

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
  message?: string;
}

const getApiError = (error: unknown) => error as ApiError;

export default function AdminReviewsPage() {
  const { isSuperadmin, isLoading: authLoading } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [turfIdFilter, setTurfIdFilter] = useState('');
  const [availableTurfs, setAvailableTurfs] = useState<Turf[]>([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const itemsPerPage = 10;

  const fetchTurfs = useCallback(async () => {
    try {
      const res = await api.get('/turfs/my/all');
      if (res.data.success) {
        setAvailableTurfs(res.data.turfs || []);
      }
    } catch (error) {
      console.error('Error fetching turfs:', error);
    }
  }, []);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
      };
      
      if (turfIdFilter) params.turfId = turfIdFilter;
      
      const res = await api.get('/reviews/all', { params });
      if (res.data.success) {
        setReviews(res.data.reviews || []);
        setTotalPages(res.data.pages || 1);
        setTotalReviews(res.data.total || 0);
      }
    } catch (error: unknown) {
      const apiError = getApiError(error);
      console.error('Error fetching reviews:', apiError.response?.data || apiError.message);
      toast.error(apiError.response?.data?.error || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, turfIdFilter]);

  useEffect(() => {
    if (!authLoading) {
      fetchTurfs();
    }
  }, [authLoading, isSuperadmin, fetchTurfs]);

  useEffect(() => {
    if (!authLoading) {
      fetchReviews();
    }
  }, [authLoading, fetchReviews]);

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (!authLoading) {
        setDebouncedSearchTerm(searchTerm);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [authLoading, searchTerm]);

  const handleToggleApproval = async (id: string, isApproved: boolean) => {
    try {
      const res = await api.patch(`/reviews/${id}/approve`, { isApproved: !isApproved });
      if (res.data.success) {
        setReviews(reviews.map(r => r._id === id ? { ...r, isApproved: !isApproved } : r));
        toast.success(`Review ${!isApproved ? 'approved' : 'hidden'} successfully`);
      }
    } catch (error: unknown) {
      const apiError = getApiError(error);
      toast.error(apiError.response?.data?.error || 'Failed to update review');
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    try {
      const res = await api.delete(`/reviews/${id}`);
      if (res.data.success) {
        setReviews(reviews.filter(r => r._id !== id));
        toast.success('Review deleted successfully');
      }
    } catch (error: unknown) {
      const apiError = getApiError(error);
      toast.error(apiError.response?.data?.error || 'Failed to delete review');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTurfIdFilter('');
    setCurrentPage(1);
  };

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5001';
    return `${baseUrl}${path}`;
  };

  const formatDate = (dateStr: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      };
      return new Date(dateStr).toLocaleDateString('en-IN', options);
    } catch {
      return dateStr;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1abc60]" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-5 px-4 sm:px-6 md:px-8 pb-8 !pt-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manage Reviews</h1>
          <p className="text-gray-500 text-sm mt-1">Monitor and moderate venue reviews</p>
        </div>
        <div className="bg-white px-5 py-3 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center min-w-[120px]">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total</p>
          <p className="text-2xl font-semibold text-[#1abc60]">{totalReviews}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="md:col-span-5 group flex items-center bg-gray-50 border border-gray-200 rounded-lg focus-within:bg-white focus-within:ring-2 focus-within:ring-green-100 focus-within:border-[#1abc60] transition-all">
            <div className="pl-4 pr-3 text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input 
              type="text" 
              placeholder="Search by user or comment..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="!w-full !px-2 !py-2.5 !bg-transparent !outline-none !text-sm !text-gray-700 placeholder:!text-gray-400 !border-none focus:!ring-0"
            />
          </div>

          <div className="md:col-span-4 relative group flex items-center bg-gray-50 border border-gray-200 rounded-lg focus-within:bg-white focus-within:ring-2 focus-within:ring-green-100 focus-within:border-[#1abc60] transition-all">
            <div className="pl-4 pr-3 text-gray-400">
              <MapPin className="w-4 h-4" />
            </div>
            <select 
              value={turfIdFilter}
              onChange={(e) => {
                setTurfIdFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="!w-full !px-2 !py-2.5 !bg-transparent !outline-none !text-sm !text-gray-700 !appearance-none !cursor-pointer !border-none focus:!ring-0"
            >
              <option value="">All Venues</option>
              {availableTurfs.map((turf) => (
                <option key={turf._id} value={turf._id}>{turf.name}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <ChevronLeft className="w-4 h-4 -rotate-90" />
            </div>
          </div>

          <div className="md:col-span-3">
            <button 
              onClick={clearFilters}
              className="!w-full !flex !items-center !justify-center !gap-2 !bg-white !text-gray-600 !border !border-gray-200 !py-2.5 !px-4 !rounded-lg !text-sm !font-medium hover:!bg-gray-50 !transition-all !cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="grid grid-cols-1 gap-4 min-h-[400px] relative">
        {loading && reviews.length > 0 && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
            <Loader2 className="w-8 h-8 animate-spin text-[#1abc60]" />
          </div>
        )}
        
        <AnimatePresence mode="popLayout">
          {reviews.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white py-16 px-6 rounded-xl border border-gray-200 text-center shadow-sm"
            >
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <Star className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No Reviews Found</h3>
              <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters to find matching reviews.</p>
            </motion.div>
          ) : (
            reviews.map((review) => (
              <motion.div 
                layout
                key={review._id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6 items-start">
                    
                    {/* User & Turf Info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0 w-full">
                      <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center border border-gray-200">
                        {review.user?.profilePhoto ? (
                          <img 
                            src={getImageUrl(review.user.profilePhoto)} 
                            alt={review.user.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <UserIcon className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-base font-semibold text-gray-900 truncate">{review.user?.name}</h3>
                          <span className="text-xs text-gray-500">{review.user?.email}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          {renderStars(review.rating)}
                          <span className="text-xs text-gray-600">{formatDate(review.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm text-gray-700 font-medium">{review.turf?.name}</span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0">
                      <button 
                        onClick={() => handleToggleApproval(review._id, review.isApproved)}
                        className={`!flex !items-center !justify-center !gap-1 !px-3 !py-2 !rounded-lg !text-sm !font-medium !transition-all !cursor-pointer ${
                          review.isApproved 
                            ? '!bg-yellow-50 !text-yellow-700 !border !border-yellow-200 hover:!bg-yellow-100' 
                            : '!bg-green-50 !text-green-700 !border !border-green-200 hover:!bg-green-100'
                        }`}
                      >
                        {review.isApproved ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {review.isApproved ? 'Hide' : 'Show'}
                      </button>
                      <button 
                        onClick={() => handleDeleteReview(review._id)}
                        className="!flex !items-center !justify-center !gap-1 !px-3 !py-2 !rounded-lg !text-sm !font-medium !bg-white !text-red-600 !border !border-red-200 hover:!bg-red-50 !transition-all !cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium text-gray-900">{reviews.length}</span> of <span className="font-medium text-gray-900">{totalReviews}</span> results
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="!p-2 !bg-white !border !border-gray-200 !rounded-lg disabled:!opacity-50 disabled:!cursor-not-allowed hover:!bg-gray-50 !transition-colors !cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex items-center gap-1 px-2">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                if (
                  pageNum === 1 || 
                  pageNum === totalPages || 
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`!min-w-[36px] !h-9 !px-3 !rounded-lg !text-sm !font-medium !transition-colors !cursor-pointer ${
                        currentPage === pageNum 
                          ? '!bg-[#1abc60] !text-white !border !border-[#1abc60]' 
                          : '!bg-white !text-gray-700 !border !border-gray-200 hover:!bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === currentPage - 2 || 
                  pageNum === currentPage + 2
                ) {
                  return <span key={pageNum} className="text-gray-400 px-1">...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="!p-2 !bg-white !border !border-gray-200 !rounded-lg disabled:!opacity-50 disabled:!cursor-not-allowed hover:!bg-gray-50 !transition-colors !cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
