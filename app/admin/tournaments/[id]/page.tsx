"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Trophy, 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Loader2, 
  Trophy as TrophyIcon,
  DollarSign,
  Clock,
  ShieldCheck,
  Edit,
  XCircle,
  ListOrdered,
  Award,
  Phone,
  Mail,
  User as UserIcon,
  ExternalLink,
  Map,
  Layout,
  Info
} from 'lucide-react';
import Link from 'next/link';
import api from '@/app/services/api';
import { toast } from 'sonner';
import { useAuth } from '@/app/context/AuthContext';

interface Tournament {
  _id: string;
  title: string;
  description: string;
  sport: string;
  matchType?: string;
  format?: string;
  teamSize?: number;
  maxSubstitutes?: number;
  minPlayers?: number;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  location: {
    address: string;
    city: string;
    venue: string;
    mapUrl?: string;
  };
  crucialDetails?: {
    eligibility?: string;
    venueGuidelines?: string;
    refundPolicy?: string;
  };
  entryFee: number;
  prizePool: string;
  prizes?: {
    winner?: string;
    runnerUp?: string;
    others?: string;
  };
  rules?: string[];
  contact?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  maxTeams: number;
  registeredTeams: any[];
  status: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  image?: string;
  gallery?: string[];
}

export default function TournamentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isSuperadmin } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const res = await api.get(`/tournaments/${id}`);
        if (res.data.success) {
          setTournament(res.data.tournament);
        }
      } catch (error) {
        toast.error('Failed to load tournament details');
        router.push('/admin/tournaments');
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [id, router]);

  const handleApproval = async (status: 'approved' | 'rejected') => {
    try {
      const res = await api.patch(`/tournaments/${id}/approve`, { status });
      if (res.data.success) {
        toast.success(`Tournament ${status} successfully`);
        setTournament(prev => prev ? { ...prev, approvalStatus: status } : null);
      }
    } catch (error) {
      toast.error('Failed to update approval status');
    }
  };

  const getImageUrl = (path: string) => {
    if (!path) return '/heroimage.png';
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5001';
    return `${baseUrl}${path}`;
  };

  const toEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('output=embed') || url.includes('/maps/embed')) return url;

    const latLngMatch = url.match(/q=(-?\d+(\.\d+)?),(-?\d+(\.\d+)?)/);
    if (latLngMatch?.[1] && latLngMatch?.[3]) {
      return `https://www.google.com/maps?q=${latLngMatch[1]},${latLngMatch[3]}&output=embed`;
    }

    if (url.includes('google.com/maps')) {
      return `${url}${url.includes('?') ? '&' : '?'}output=embed`;
    }

    return url;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-700';
      case 'ongoing': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
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

  if (!tournament) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative h-[400px] w-full rounded-3xl overflow-hidden shadow-2xl">
        <img 
          src={getImageUrl(tournament.image || '')} 
          alt={tournament.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        
        {/* Back Button */}
        <Link 
          href="/admin/tournaments"
          className="absolute top-6 left-6 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-all shadow-xl"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>

        {/* Banner Info */}
        <div className="absolute bottom-10 left-10 right-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-3">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${getStatusColor(tournament.status)}`}>
                  {tournament.status}
                </span>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${
                  tournament.approvalStatus === 'approved' ? 'bg-green-500 text-white' : 
                  tournament.approvalStatus === 'rejected' ? 'bg-red-500 text-white' : 
                  'bg-amber-500 text-white'
                }`}>
                  {tournament.approvalStatus || 'pending'}
                </span>
                <span className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest">
                  {tournament.sport}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] relative z-20">
                {tournament.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-white font-bold text-sm relative z-20">
                <div className="flex items-center gap-2 drop-shadow-md">
                  <Calendar className="w-4 h-4 text-[#1abc60]" />
                  {new Date(tournament.startDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} - {new Date(tournament.endDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-2 drop-shadow-md">
                  <MapPin className="w-4 h-4 text-[#1abc60]" />
                  {tournament.location.venue}, {tournament.location.city}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              {isSuperadmin && (
                <>
                  {tournament.approvalStatus !== 'approved' && (
                    <button 
                      onClick={() => handleApproval('approved')}
                      className="px-8 py-4 bg-green-600 text-white rounded-2xl font-black text-lg hover:bg-green-700 transition-all shadow-2xl shadow-green-500/20 active:scale-95 flex items-center gap-3"
                    >
                      <ShieldCheck className="w-6 h-6" />
                      Approve
                    </button>
                  )}
                  {tournament.approvalStatus !== 'rejected' && (
                    <button 
                      onClick={() => handleApproval('rejected')}
                      className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black text-lg hover:bg-red-700 transition-all shadow-2xl shadow-red-500/20 active:scale-95 flex items-center gap-3"
                    >
                      <XCircle className="w-6 h-6" />
                      Reject
                    </button>
                  )}
                </>
              )}
              <Link 
                href={`/admin/tournaments/edit/${tournament._id}`}
                className="px-8 py-4 bg-[#1abc60] text-white rounded-2xl font-black text-lg hover:bg-[#16a352] transition-all shadow-2xl shadow-green-500/20 active:scale-95 flex items-center gap-3"
              >
                <Edit className="w-6 h-6" />
                Edit Details
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview Section */}
          <section className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <div className="w-2 h-8 bg-[#1abc60] rounded-full"></div>
              The Tournament Overview
            </h2>
            <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed font-medium">
              {tournament.description}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
              {[
                { label: 'Sport', value: tournament.sport, icon: Trophy, color: 'text-blue-500', bg: 'bg-blue-50' },
                { label: 'Match Type', value: tournament.matchType || 'N/A', icon: Layout, color: 'text-orange-500', bg: 'bg-orange-50' },
                { label: 'Format', value: tournament.format || 'League/Knockout', icon: ListOrdered, color: 'text-purple-500', bg: 'bg-purple-50' },
                { label: 'Team Size', value: `${tournament.teamSize || 11} Players`, icon: Users, color: 'text-[#1abc60]', bg: 'bg-green-50' },
              ].map((stat, i) => (
                <div key={i} className={`${stat.bg} p-4 rounded-2xl border border-transparent hover:border-gray-100 transition-all`}>
                  <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-sm font-black text-gray-800">{stat.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Format & Rules Section */}
          <section className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <div className="w-2 h-8 bg-[#1abc60] rounded-full"></div>
              Format & Rules
            </h2>
            <div className="space-y-4">
              {tournament.rules && tournament.rules.length > 0 ? (
                tournament.rules.map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-5 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-[#1abc60] text-white flex items-center justify-center text-xs font-black shrink-0 shadow-lg shadow-green-100">
                      {idx + 1}
                    </div>
                    <p className="text-gray-700 font-bold leading-relaxed">{rule}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 italic font-medium">No specific rules mentioned for this tournament.</p>
              )}
            </div>
          </section>

          {/* Crucial Details Section */}
          {(tournament.crucialDetails?.eligibility || tournament.crucialDetails?.venueGuidelines || tournament.crucialDetails?.refundPolicy) && (
            <section className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 space-y-8">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                <div className="w-2 h-8 bg-[#1abc60] rounded-full"></div>
                Crucial Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {tournament.crucialDetails?.eligibility && (
                  <div className="p-6 bg-green-50/50 rounded-2xl border border-green-100/50 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1abc60] text-white flex items-center justify-center shadow-lg shadow-green-100">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-[#1abc60] uppercase tracking-widest">Eligibility</p>
                      <p className="text-sm font-bold text-gray-700 mt-1">{tournament.crucialDetails.eligibility}</p>
                    </div>
                  </div>
                )}
                {tournament.crucialDetails?.venueGuidelines && (
                  <div className="p-6 bg-orange-50/50 rounded-2xl border border-orange-100/50 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-100">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Venue Guidelines</p>
                      <p className="text-sm font-bold text-gray-700 mt-1">{tournament.crucialDetails.venueGuidelines}</p>
                    </div>
                  </div>
                )}
                {tournament.crucialDetails?.refundPolicy && (
                  <div className="p-6 bg-red-50/50 rounded-2xl border border-red-100/50 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-100">
                      <Info className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Refund Policy</p>
                      <p className="text-sm font-bold text-gray-700 mt-1">{tournament.crucialDetails.refundPolicy}</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Gallery Section */}
          {tournament.gallery && tournament.gallery.length > 0 && (
            <section className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 space-y-6">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                <div className="w-2 h-8 bg-[#1abc60] rounded-full"></div>
                Tournament Gallery
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {tournament.gallery.map((img, idx) => (
                  <div key={idx} className="aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <img 
                      src={getImageUrl(img)} 
                      alt={`Gallery ${idx + 1}`} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-8">
          {/* Registration Card */}
          <div className="bg-white p-8 rounded-[32px] shadow-xl border border-gray-100 space-y-6 sticky top-8">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Entry Fee</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-gray-900 tracking-tighter">₹{tournament.entryFee}</span>
                <span className="text-gray-400 font-bold text-sm">/Team</span>
              </div>
            </div>

            <button className="w-full bg-[#1abc60] text-white py-5 rounded-[20px] font-black text-lg hover:bg-[#16a352] transition-all shadow-xl shadow-green-100 active:scale-95">
              REGISTER NOW
            </button>
            <p className="text-[10px] text-gray-400 text-center font-bold uppercase tracking-tighter">
              Registration closes on {new Date(tournament.registrationDeadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </p>

            <div className="pt-6 border-t border-gray-50 space-y-6">
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">LOCATION DETAILS</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-[#1abc60]" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-800 leading-tight">{tournament.location.venue}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{tournament.location.address}, {tournament.location.city}</p>
                  </div>
                </div>

                <div className="relative h-[200px] w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 group">
                  {toEmbedUrl(tournament.location.mapUrl || "") || (tournament.location.venue && tournament.location.city) ? (
                    <iframe
                      title="Tournament Location"
                      src={toEmbedUrl(tournament.location.mapUrl || "") || `https://www.google.com/maps?q=${encodeURIComponent([tournament.location.venue, tournament.location.address, tournament.location.city].filter(Boolean).join(', '))}&output=embed`}
                      className="w-full h-full border-0"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Map className="w-8 h-8 text-gray-200" />
                    </div>
                  )}
                </div>
                
                {tournament.location.mapUrl && (
                  <a 
                    href={tournament.location.mapUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Map className="w-5 h-5 text-gray-400 group-hover:text-[#1abc60] transition-colors" />
                      <span className="text-xs font-bold text-gray-600">View on Maps</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-300" />
                  </a>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-50 space-y-6">
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">ORGANIZER CONTACT</h4>
              <div className="p-5 bg-gray-50 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                  </div>
                  <span className="text-xs font-bold text-gray-700">{tournament.contact?.name || 'Admin'}</span>
                </div>
                {tournament.contact?.phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                      <Phone className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-xs font-bold text-gray-700">{tournament.contact.phone}</span>
                  </div>
                )}
                {tournament.contact?.email && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                      <Mail className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-xs font-bold text-gray-700 truncate max-w-[150px]">{tournament.contact.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
