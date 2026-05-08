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
  Info,
  Image as ImageIcon,
  CheckCircle2
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

  if (loading) {
    return (
      <div className="!flex !items-center !justify-center !min-h-[60vh]">
        <Loader2 className="!w-10 !h-10 !animate-spin !text-[#1abc60]" />
      </div>
    );
  }

  if (!tournament) return null;

  return (
    <div className="!max-w-7xl !mx-auto !px-4 sm:!px-6 lg:!px-8 !py-8 !space-y-8">
      
      {/* Top Navigation & Actions */}
      <div className="!flex !flex-col sm:!flex-row sm:!items-center !justify-between !gap-4">
        <div className="!flex !items-center !gap-3">
          <Link 
            href="/admin/tournaments"
            className="!p-2.5 !bg-white !border !border-gray-200 !text-gray-500 hover:!text-[#1abc60] hover:!bg-gray-50 !rounded-xl !transition-colors !shadow-sm !cursor-pointer !no-underline"
          >
            <ArrowLeft className="!w-5 !h-5 !block !shrink-0" />
          </Link>
          <div>
            <h1 className="!text-2xl !font-bold !text-gray-900 !tracking-tight !m-0">Tournament Details</h1>
            <p className="!text-sm !text-gray-500 !font-medium !m-0 !mt-0.5">Review and manage tournament configuration</p>
          </div>
        </div>

        <div className="!flex !flex-wrap !items-center !gap-3">
          {isSuperadmin && (
            <>
              {tournament.approvalStatus !== 'approved' && (
                <button 
                  onClick={() => handleApproval('approved')}
                  className="!px-5 !py-2.5 !bg-[#1abc60] !text-white !rounded-xl !text-sm !font-bold hover:!bg-[#17a554] !transition-colors !shadow-sm !flex !items-center !gap-2 !border-none !cursor-pointer"
                >
                  <CheckCircle2 className="!w-4 !h-4 !block !shrink-0" />
                  Approve
                </button>
              )}
              {tournament.approvalStatus !== 'rejected' && (
                <button 
                  onClick={() => handleApproval('rejected')}
                  className="!px-5 !py-2.5 !bg-red-600 !text-white !rounded-xl !text-sm !font-bold hover:!bg-red-700 !transition-colors !shadow-sm !flex !items-center !gap-2 !border-none !cursor-pointer"
                >
                  <XCircle className="!w-4 !h-4 !block !shrink-0" />
                  Reject
                </button>
              )}
            </>
          )}
          <Link 
            href={`/admin/tournaments/edit/${tournament._id}`}
            className="!px-5 !py-2.5 !bg-white !border !border-gray-200 !text-gray-700 !rounded-xl !text-sm !font-bold hover:!bg-gray-50 hover:!text-[#1abc60] !transition-colors !shadow-sm !flex !items-center !gap-2 !no-underline"
          >
            <Edit className="!w-4 !h-4 !block !shrink-0" />
            Edit Details
          </Link>
        </div>
      </div>

      {/* Header Banner Component */}
      <div className="!bg-gray-900 !rounded-[24px] !border !border-gray-200 !shadow-md !overflow-hidden !relative">
        <div className="!h-64 sm:!h-80 !w-full !relative">
          <img 
            src={getImageUrl(tournament.image || '')} 
            alt={tournament.title}
            className="!w-full !h-full !object-cover !opacity-60"
          />
          <div className="!absolute !inset-0 !bg-gradient-to-t !from-gray-900 !via-gray-900/60 !to-transparent"></div>
          
          <div className="!absolute !bottom-8 !left-8 !right-8">
            <div className="!flex !flex-wrap !items-center !gap-2 !mb-4">
              <span className={`!px-3 !py-1 !rounded-md !text-[10px] !font-bold !uppercase !tracking-wider !border ${
                tournament.status === 'upcoming' ? '!bg-blue-500/20 !text-blue-300 !border-blue-500/30' :
                tournament.status === 'ongoing' ? '!bg-emerald-500/20 !text-emerald-300 !border-emerald-500/30' :
                '!bg-gray-500/20 !text-gray-300 !border-gray-500/30'
              }`}>
                {tournament.status}
              </span>
              <span className={`!px-3 !py-1 !rounded-md !text-[10px] !font-bold !uppercase !tracking-wider !border ${
                tournament.approvalStatus === 'approved' ? '!bg-emerald-500/20 !text-emerald-300 !border-emerald-500/30' : 
                tournament.approvalStatus === 'rejected' ? '!bg-red-500/20 !text-red-300 !border-red-500/30' : 
                '!bg-amber-500/20 !text-amber-300 !border-amber-500/30'
              }`}>
                {tournament.approvalStatus || 'pending'}
              </span>
              <span className="!px-3 !py-1 !rounded-md !bg-white/10 !backdrop-blur-md !border !border-white/20 !text-white !text-[10px] !font-bold !uppercase !tracking-wider">
                {tournament.sport}
              </span>
            </div>
            <h1 className="!text-3xl md:!text-5xl !font-bold !text-white !tracking-tight !mb-4">
              {tournament.title}
            </h1>
            <div className="!flex !flex-wrap !items-center !gap-6 !text-white/80 !text-sm !font-medium">
              <div className="!flex !items-center !gap-2">
                <Calendar className="!w-4 !h-4 !text-[#1abc60]" />
                {new Date(tournament.startDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} - {new Date(tournament.endDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
              </div>
              <div className="!flex !items-center !gap-2">
                <MapPin className="!w-4 !h-4 !text-[#1abc60]" />
                {tournament.location.venue}, {tournament.location.city}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="!grid !grid-cols-1 lg:!grid-cols-3 !gap-8">
        
        {/* Left Column: Details */}
        <div className="lg:!col-span-2 !space-y-8">
          
          {/* Overview Section */}
          <section className="!bg-white !p-8 !rounded-[24px] !shadow-sm !border !border-gray-200">
            <h2 className="!text-lg !font-bold !text-gray-900 !border-b !border-gray-100 !pb-4 !mb-6 !flex !items-center !gap-3">
              <div className="!w-8 !h-8 !rounded-lg !bg-green-50 !flex !items-center !justify-center">
                <Layout className="!w-4 !h-4 !text-[#1abc60]" />
              </div>
              Tournament Overview
            </h2>
            <div className="!text-sm !text-gray-600 !leading-relaxed !mb-8 !whitespace-pre-wrap">
              {tournament.description}
            </div>
            
            {/* PERFECTED: Clean, White Cards for Stats */}
            <div className="!grid !grid-cols-2 md:!grid-cols-4 !gap-4">
              {[
                { label: 'Sport', value: tournament.sport, icon: Trophy, color: 'text-blue-500', bg: 'bg-blue-50' },
                { label: 'Match Type', value: tournament.matchType || 'N/A', icon: Layout, color: 'text-orange-500', bg: 'bg-orange-50' },
                { label: 'Format', value: tournament.format || 'Standard', icon: ListOrdered, color: 'text-purple-500', bg: 'bg-purple-50' },
                { label: 'Team Size', value: `${tournament.teamSize || 11} Players`, icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-50' },
              ].map((stat, i) => (
                <div key={i} className="!p-5 !rounded-2xl !border !border-gray-100 !bg-white !shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] !flex !flex-col !items-start !gap-3">
                  <div className={`!w-10 !h-10 !rounded-full ${stat.bg} ${stat.color} !flex !items-center !justify-center`}>
                    <stat.icon className="!w-5 !h-5" />
                  </div>
                  <div>
                    <p className="!text-[10px] !font-bold !text-gray-400 !uppercase !tracking-wider !mb-0.5">{stat.label}</p>
                    <p className="!text-sm !font-bold !text-gray-900 !leading-tight">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Format & Rules Section */}
          <section className="!bg-white !p-8 !rounded-[24px] !shadow-sm !border !border-gray-200">
            <h2 className="!text-lg !font-bold !text-gray-900 !border-b !border-gray-100 !pb-4 !mb-6 !flex !items-center !gap-3">
              <div className="!w-8 !h-8 !rounded-lg !bg-green-50 !flex !items-center !justify-center">
                <ListOrdered className="!w-4 !h-4 !text-[#1abc60]" />
              </div>
              Format & Rules
            </h2>
            <div className="!space-y-3">
              {tournament.rules && tournament.rules.length > 0 ? (
                tournament.rules.map((rule, idx) => (
                  <div key={idx} className="!flex !items-start !gap-4 !p-4 !bg-gray-50 !rounded-xl !border !border-gray-100">
                    <div className="!w-6 !h-6 !rounded-full !bg-white !border !border-gray-200 !text-gray-500 !flex !items-center !justify-center !text-xs !font-bold !shrink-0 !shadow-sm">
                      {idx + 1}
                    </div>
                    <p className="!text-sm !text-gray-700 !font-medium !leading-relaxed !pt-0.5">{rule}</p>
                  </div>
                ))
              ) : (
                <p className="!text-gray-500 !text-sm !italic !font-medium !p-6 !bg-gray-50 !rounded-xl !border !border-dashed !border-gray-200 !text-center">
                  No specific rules mentioned for this tournament.
                </p>
              )}
            </div>
          </section>

          {/* Crucial Details Section */}
          {(tournament.crucialDetails?.eligibility || tournament.crucialDetails?.venueGuidelines || tournament.crucialDetails?.refundPolicy) && (
            <section className="!bg-white !p-8 !rounded-[24px] !shadow-sm !border !border-gray-200">
              <h2 className="!text-lg !font-bold !text-gray-900 !border-b !border-gray-100 !pb-4 !mb-6 !flex !items-center !gap-3">
                <div className="!w-8 !h-8 !rounded-lg !bg-green-50 !flex !items-center !justify-center">
                  <ShieldCheck className="!w-4 !h-4 !text-[#1abc60]" />
                </div>
                Crucial Details
              </h2>
              
              {/* PERFECTED: Clean White Cards with Colored Icons for Crucial Details */}
              <div className="!grid !grid-cols-1 md:!grid-cols-3 !gap-5">
                {tournament.crucialDetails?.eligibility && (
                  <div className="!p-6 !bg-white !rounded-2xl !border !border-gray-100 !shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] !flex !flex-col !gap-3">
                    <div className="!flex !items-center !gap-2">
                      <ShieldCheck className="!w-5 !h-5 !text-emerald-500" />
                      <h3 className="!text-xs !font-bold !text-gray-900 !uppercase !tracking-wider !m-0">Eligibility</h3>
                    </div>
                    <p className="!text-sm !text-gray-600 !font-medium !leading-relaxed !m-0">{tournament.crucialDetails.eligibility}</p>
                  </div>
                )}
                {tournament.crucialDetails?.venueGuidelines && (
                  <div className="!p-6 !bg-white !rounded-2xl !border !border-gray-100 !shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] !flex !flex-col !gap-3">
                    <div className="!flex !items-center !gap-2">
                      <MapPin className="!w-5 !h-5 !text-orange-500" />
                      <h3 className="!text-xs !font-bold !text-gray-900 !uppercase !tracking-wider !m-0">Venue Guidelines</h3>
                    </div>
                    <p className="!text-sm !text-gray-600 !font-medium !leading-relaxed !m-0">{tournament.crucialDetails.venueGuidelines}</p>
                  </div>
                )}
                {tournament.crucialDetails?.refundPolicy && (
                  <div className="!p-6 !bg-white !rounded-2xl !border !border-gray-100 !shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] !flex !flex-col !gap-3">
                    <div className="!flex !items-center !gap-2">
                      <Info className="!w-5 !h-5 !text-blue-500" />
                      <h3 className="!text-xs !font-bold !text-gray-900 !uppercase !tracking-wider !m-0">Refund Policy</h3>
                    </div>
                    <p className="!text-sm !text-gray-600 !font-medium !leading-relaxed !m-0">{tournament.crucialDetails.refundPolicy}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Gallery Section */}
          {tournament.gallery && tournament.gallery.length > 0 && (
            <section className="!bg-white !p-8 !rounded-[24px] !shadow-sm !border !border-gray-200">
              <h2 className="!text-lg !font-bold !text-gray-900 !border-b !border-gray-100 !pb-4 !mb-6 !flex !items-center !gap-3">
                <div className="!w-8 !h-8 !rounded-lg !bg-green-50 !flex !items-center !justify-center">
                  <ImageIcon className="!w-4 !h-4 !text-[#1abc60]" />
                </div>
                Tournament Gallery
              </h2>
              <div className="!grid !grid-cols-2 sm:!grid-cols-3 md:!grid-cols-4 !gap-4">
                {tournament.gallery.map((img, idx) => (
                  <div key={idx} className="!aspect-square !rounded-xl !overflow-hidden !border !border-gray-200 !bg-gray-50 !group">
                    <img 
                      src={getImageUrl(img)} 
                      alt={`Gallery ${idx + 1}`} 
                      className="!w-full !h-full !object-cover group-hover:!scale-110 !transition-transform !duration-500" 
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Sidebar */}
        <div className="!space-y-6">
          
          {/* Registration Card */}
          <div className="!bg-white !p-8 !rounded-[24px] !shadow-sm !border !border-gray-200 !space-y-6">
            <div>
              <p className="!text-xs !font-bold !text-gray-400 !uppercase !tracking-wider !mb-2">Entry Fee</p>
              <div className="!flex !items-baseline !gap-1.5">
                <span className="!text-4xl !font-bold !text-gray-900 !tracking-tight">₹{tournament.entryFee}</span>
                <span className="!text-sm !font-semibold !text-gray-500">/Team</span>
              </div>
            </div>

            <div className="!pt-4 !border-t !border-gray-100">
              <p className="!text-sm !text-gray-500 !font-medium !leading-relaxed">
                Registration closes securely on <br/>
                <span className="!font-bold !text-gray-900">{new Date(tournament.registrationDeadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </p>
            </div>
          </div>

          {/* Location Details */}
          <div className="!bg-white !p-8 !rounded-[24px] !shadow-sm !border !border-gray-200 !space-y-6">
            <h2 className="!text-sm !font-bold !text-gray-900 !uppercase !tracking-wider !border-b !border-gray-100 !pb-3">Location Details</h2>
            
            <div className="!flex !items-start !gap-4">
              <div className="!w-10 !h-10 !rounded-full !bg-green-50 !flex !items-center !justify-center !shrink-0 !border !border-green-100">
                <MapPin className="!w-4 !h-4 !text-[#1abc60]" />
              </div>
              <div className="!min-w-0 !pt-0.5">
                <p className="!text-sm !font-bold !text-gray-900 !truncate">{tournament.location.venue}</p>
                <p className="!text-xs !text-gray-500 !mt-1 !leading-relaxed">{tournament.location.address}, {tournament.location.city}</p>
              </div>
            </div>

            <div className="!relative !h-40 !w-full !rounded-xl !overflow-hidden !bg-gray-100 !border !border-gray-200">
              {toEmbedUrl(tournament.location.mapUrl || "") || (tournament.location.venue && tournament.location.city) ? (
                <iframe
                  title="Tournament Location"
                  src={toEmbedUrl(tournament.location.mapUrl || "") || `https://www.google.com/maps?q=${encodeURIComponent([tournament.location.venue, tournament.location.address, tournament.location.city].filter(Boolean).join(', '))}&output=embed`}
                  className="!w-full !h-full !border-0"
                  loading="lazy"
                />
              ) : (
                <div className="!w-full !h-full !flex !flex-col !items-center !justify-center !text-gray-400 !gap-2">
                  <Map className="!w-6 !h-6" />
                  <span className="!text-xs !font-medium">Map Unavailable</span>
                </div>
              )}
            </div>
            
            {tournament.location.mapUrl && (
              <a 
                href={tournament.location.mapUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="!flex !items-center !justify-between !p-4 !bg-gray-50 !rounded-xl hover:!bg-gray-100 !transition-colors !border !border-gray-200 !no-underline !group"
              >
                <div className="!flex !items-center !gap-3">
                  <Map className="!w-4 !h-4 !text-gray-400 group-hover:!text-[#1abc60] !transition-colors" />
                  <span className="!text-xs !font-bold !text-gray-700">Open in Maps</span>
                </div>
                <ExternalLink className="!w-4 !h-4 !text-gray-400" />
              </a>
            )}
          </div>

          {/* Organizer Contact */}
          <div className="!bg-white !p-8 !rounded-[24px] !shadow-sm !border !border-gray-200 !space-y-5">
            <h2 className="!text-sm !font-bold !text-gray-900 !uppercase !tracking-wider !border-b !border-gray-100 !pb-3">Organizer Contact</h2>
            
            <div className="!space-y-4">
              <div className="!flex !items-center !gap-4">
                <div className="!w-10 !h-10 !rounded-full !bg-gray-50 !border !border-gray-200 !flex !items-center !justify-center !shrink-0">
                  <UserIcon className="!w-4 !h-4 !text-gray-500" />
                </div>
                <div className="!min-w-0">
                  <p className="!text-[10px] !font-bold !text-gray-400 !uppercase !tracking-wider">Name</p>
                  <p className="!text-sm !font-bold !text-gray-900 !truncate">{tournament.contact?.name || 'Admin'}</p>
                </div>
              </div>

              {tournament.contact?.phone && (
                <div className="!flex !items-center !gap-4">
                  <div className="!w-10 !h-10 !rounded-full !bg-gray-50 !border !border-gray-200 !flex !items-center !justify-center !shrink-0">
                    <Phone className="!w-4 !h-4 !text-gray-500" />
                  </div>
                  <div className="!min-w-0">
                    <p className="!text-[10px] !font-bold !text-gray-400 !uppercase !tracking-wider">Phone</p>
                    <p className="!text-sm !font-bold !text-gray-900 !truncate">{tournament.contact.phone}</p>
                  </div>
                </div>
              )}

              {tournament.contact?.email && (
                <div className="!flex !items-center !gap-4">
                  <div className="!w-10 !h-10 !rounded-full !bg-gray-50 !border !border-gray-200 !flex !items-center !justify-center !shrink-0">
                    <Mail className="!w-4 !h-4 !text-gray-500" />
                  </div>
                  <div className="!min-w-0">
                    <p className="!text-[10px] !font-bold !text-gray-400 !uppercase !tracking-wider">Email</p>
                    <p className="!text-sm !font-bold !text-gray-900 !truncate">{tournament.contact.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}