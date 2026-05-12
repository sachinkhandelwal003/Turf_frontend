"use client";

import { useState, useEffect } from 'react';
import { 
  Trophy, 
  Plus, 
  Search, 
  Calendar, 
  MapPin, 
  Users, 
  Edit, 
  Trash2, 
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import api from '@/app/services/api';
import { toast } from 'sonner';
import { useAuth } from '@/app/context/AuthContext';
import Swal from 'sweetalert2';

interface RegisteredTeam {
  name: string;
  captain: string;
  contact: string;
  altContact?: string;
  status: string;
  registeredAt: string;
  paymentDetails?: {
    paymentId: string;
    paymentMethod: string;
    amount: number;
  };
}

interface Tournament {
  _id: string;
  title: string;
  sport: string;
  matchType?: string;
  teamSize?: number;
  startDate: string;
  endDate: string;
  status: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  location: {
    city: string;
    venue: string;
  };
  registeredTeams: any[];
  maxTeams?: number;
  entryFee?: number;
  image?: string;
}

export default function TournamentsListPage() {
  const { isSuperadmin } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'tournaments' | 'registrations'>('tournaments');

  const getImageUrl = (path: string) => {
    if (!path || path === 'undefined' || path === 'null' || path === '') return '/heroimage.png';
    if (path.startsWith('http')) return path;
    
    // Replace backslashes with forward slashes for cross-platform compatibility
    const normalizedPath = path.replace(/\\/g, '/');
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.rkinteriorstudio.in/api';
    const baseUrl = apiUrl.replace(/\/api$/, '').replace(/\/$/, '');
    const cleanPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
    return `${baseUrl}${cleanPath}`;
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tournaments/my/all');
      if (res.data.success) {
        setTournaments(res.data.tournaments);
      }
    } catch (error) {
      toast.error('Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await api.patch(`/tournaments/${id}/approve`, { status });
      if (res.data.success) {
        toast.success(`Tournament ${status} successfully`);
        setTournaments(prev => prev.map(t => t._id === id ? { ...t, approvalStatus: status } : t));
      }
    } catch (error) {
      toast.error('Failed to update approval status');
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This tournament will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        const res = await api.delete(`/tournaments/${id}`);
        if (res.data.success) {
          setTournaments(prev => prev.filter(t => t._id !== id));
          Swal.fire({
            title: "Deleted!",
            text: "Tournament has been deleted.",
            icon: "success",
            confirmButtonColor: "#1abc60"
          });
        }
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "Failed to delete tournament",
          icon: "error",
          confirmButtonColor: "#1abc60"
        });
      }
    }
  };

  const filteredTournaments = tournaments.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.sport.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const res = await api.put(`/tournaments/${id}`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Status updated to ${newStatus}`);
        setTournaments(prev => prev.map(t => t._id === id ? { ...t, status: newStatus } : t));
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return '!bg-blue-50 !text-blue-600 !border !border-blue-200';
      case 'ongoing': return '!bg-green-50 !text-green-600 !border !border-green-200';
      case 'completed': 
      case 'finished': return '!bg-gray-100 !text-gray-600 !border !border-gray-200';
      case 'cancelled': return '!bg-red-50 !text-red-600 !border !border-red-200';
      case 'postponed': return '!bg-orange-50 !text-orange-600 !border !border-orange-200';
      default: return '!bg-gray-50 !text-gray-600 !border !border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1abc60]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tournaments</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your sports tournaments and registrations</p>
        </div>
        <Link 
          href="/admin/tournaments/add"
          className="!inline-flex !items-center !justify-center !gap-2 !bg-[#1abc60] !text-white !px-5 !py-2.5 !rounded-lg !font-medium hover:!bg-[#17a554] !transition-colors !shadow-sm !no-underline"
        >
          <Plus className="w-4 h-4" />
          Add Tournament
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative group flex items-center bg-gray-50 border border-gray-300 rounded-lg focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1abc60]/20 focus-within:border-[#1abc60] transition-all">
          <div className="pl-4 pr-2 text-gray-400 group-focus-within:text-[#1abc60]">
            <Search className="w-4 h-4" />
          </div>
          <input 
            type="text"
            placeholder="Search tournaments by title or sport..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="!w-full !px-3 !py-2.5 !bg-transparent !outline-none !transition-all !text-sm !text-gray-700 placeholder:!text-gray-400 !border-none focus:!ring-0"
          />
        </div>
      </div>

      {/* Cards Grid */}
      {filteredTournaments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((tournament) => (
            <div key={tournament._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 group flex flex-col">
              {/* Card Image */}
              <div className="relative h-48 overflow-hidden bg-gray-100 shrink-0">
                <img 
                  src={getImageUrl(tournament.image || '')} 
                  alt={tournament.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                  <div className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize shadow-sm ${getStatusColor(tournament.status)}`}>
                    {tournament.status}
                  </div>
                  <div className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize shadow-sm border ${
                    tournament.approvalStatus === 'approved' ? '!bg-green-50 !text-green-700 !border-green-200' : 
                    tournament.approvalStatus === 'rejected' ? '!bg-red-50 !text-red-700 !border-red-200' : 
                    '!bg-yellow-50 !text-yellow-700 !border-yellow-200'
                  }`}>
                    {tournament.approvalStatus || 'pending'}
                  </div>
                </div>
                <div className="absolute bottom-3 left-3">
                  <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm border border-gray-200 text-gray-800 px-2.5 py-1 rounded-md shadow-sm">
                    <Trophy className="w-3.5 h-3.5 text-[#1abc60]" />
                    <span className="text-xs font-semibold capitalize">{tournament.sport}</span>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 flex flex-col flex-1">
                <div className="mb-4">
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-[#1abc60] transition-colors line-clamp-1">
                      {tournament.title}
                    </h3>
                    <div className="bg-emerald-50 text-[#1abc60] px-2 py-1 rounded-md border border-emerald-100 shrink-0">
                      <span className="text-xs font-bold">₹{tournament.entryFee || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5 text-gray-500">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <span className="text-sm font-medium line-clamp-1">
                      {tournament.location.venue}, {tournament.location.city}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-1.5 mb-1 text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">Start Date</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(tournament.startDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-1.5 mb-1 text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">End Date</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(tournament.endDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Registration Progress */}
                <div className="space-y-2 mt-auto mb-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600">Registrations</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {tournament.registeredTeams?.length || 0} / {tournament.maxTeams || '∞'}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#1abc60] transition-all duration-500 rounded-full" 
                      style={{ width: `${Math.min(((tournament.registeredTeams?.length || 0) / (tournament.maxTeams || 1)) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Link 
                      href={`/admin/tournaments/${tournament._id}`}
                      className="!flex !items-center !justify-center !w-8 !h-8 !text-gray-400 hover:!text-[#1abc60] hover:!bg-green-50 !rounded-md !transition-colors !bg-transparent !border-none !cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link 
                      href={`/admin/tournaments/edit/${tournament._id}`}
                      className="!flex !items-center !justify-center !w-8 !h-8 !text-gray-400 hover:!text-blue-500 hover:!bg-blue-50 !rounded-md !transition-colors !bg-transparent !border-none !cursor-pointer"
                      title="Edit Tournament"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(tournament._id)}
                      className="!flex !items-center !justify-center !w-8 !h-8 !text-gray-400 hover:!text-red-500 hover:!bg-red-50 !rounded-md !transition-colors !bg-transparent !border-none !cursor-pointer"
                      title="Delete Tournament"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {tournament.approvalStatus !== 'approved' && (
                      <button 
                        onClick={() => handleApproval(tournament._id, 'approved')}
                        className="!flex !items-center !justify-center !w-8 !h-8 !text-green-600 hover:!bg-green-50 !rounded-md !transition-colors !bg-transparent !border-none !cursor-pointer"
                        title="Approve"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    {tournament.approvalStatus !== 'rejected' && (
                      <button 
                        onClick={() => handleApproval(tournament._id, 'rejected')}
                        className="!flex !items-center !justify-center !w-8 !h-8 !text-red-600 hover:!bg-red-50 !rounded-md !transition-colors !bg-transparent !border-none !cursor-pointer"
                        title="Reject"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white py-16 px-6 rounded-xl border border-gray-200 text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
            <Trophy className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No tournaments found</h3>
          <p className="text-gray-500 text-sm mb-6">Start by creating your first tournament</p>
          <Link 
            href="/admin/tournaments/add"
            className="!inline-flex !items-center !justify-center !gap-2 !bg-[#1abc60] !text-white !px-5 !py-2.5 !rounded-lg !font-medium hover:!bg-[#17a554] !transition-colors !no-underline"
          >
            <Plus className="w-4 h-4" />
            Add Tournament
          </Link>
        </div>
      )}
    </div>
  );
}