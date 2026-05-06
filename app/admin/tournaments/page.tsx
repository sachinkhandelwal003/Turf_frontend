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
  image?: string;
}

export default function TournamentsListPage() {
  const { isSuperadmin } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
    if (!window.confirm('Are you sure you want to delete this tournament?')) return;
    
    try {
      const res = await api.delete(`/tournaments/${id}`);
      if (res.data.success) {
        toast.success('Tournament deleted successfully');
        setTournaments(prev => prev.filter(t => t._id !== id));
      }
    } catch (error) {
      toast.error('Failed to delete tournament');
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
      case 'upcoming': return 'bg-blue-100 text-blue-700';
      case 'ongoing': return 'bg-green-100 text-green-700';
      case 'completed': 
      case 'finished': return 'bg-gray-100 text-gray-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'postponed': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tournaments</h1>
          <p className="text-gray-500 text-sm">Manage your sports tournaments and registrations</p>
        </div>
        <Link 
          href="/admin/tournaments/add"
          className="inline-flex items-center justify-center gap-2 bg-[#1abc60] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#16a352] transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Add Tournament
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-100">
        <div className="relative max-w-md group flex items-center bg-gray-50/50 border border-gray-100 rounded-full focus-within:bg-white focus:ring-4 focus:ring-green-50 focus:border-[#1abc60] transition-all">
          <div className="pl-6 pr-3 text-gray-400 group-focus-within:text-[#1abc60]">
            <Search className="w-5 h-5" />
          </div>
          <div className="w-px h-6 bg-gray-200" />
          <input 
            type="text"
            placeholder="Search tournaments by title or sport..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3.5 bg-transparent outline-none transition-all text-sm font-bold text-gray-700 placeholder:text-gray-300"
          />
        </div>
      </div>

      {/* Cards Grid */}
      {filteredTournaments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((tournament) => (
            <div key={tournament._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 group">
              {/* Card Image */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={getImageUrl(tournament.image || '')} 
                  alt={tournament.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                  <div className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg backdrop-blur-md ${getStatusColor(tournament.status)}`}>
                    {tournament.status}
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg backdrop-blur-md ${
                    tournament.approvalStatus === 'approved' ? 'bg-green-500 text-white' : 
                    tournament.approvalStatus === 'rejected' ? 'bg-red-500 text-white' : 
                    'bg-amber-500 text-white'
                  }`}>
                    {tournament.approvalStatus || 'pending'}
                  </div>
                </div>
                <div className="absolute bottom-4 left-4">
                  <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md text-white px-2.5 py-1 rounded-lg">
                    <Trophy className="w-3.5 h-3.5 text-[#1abc60]" />
                    <span className="text-[10px] font-bold uppercase tracking-wide">{tournament.sport}</span>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="text-lg font-black text-gray-900 leading-tight mb-1 group-hover:text-[#1abc60] transition-colors line-clamp-1">
                    {tournament.title}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-500">
                    <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
                    <span className="text-xs font-medium truncate">
                      {tournament.location.venue}, {tournament.location.city}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Start Date</span>
                    </div>
                    <p className="text-xs font-bold text-gray-700">
                      {new Date(tournament.startDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">End Date</span>
                    </div>
                    <p className="text-xs font-bold text-gray-700">
                      {new Date(tournament.endDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Registration Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#1abc60]" />
                      <span className="text-xs font-bold text-gray-600">Registrations</span>
                    </div>
                    <span className="text-xs font-black text-[#1abc60]">
                      {tournament.registeredTeams?.length || 0} / {tournament.maxTeams || '∞'}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#1abc60] transition-all duration-500" 
                      style={{ width: `${Math.min(((tournament.registeredTeams?.length || 0) / (tournament.maxTeams || 1)) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/admin/tournaments/${tournament._id}`}
                      className="p-2 text-gray-400 hover:text-[#1abc60] hover:bg-green-50 rounded-lg transition-all"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                    <Link 
                      href={`/admin/tournaments/edit/${tournament._id}`}
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                      title="Edit Tournament"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(tournament._id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete Tournament"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {isSuperadmin && (
                    <div className="flex items-center gap-2">
                      {tournament.approvalStatus !== 'approved' && (
                        <button 
                          onClick={() => handleApproval(tournament._id, 'approved')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                          title="Approve"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      )}
                      {tournament.approvalStatus !== 'rejected' && (
                        <button 
                          onClick={() => handleApproval(tournament._id, 'rejected')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Reject"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No tournaments found</h3>
          <p className="text-gray-500 text-sm mb-6">Start by creating your first tournament</p>
          <Link 
            href="/admin/tournaments/add"
            className="inline-flex items-center justify-center gap-2 bg-[#1abc60] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#16a352] transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Tournament
          </Link>
        </div>
      )}
    </div>
  );
}
