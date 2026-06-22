"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { 
  Trophy, MapPin, Search, Loader2, 
  Calendar, User as UserIcon,
  ChevronLeft, ChevronRight, Hash, Phone, Info, Clock, Users, ShieldCheck, Filter
} from 'lucide-react';
import api from '@/app/services/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Match {
  _id: string;
  title: string;
  description: string;
  sport: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPlayersNeeded: number;
  pricePerPlayer: number;
  status: 'open' | 'full' | 'cancelled' | 'completed' | 'cancelled hosting';
  isPrivate: boolean;
  host: {
    name: string;
    profilePhoto?: string;
    phone?: string;
  };
  turf: {
    name: string;
    location: {
      city: string;
    };
  };
  joinedPlayers: {
    user: {
      name: string;
      profilePhoto?: string;
      phone?: string;
    };
    status: string;
    joinedAt: string;
  }[];
  revenue: {
    total: number;
    adminShare: number;
    superAdminShare: number;
    confirmedPlayers: number;
  };
  createdAt: string;
}

export default function AdminMatchesPage() {
  const { isAuthenticated, isLoading: authLoading, isSuperadmin } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchMatches();
    }
  }, [authLoading, isAuthenticated, statusFilter]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/matches/admin/all`);
      if (res.data.success) {
        setMatches(res.data.matches);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch matches");
    } finally {
      setLoading(false);
    }
  };
  const handleCancelHosting = async (matchId: string) => {
    try {
      const confirm = window.confirm("Are you sure you want to cancel the hosting for this match? This action cannot be undone.");
      if (!confirm) return;

      const res = await api.patch(`/matches/${matchId}/cancel`);
      if (res.data.success) {
        toast.success("Match hosting cancelled successfully");
        fetchMatches();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel match hosting");
    }
  };

  const filteredMatches = matches.filter(match => {
    const matchesSearch = match.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (match.host?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (match.turf?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || match.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate total revenue for the current view
  const stats = filteredMatches.reduce((acc, match) => {
    acc.total += match.revenue.total;
    acc.admin += match.revenue.adminShare;
    acc.superAdmin += match.revenue.superAdminShare;
    return acc;
  }, { total: 0, admin: 0, superAdmin: 0 });

  if (authLoading || loading) {
    return (
      <div className="!min-h-[80vh] !flex !items-center !justify-center">
        <Loader2 className="!w-10 !h-10 !animate-spin !text-[#1abc60]" />
      </div>
    );
  }

  return (
    <div className="!max-w-[1600px] !mx-auto !p-4 lg:!p-8">
      {/* Header Section */}
      <div className="!flex !flex-col md:!flex-row md:!items-center !justify-between !gap-4 !mb-8">
        <div>
          <h1 className="!text-2xl lg:!text-3xl !font-bold !text-gray-900 !flex !items-center !gap-3">
            <Trophy className="!w-8 !h-8 !text-[#1abc60]" />
            Match Hosting History
          </h1>
          <p className="!text-gray-500 !mt-1">Manage and track matches hosted on your venues</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="!grid !grid-cols-1 md:!grid-cols-3 !gap-6 !mb-8">
        <div className="!bg-white !p-6 !rounded-3xl !border !border-gray-100 !shadow-sm">
          <p className="!text-sm !text-gray-500 !font-medium">Total Match Revenue</p>
          <h3 className="!text-2xl !font-bold !text-gray-900 !mt-1">₹{stats.total.toLocaleString()}</h3>
        </div>
        <div className="!bg-white !p-6 !rounded-3xl !border !border-gray-100 !shadow-sm">
          <p className="!text-sm !text-gray-500 !font-medium">Admin Share (80%)</p>
          <h3 className="!text-2xl !font-bold !text-[#1abc60] !mt-1">₹{stats.admin.toLocaleString()}</h3>
        </div>
        <div className="!bg-white !p-6 !rounded-3xl !border !border-gray-100 !shadow-sm">
          <p className="!text-sm !text-gray-500 !font-medium">Super Admin Share (20%)</p>
          <h3 className="!text-2xl !font-bold !text-blue-600 !mt-1">₹{stats.superAdmin.toLocaleString()}</h3>
        </div>
      </div>

      {/* Filters Section */}
      <div className="!bg-white !rounded-2xl !p-6 !shadow-sm !border !border-gray-100 !mb-8">
        <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
          {/* Search */}
          <div className="!relative">
            <Search className="!absolute !left-3 !top-1/2 !-translate-y-1/2 !text-gray-400 !w-5 !h-5" />
            <input
              type="text"
              placeholder="Search by title, host, or turf..."
              className="!w-full !pl-10 !pr-4 !py-3 !rounded-xl !border !border-gray-200 focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="!flex !items-center !gap-2">
            <Filter className="!w-5 !h-5 !text-gray-400" />
            <select
              className="!w-full !px-4 !py-3 !rounded-xl !border !border-gray-200 focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-all"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="full">Full</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="cancelled hosting">Cancelled Hosting</option>
            </select>
          </div>
        </div>
      </div>

      {/* Matches List */}
      <div className="!grid !grid-cols-1 xl:!grid-cols-2 !gap-6">
        <AnimatePresence mode="popLayout">
          {filteredMatches.map((match) => (
            <motion.div
              key={match._id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="!bg-white !rounded-3xl !shadow-sm !border !border-gray-100 !overflow-hidden hover:!shadow-md !transition-all"
            >
              {/* Card Header */}
              <div className="!p-6 !border-b !border-gray-50 !bg-gray-50/50">
                <div className="!flex !flex-col sm:!flex-row sm:!items-start !justify-between !gap-4">
                  <div className="!flex-1 !w-full">
                    <div className="!flex !items-center !gap-2 !mb-2">
                      <span className={`!px-3 !py-1 !rounded-full !text-xs !font-bold !uppercase !tracking-wider ${
                        match.status === 'open' ? '!bg-green-100 !text-green-700' :
                        match.status === 'full' ? '!bg-blue-100 !text-blue-700' :
                        match.status === 'completed' ? '!bg-gray-100 !text-gray-700' :
                        match.status === 'cancelled hosting' ? '!bg-rose-100 !text-rose-700' :
                        '!bg-red-100 !text-red-700'
                      }`}>
                        {match.status === 'cancelled hosting' ? 'cancelled hosting' : match.status}
                      </span>
                      {match.isPrivate && (
                        <span className="!px-3 !py-1 !bg-amber-100 !text-amber-700 !rounded-full !text-xs !font-bold !uppercase !tracking-wider">
                          Private
                        </span>
                      )}
                    </div>
                    <h3 className="!text-xl !font-bold !text-gray-900 !line-clamp-1">{match.title}</h3>
                    <p className="!text-[#1abc60] !font-semibold !flex !items-center !gap-1.5 !mt-1">
                      <MapPin className="!w-4 !h-4" />
                      {match.turf?.name || 'Unknown Venue'}
                    </p>
                  </div>
                  <div className="!text-left sm:!text-right !shrink-0 !border-t sm:!border-t-0 !border-gray-100 !pt-4 sm:!pt-0 !flex sm:!flex-col !justify-between sm:!justify-start !gap-4 !w-full sm:!w-auto">
                    <div>
                      <p className="!text-[10px] !font-bold !text-gray-400 !uppercase !tracking-wider">Sport</p>
                      <p className="!font-bold !text-gray-900 !text-sm">{match.sport}</p>
                    </div>
                    <div>
                      <p className="!text-[10px] !font-bold !text-gray-400 !uppercase !tracking-wider">Price/Player</p>
                      <p className="!text-base !font-black !text-gray-900">₹{match.pricePerPlayer}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="!p-6 !grid !grid-cols-1 md:!grid-cols-2 !gap-6">
                {/* Match Info & Revenue */}
                <div className="!space-y-4">
                  <div className="!grid !grid-cols-2 !gap-4">
                    <div className="!flex !items-center !gap-3">
                      <div className="!w-10 !h-10 !rounded-xl !bg-blue-50 !flex !items-center !justify-center !text-blue-600">
                        <Calendar className="!w-5 !h-5" />
                      </div>
                      <div>
                        <p className="!text-xs !text-gray-500">Date</p>
                        <p className="!font-bold !text-gray-900">{match.date}</p>
                      </div>
                    </div>
                    <div className="!flex !items-center !gap-3">
                      <div className="!w-10 !h-10 !rounded-xl !bg-purple-50 !flex !items-center !justify-center !text-purple-600">
                        <Clock className="!w-5 !h-5" />
                      </div>
                      <div>
                        <p className="!text-xs !text-gray-500">Time</p>
                        <p className="!font-bold !text-gray-900">{match.startTime}</p>
                      </div>
                    </div>
                  </div>

                  <div className="!bg-[#1abc60]/5 !rounded-2xl !p-4 !border !border-[#1abc60]/10">
                    <div className="!flex !items-center !justify-between !mb-2">
                      <span className="!text-sm !font-medium !text-gray-600">Total Revenue</span>
                      <span className="!text-lg !font-bold !text-gray-900">₹{match.revenue.total}</span>
                    </div>
                    <div className="!flex !items-center !justify-between !text-xs !mb-1">
                      <span className="!text-gray-500">Admin Share (80%)</span>
                      <span className="!font-bold !text-[#1abc60]">₹{match.revenue.adminShare}</span>
                    </div>
                    <div className="!flex !items-center !justify-between !text-xs">
                      <span className="!text-gray-500">Super Admin (20%)</span>
                      <span className="!font-bold !text-blue-600">₹{match.revenue.superAdminShare}</span>
                    </div>
                  </div>
                </div>

                {/* Host Info */}
                <div className="!bg-gray-50 !rounded-2xl !p-4 !flex !flex-col !justify-center">
                  <p className="!text-xs !text-gray-500 !mb-3 !font-bold !uppercase !tracking-wider">Host Details</p>
                  <div className="!flex !items-center !gap-3">
                    <div className="!relative !w-12 !h-12 !rounded-xl !overflow-hidden !bg-gray-200">
                      {match.host?.profilePhoto ? (
                        <img src={match.host.profilePhoto} alt={match.host?.name || 'Host'} className="!w-full !h-full !object-cover" />
                      ) : (
                        <div className="!w-full !h-full !flex !items-center !justify-center !text-gray-400">
                          <UserIcon className="!w-6 !h-6" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="!font-bold !text-gray-900 !line-clamp-1">{match.host?.name || 'Unknown Host'}</p>
                      <p className="!text-xs !text-gray-500 !flex !items-center !gap-1">
                        <Phone className="!w-3 !h-3" />
                        {match.host?.phone || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Joined Players Section */}
              <div className="!p-6 !bg-gray-50/30 !border-t !border-gray-50">
                <div className="!flex !flex-col sm:!flex-row sm:!items-center !justify-between !gap-3 !mb-4">
                  <h4 className="!text-sm !font-bold !text-gray-900 !flex !items-center !gap-2 !w-full sm:!w-auto">
                    <ShieldCheck className="!w-4 !h-4 !text-[#1abc60] !shrink-0" />
                    Confirmed Players ({match.revenue.confirmedPlayers} / {match.totalPlayersNeeded})
                  </h4>
                  {(match.status === 'open' || match.status === 'full') && (
                    <button
                      onClick={() => handleCancelHosting(match._id)}
                      className="!px-3 !py-1.5 !text-xs !font-bold !text-red-600 hover:!bg-red-50 !rounded-lg !border !border-red-200 !transition-all !cursor-pointer !shrink-0 !w-full sm:!w-auto !text-center"
                    >
                      Cancel Hosting
                    </button>
                  )}
                </div>
                
                <div className="!flex !flex-wrap !gap-3">
                  {match.joinedPlayers.map((player, idx) => (
                    <div 
                      key={idx} 
                      className="!flex !items-center !gap-2 !bg-white !px-3 !py-2 !rounded-xl !border !border-gray-100 !shadow-sm"
                      title={player.user?.phone || 'No phone'}
                    >
                      <div className="!w-6 !h-6 !rounded-full !overflow-hidden !bg-gray-100">
                        {player.user?.profilePhoto ? (
                          <img src={player.user.profilePhoto} alt={player.user?.name || 'Player'} className="!w-full !h-full !object-cover" />
                        ) : (
                          <div className="!w-full !h-full !flex !items-center !justify-center !text-gray-400 !bg-gray-200">
                            <UserIcon className="!w-3 !h-3" />
                          </div>
                        )}
                      </div>
                      <span className="!text-xs !font-medium !text-gray-700">{player.user?.name || 'Deleted User'}</span>
                    </div>
                  ))}
                  {match.joinedPlayers.length === 0 && (
                    <p className="!text-xs !text-gray-400 !italic">No players joined yet</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredMatches.length === 0 && (
          <div className="!col-span-full !bg-white !rounded-3xl !p-12 !text-center !border !border-dashed !border-gray-200">
            <Trophy className="!w-16 !h-16 !text-gray-200 !mx-auto !mb-4" />
            <h3 className="!text-xl !font-bold !text-gray-900">No Matches Found</h3>
            <p className="!text-gray-500 !mt-2">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>
    </div>
  );
}