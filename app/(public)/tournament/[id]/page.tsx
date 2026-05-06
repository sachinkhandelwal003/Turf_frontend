"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { 
  MapPin, Users, Video, 
  CheckCircle2, Plus, Trash2, ShieldCheck, AlertCircle, HeadphonesIcon,
  ExternalLink,
  Loader2,
  Calendar,
  Award,
  Info,
  X,
  Phone,
  User,
  Map as MapIcon,
  Trophy,
  Medal,
  Mail,
  Contact
} from 'lucide-react';
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
  image?: string;
  gallery?: string[];
}

const TrophyWatermark = () => (
  <svg className="absolute -right-6 -bottom-6 w-56 h-56 text-white opacity-20 pointer-events-none" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 22c-2.76 0-5-2.24-5-5v-1c0-.55.45-1 1-1h8c.55 0 1 .45 1 1v1c0 2.76-2.24 5-5 5zm-3-6h6v1c0 1.65-1.35 3-3 3s-3-1.35-3-3v-1zm11-4h-2V7c0-2.21-1.79-4-4-4H9C6.79 3 5 4.79 5 7v5H3c-.55 0-1-.45-1-1V8c0-1.65 1.35-3 3-3h1V4c0-.55.45-1 1-1h6c.55 0 1 .45 1 1v1h1c1.65 0 3 1.35 3 3v3c0 .55-.45 1-1 1zm-1-5H5v5h14V7zM7 7h10v5H7V7z" />
  </svg>
);

export default function TournamentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { isAuthenticated } = useAuth();
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRegModal, setShowRegModal] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const res = await api.get(`/tournaments/${id}`);
        if (res.data.success) {
          setTournament(res.data.tournament);
        }
      } catch (error) {
        toast.error('Failed to load tournament details');
        router.push('/tournament');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTournament();
  }, [id, router]);

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

  const getImageUrl = (path: string) => {
    if (!path || path === 'undefined' || path === 'null' || path === '') return '/Tournamentfootball.jpg';
    if (path.startsWith('http')) return path;
    
    // Replace backslashes with forward slashes for cross-platform compatibility
    const normalizedPath = path.replace(/\\/g, '/');
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.rkinteriorstudio.in/api';
    const baseUrl = apiUrl.replace(/\/api$/, '').replace(/\/$/, '');
    const cleanPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
    return `${baseUrl}${cleanPath}`;
  };

  const formatPrice = (price: string | number) => {
    if (price === undefined || price === null || price === '') return '0';
    if (typeof price === 'string') {
      // If it's already formatted with symbols, just return it or clean it
      const cleaned = price.replace(/[^0-9]/g, '');
      if (!cleaned) return price; // Return original if no digits found (e.g. "TBA")
      return Number(cleaned).toLocaleString('en-IN');
    }
    return Number(price).toLocaleString('en-IN');
  };

  const [teamName, setTeamName] = useState("");
  const [captainName, setCaptainName] = useState("");
  const [mobile, setMobile] = useState("");
  const [altMobile, setAltMobile] = useState("");

  const isRegistrationClosed = () => {
    if (!tournament) return true;
    
    const now = new Date();
    const deadline = new Date(tournament.registrationDeadline);
    const isPastDeadline = now > deadline;
    const isFull = tournament.registeredTeams?.length >= (tournament.maxTeams || 16);
    const terminalStatuses = ['finished', 'completed', 'cancelled', 'postponed'];
    const isTerminalStatus = terminalStatuses.includes(tournament.status?.toLowerCase());

    return isPastDeadline || isFull || isTerminalStatus;
  };

  const getRegistrationStatusMessage = () => {
    if (!tournament) return "";
    const now = new Date();
    const deadline = new Date(tournament.registrationDeadline);
    const isFull = tournament.registeredTeams?.length >= (tournament.maxTeams || 16);
    
    if (tournament.status?.toLowerCase() === 'cancelled') return "Tournament Cancelled";
    if (tournament.status?.toLowerCase() === 'postponed') return "Tournament Postponed";
    if (tournament.status?.toLowerCase() === 'finished' || tournament.status?.toLowerCase() === 'completed') return "Tournament Finished";
    if (isFull) return "Tournament Full";
    if (now > deadline) return "Registration Closed";
    return "";
  };

  const handleRegisterClick = () => {
    if (!isAuthenticated) {
      toast.error("Please login to register for this tournament!");
      router.push(`/login?redirect=/tournament/${id}`);
      return;
    }

    if (isRegistrationClosed()) {
      toast.error(getRegistrationStatusMessage() || "Registration is no longer available.");
      return;
    }

    setShowRegModal(true);
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName || !captainName || !mobile) {
      toast.error("Please fill all required fields!");
      return;
    }

    setRegLoading(true);
    try {
      const res = await api.post(`/tournaments/${id}/register`, {
        teamName,
        captainName,
        phone: mobile,
        altPhone: altMobile
      });

      if (res.data.success) {
        toast.success("Registration Successful! 🎉");
        setShowRegModal(false);
        // Reset form
        setTeamName("");
        setCaptainName("");
        setMobile("");
        setAltMobile("");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setRegLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-[#1abc60]" />
      </div>
    );
  }

  if (!tournament) return null;

  const embedUrl = toEmbedUrl(tournament.location?.mapUrl || "");

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'upcoming': return 'bg-[#1abc60]';
      case 'ongoing': return 'bg-blue-500';
      case 'postponed': return 'bg-orange-500';
      case 'cancelled': return 'bg-red-500';
      case 'finished':
      case 'completed': return 'bg-gray-500';
      default: return 'bg-[#1abc60]';
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24" style={{ fontFamily: 'var(--font-main)' }}>
      
      {/* ================= 0. REGISTRATION MODAL ================= */}
      {showRegModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[500px] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-[#1e293b]">Tournament Registration</h2>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Complete your team details</p>
                </div>
                <button 
                  onClick={() => setShowRegModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleRegistrationSubmit} className="space-y-5">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Team Name</label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Kinetic Mavericks" 
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1abc60] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Captain Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        required
                        type="text" 
                        placeholder="Full Legal Name" 
                        value={captainName}
                        onChange={(e) => setCaptainName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1abc60] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Mobile Number</label>
                    <div className="relative flex">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-bold text-gray-400 border-r border-gray-200 pr-2">+91</span>
                      </div>
                      <input 
                        required
                        type="tel" 
                        placeholder="98765 43210" 
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-24 pr-5 py-4 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1abc60] transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={regLoading}
                    className="w-full bg-[#1abc60] hover:bg-[#169c4e] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-green-100 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {regLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Complete Registration"
                    )}
                  </button>
                  <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-4">
                    By clicking complete, you agree to the tournament rules and guidelines.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <div className="relative w-full h-[900px] md:h-[550px] flex flex-col justify-end pb-12">
        <div className="absolute inset-0 z-0 w-full h-full bg-[#111827]">
          <img 
            src={getImageUrl(tournament.image || "")} 
            alt={tournament.title} 
            className="w-full h-full object-cover object-center opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/80 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 lg:px-12 xl:px-16">
          <div className={`inline-flex items-center text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider mb-4 ${getStatusColor(tournament.status)}`}>
            <span className="w-1.5 h-1.5 bg-white rounded-full mr-2"></span>
            {tournament.status}
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight mb-6 leading-tight relative z-20">
            {tournament.title.split(' ').length > 2 ? (
              <>
                <span className="text-white drop-shadow-2xl">{tournament.title.split(' ').slice(0, 2).join(' ')}</span>
                <span className="text-[#1abc60] drop-shadow-2xl ml-2">{tournament.title.split(' ').slice(2).join(' ')}</span>
              </>
            ) : (
              <span className="text-white drop-shadow-2xl">{tournament.title}</span>
            )}
          </h1>
          
          <div className="flex flex-wrap items-center gap-8 md:gap-12 relative z-20">
            <div>
              <p className="text-white/80 text-[9px] font-black uppercase tracking-[0.2em] mb-1.5 drop-shadow-md">ENTRY FEE</p>
              <p className="text-xl md:text-2xl font-black text-white leading-none drop-shadow-2xl">₹ {formatPrice(tournament.entryFee)}</p>
            </div>
            <div>
              <p className="text-white/80 text-[9px] font-black uppercase tracking-[0.2em] mb-1.5 drop-shadow-md">DATES</p>
              <p className="text-xl md:text-2xl font-black text-white leading-none drop-shadow-2xl">
                {new Date(tournament.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(tournament.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 2. MAIN CONTENT ================= */}
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 xl:px-16 pt-12 flex flex-col lg:flex-row gap-12 lg:gap-20 justify-between">
        
        {/* LEFT COLUMN */}
        <div className="flex-1 min-w-0">
          
          {/* Overview */}
          <div className="mb-12">
            <h2 className="text-[20px] font-black text-[#1abc60] uppercase mb-4 tracking-wide">The Tournament Overview</h2>
            <p className="text-[14px] text-gray-600 leading-relaxed font-normal max-w-4xl">
              {tournament.description}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { label: "Registered", value: `${tournament.registeredTeams?.length || 0} Teams`, icon: Users },
              { label: "Format", value: tournament.format || tournament.matchType || "Tournament", icon: ShieldCheck },
              { label: "Sport", value: tournament.sport, icon: Trophy },
              { label: "Entry", value: `₹${formatPrice(tournament.entryFee)}`, icon: Medal }
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="bg-[#fcfcfd] rounded-[10px] p-5 flex flex-col items-start border border-gray-100 shadow-sm">
                  <Icon className="w-5 h-5 text-[#1abc60] mb-2.5" strokeWidth={1.5} />
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{stat.label}</span>
                  <span className="text-[15px] font-bold text-[#1e293b]">{stat.value}</span>
                </div>
              );
            })}
          </div>

          {/* Rules */}
          {tournament.rules && tournament.rules.length > 0 && (
            <div className="mb-12">
              <h2 className="text-[20px] font-black text-[#1abc60] uppercase mb-5 tracking-wide">Format & Rules</h2>
              <div className="bg-[#fcfcfd] rounded-[12px] p-7 space-y-4 border border-gray-100 shadow-sm">
                {tournament.rules.map((rule, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <div className="w-5 h-5 rounded-full bg-[#1abc60] text-white flex-shrink-0 flex items-center justify-center text-[11px] font-bold mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-[13px] text-gray-600 leading-relaxed font-medium">{rule}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gallery Section */}
          {tournament.gallery && tournament.gallery.length > 0 && (
            <div className="mb-12">
              <h2 className="text-[20px] font-black text-[#1abc60] uppercase mb-5 tracking-wide">Tournament Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {tournament.gallery.map((img, idx) => (
                  <div key={idx} className="aspect-square rounded-[12px] overflow-hidden border border-gray-100 shadow-sm">
                    <img src={getImageUrl(img)} alt={`Gallery ${idx}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ================= 3. RIGHT SIDEBAR ================= */}
        <div className="w-full lg:w-[340px] xl:w-[380px] flex-shrink-0 space-y-6 self-start lg:sticky lg:top-8">
          
          {/* Register Card */}
          <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1.5">ENTRY FEE</p>
            <div className="flex items-baseline gap-1 mb-5">
              <span className="text-4xl font-black text-[#1abc60] leading-none">₹ {formatPrice(tournament.entryFee)}</span>
              <span className="text-[12px] text-gray-500 font-bold">/team</span>
            </div>
            <button 
              onClick={handleRegisterClick}
              disabled={isRegistrationClosed()}
              className={`w-full text-[13px] font-black uppercase tracking-widest py-4 rounded-2xl transition-all mb-4 shadow-lg cursor-pointer border-none active:scale-[0.98] ${
                isRegistrationClosed() 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none' 
                  : 'bg-[#1abc60] hover:bg-[#169c4e] text-white shadow-green-100'
              }`}
            >
              {isRegistrationClosed() ? getRegistrationStatusMessage() : "REGISTER NOW"}
            </button>
            <p className="text-center text-[10px] text-gray-400 font-bold leading-relaxed uppercase tracking-tighter">
              Limited spots available. Registration closes on <br/><span className="text-gray-600 font-black">{new Date(tournament.registrationDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>.
            </p>
          </div>

          {/* Location Details */}
          <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm space-y-6">
            <h3 className="text-[12px] font-black text-gray-800 uppercase tracking-widest">LOCATION DETAILS</h3>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-[#1abc60]" />
              </div>
              <div className="space-y-1">
                <p className="text-[15px] font-black text-gray-800 leading-tight">{tournament.location.venue}</p>
                <p className="text-[11px] text-gray-500 font-bold leading-relaxed uppercase tracking-tighter">
                  {[tournament.location.address, tournament.location.city].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>

            <div className="relative h-[200px] w-full rounded-[20px] overflow-hidden bg-gray-50 border border-gray-100 group">
              {embedUrl || (tournament.location.venue && tournament.location.city) ? (
                <iframe
                  title="Tournament Location"
                  src={embedUrl || `https://www.google.com/maps?q=${encodeURIComponent([tournament.location.venue, tournament.location.address, tournament.location.city].filter(Boolean).join(', '))}&output=embed`}
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <MapIcon className="w-8 h-8 text-gray-200" />
                </div>
              )}
            </div>

            <a 
              href={tournament.location.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([tournament.location.venue, tournament.location.address, tournament.location.city].filter(Boolean).join(', '))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group no-underline"
            >
              <div className="flex items-center gap-3">
                <MapIcon className="w-5 h-5 text-gray-400 group-hover:text-[#1abc60] transition-colors" />
                <p className="text-[12px] text-gray-600 font-black uppercase tracking-wider transition-colors group-hover:text-gray-900">
                  View on Maps
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
            </a>
          </div>

          {/* Organizer Contact */}
          <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm space-y-6">
            <h3 className="text-[12px] font-black text-gray-800 uppercase tracking-widest">ORGANIZER CONTACT</h3>
            
            <div className="bg-[#fcfcfd] rounded-[20px] p-2 space-y-1 border border-gray-50">
              <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-white transition-all">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-400 font-bold text-[13px]">:</span>
                  <p className="text-[13px] font-black text-gray-700 uppercase tracking-tight">{tournament.contact?.name || "Organizer"}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-white transition-all">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-400 font-bold text-[13px]">:</span>
                  <p className="text-[13px] font-black text-gray-700">{tournament.contact?.phone || "+91 00000 00000"}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-white transition-all">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-center gap-1 overflow-hidden">
                  <span className="text-gray-400 font-bold text-[13px] flex-shrink-0">:</span>
                  <p className="text-[13px] font-black text-gray-700 truncate">{tournament.contact?.email || "events@turf.com"}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}