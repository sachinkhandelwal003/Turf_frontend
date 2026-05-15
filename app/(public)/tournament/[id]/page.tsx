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
      const cleaned = price.replace(/[^0-9]/g, '');
      if (!cleaned) return price; 
      return Number(cleaned).toLocaleString('en-IN');
    }
    return Number(price).toLocaleString('en-IN');
  };

  const [teamName, setTeamName] = useState("");
  const [captainName, setCaptainName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [altMobile, setAltMobile] = useState("");
  const [address, setAddress] = useState("");
  const [members, setMembers] = useState<{ name: string; role: string }[]>([]);

  const addMember = () => {
    setMembers([...members, { name: "", role: "" }]);
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, field: "name" | "role", value: string) => {
    const updatedMembers = [...members];
    updatedMembers[index][field] = value;
    setMembers(updatedMembers);
  };

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

  // Helper function for mobile input to restrict non-digits
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const val = e.target.value;
    // Allow only numbers and maximum length of 10
    if (/^\d*$/.test(val) && val.length <= 10) {
      setter(val);
    }
  };

  const validateForm = () => {
    // Basic presence checks
    if (!teamName || !captainName || !email || !mobile || !address) {
      toast.error("Please fill all required fields!");
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address!");
      return false;
    }

    // Phone validation (10 digits)
    if (mobile.length !== 10) {
      toast.error("Primary phone must be exactly 10 digits!");
      return false;
    }

    if (altMobile && altMobile.length !== 10) {
      toast.error("Alternative phone must be exactly 10 digits!");
      return false;
    }

    // Duplicate check (Frontend level)
    if (tournament?.registeredTeams && Array.isArray(tournament.registeredTeams)) {
      const isAlreadyRegistered = tournament.registeredTeams.some((reg: any) => 
        reg.email?.toLowerCase() === email.toLowerCase() || 
        reg.contact === mobile ||
        reg.phone === mobile
      );

      if (isAlreadyRegistered) {
        toast.error("This email or phone number is already registered for this tournament!");
        return false;
      }
    }

    return true;
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setRegLoading(true);
    try {
      if (tournament!.entryFee > 0) {
        const registrationData = {
          teamName,
          captainName,
          email,
          phone: mobile,
          altPhone: altMobile,
          address,
          members,
          tournamentId: id,
          entryFee: tournament!.entryFee,
          tournamentTitle: tournament!.title
        };
        sessionStorage.setItem('pending_registration', JSON.stringify(registrationData));
        router.push(`/tournament/checkout/${id}`);
        return;
      }

      const res = await api.post(`/tournaments/${id}/register`, {
        teamName,
        captainName,
        email,
        phone: mobile,
        altPhone: altMobile,
        address,
        members
      });

      if (res.data.success) {
        toast.success("Registration Successful! 🎉");
        setShowRegModal(false);
        setTeamName("");
        setCaptainName("");
        setEmail("");
        setMobile("");
        setAltMobile("");
        setAddress("");
        setMembers([]);
        router.push(`/payment-success/tournament_${id}`);
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
        <Loader2 className="w-10 h-10 animate-spin text-[#1abc60]" />
      </div>
    );
  }

  if (!tournament) return null;

  const embedUrl = toEmbedUrl(tournament.location?.mapUrl || "");

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'upcoming': return 'bg-[#1abc60] text-white';
      case 'ongoing': return 'bg-blue-500 text-white';
      case 'postponed': return 'bg-orange-500 text-white';
      case 'cancelled': return 'bg-red-500 text-white';
      case 'finished':
      case 'completed': return 'bg-gray-500 text-white';
      default: return 'bg-[#1abc60] text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24" style={{ fontFamily: 'var(--font-main)' }}>
      
      {/* ================= 0. REGISTRATION MODAL ================= */}
      {showRegModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm transition-opacity">
          <div className="bg-white w-full max-w-[550px] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
            
            {/* Modal Header */}
            <div className="bg-[#1abc60] p-6 relative shrink-0">
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">Secure Your Spot</h2>
                  <p className="text-white/90 text-sm mt-1 font-medium">Join the ultimate {tournament.sport} showdown</p>
                </div>
                <button 
                  onClick={() => setShowRegModal(false)}
                  className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white border-none cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body / Form */}
            <div className="p-6 bg-white overflow-y-auto custom-scrollbar flex-1">
              <form onSubmit={handleRegistrationSubmit} className="space-y-5">
                
                {/* Team Identity */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-800">Team Identity <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      required
                      type="text" 
                      placeholder="Enter Team Name" 
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="!w-full !bg-white !border !border-gray-200 !rounded-xl !pl-10 !pr-4 !py-3 !text-sm !text-gray-900 focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-all placeholder:!text-gray-400"
                    />
                  </div>
                </div>

                {/* Captain Name */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-800">Captain's Full Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      required
                      type="text" 
                      placeholder="As per ID Proof" 
                      value={captainName}
                      onChange={(e) => setCaptainName(e.target.value)}
                      className="!w-full !bg-white !border !border-gray-200 !rounded-xl !pl-10 !pr-4 !py-3 !text-sm !text-gray-900 focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-all placeholder:!text-gray-400"
                    />
                  </div>
                </div>

                {/* Captain Email */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-800">Captain's Email <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      required
                      type="email" 
                      placeholder="captain@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="!w-full !bg-white !border !border-gray-200 !rounded-xl !pl-10 !pr-4 !py-3 !text-sm !text-gray-900 focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-all placeholder:!text-gray-400"
                    />
                  </div>
                </div>

                {/* Contact Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-800">Primary Phone <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        required
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="10 digit mobile" 
                        value={mobile}
                        onChange={(e) => handleMobileChange(e, setMobile)}
                        className="!w-full !bg-white !border !border-gray-200 !rounded-xl !pl-10 !pr-4 !py-3 !text-sm !text-gray-900 focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-all placeholder:!text-gray-400"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-800">Alt Contact <span className="text-gray-400 font-normal">(Optional)</span></label>
                    <div className="relative">
                      <Contact className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="10 digit alt mobile" 
                        value={altMobile}
                        onChange={(e) => handleMobileChange(e, setAltMobile)}
                        className="!w-full !bg-white !border !border-gray-200 !rounded-xl !pl-10 !pr-4 !py-3 !text-sm !text-gray-900 focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-all placeholder:!text-gray-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Captain Address */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-800">Captain's Address <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <MapIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    <textarea 
                      required
                      placeholder="Complete Address" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="!w-full !bg-white !border !border-gray-200 !rounded-xl !pl-10 !pr-4 !py-3 !text-sm !text-gray-900 focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-all placeholder:!text-gray-400 !min-h-[80px] !resize-none"
                    />
                  </div>
                </div>

                {/* Team Members */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-gray-800">Team Members</label>
                    <button 
                      type="button"
                      onClick={addMember}
                      className="!flex !items-center !gap-1 !text-sm !font-semibold !text-[#1abc60] hover:!bg-green-50 !px-3 !py-1.5 !rounded-lg !transition-colors !border-none !bg-transparent !cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add Member
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {members.map((member, idx) => (
                      <div key={idx} className="flex gap-2 items-start">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <input 
                            required
                            type="text" 
                            placeholder="Member Name" 
                            value={member.name}
                            onChange={(e) => updateMember(idx, "name", e.target.value)}
                            className="!w-full !bg-white !border !border-gray-200 !rounded-lg !px-3 !py-2.5 !text-sm !text-gray-900 focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-colors"
                          />
                          <input 
                            required
                            type="text" 
                            placeholder="Role (e.g. Striker)" 
                            value={member.role}
                            onChange={(e) => updateMember(idx, "role", e.target.value)}
                            className="!w-full !bg-white !border !border-gray-200 !rounded-lg !px-3 !py-2.5 !text-sm !text-gray-900 focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-colors"
                          />
                        </div>
                        <button 
                          type="button"
                          onClick={() => removeMember(idx)}
                          className="!p-2.5 !text-red-500 !bg-red-50 hover:!bg-red-100 !rounded-lg !transition-colors !border-none !cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {members.length === 0 && (
                      <p className="text-center py-4 text-xs font-medium text-gray-500 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                        Click "+ Add Member" to build your squad
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button 
                    type="submit"
                    disabled={regLoading}
                    className="!w-full !bg-gray-900 hover:!bg-[#1abc60] !text-white !rounded-xl !py-3.5 !text-sm !font-bold !uppercase !tracking-wide !transition-all !shadow-lg disabled:!opacity-50 !flex !items-center !justify-center !gap-2 !border-none !cursor-pointer"
                  >
                    {regLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Proceed to Secure Checkout"
                    )}
                  </button>
                  <p className="text-center text-xs text-gray-500 font-semibold uppercase tracking-wider mt-4 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#1abc60]" />
                    100% Encrypted & Secure Registration
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ================= 1. HERO SECTION ================= */}
      <div className="relative w-full h-[400px] md:h-[500px] flex flex-col justify-end pb-10">
        <div className="absolute inset-0 z-0 w-full h-full bg-gray-900">
          <img 
            src={getImageUrl(tournament.image || "")} 
            alt={tournament.title} 
            className="w-full h-full object-cover object-center opacity-70 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm mb-4 ${getStatusColor(tournament.status)} capitalize border border-white/10`}>
            {tournament.status}
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold uppercase tracking-tight mb-6 leading-tight relative z-20">
            {tournament.title.split(' ').length > 2 ? (
              <>
                <span className="text-white drop-shadow-2xl">{tournament.title.split(' ').slice(0, 2).join(' ')}</span>
                <span className="text-[#1abc60] drop-shadow-2xl ml-2">{tournament.title.split(' ').slice(2).join(' ')}</span>
              </>
            ) : (
              <span className="text-white drop-shadow-2xl">{tournament.title}</span>
            )}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 md:gap-10">
            <div>
              <p className="text-gray-300 text-xs font-semibold uppercase tracking-wider mb-1">Entry Fee</p>
              <p className="text-xl md:text-2xl font-bold text-white">₹ {formatPrice(tournament.entryFee)}</p>
            </div>
            <div>
              <p className="text-gray-300 text-xs font-semibold uppercase tracking-wider mb-1">Dates</p>
              <p className="text-xl md:text-2xl font-bold text-white">
                {new Date(tournament.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(tournament.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 2. MAIN CONTENT ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 flex flex-col lg:flex-row gap-8 lg:gap-12">
        
        {/* LEFT COLUMN */}
        <div className="flex-1 min-w-0 space-y-8">
          
          {/* Overview */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Tournament Overview</h2>
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {tournament.description}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Registered", value: `${tournament.registeredTeams?.length || 0} Teams`, icon: Users },
              { label: "Format", value: tournament.format || tournament.matchType || "Tournament", icon: ShieldCheck },
              { label: "Sport", value: tournament.sport, icon: Trophy },
              { label: "Entry Fee", value: `₹${formatPrice(tournament.entryFee)}`, icon: Medal }
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="bg-white rounded-xl p-4 flex flex-col items-start border border-gray-200 shadow-sm">
                  <Icon className="w-5 h-5 text-[#1abc60] mb-3" />
                  <span className="text-xs text-gray-500 font-medium">{stat.label}</span>
                  <span className="text-sm font-semibold text-gray-900 mt-0.5">{stat.value}</span>
                </div>
              );
            })}
          </div>

          {/* Rules */}
          {tournament.rules && tournament.rules.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Format & Rules</h2>
              <div className="bg-white rounded-xl p-6 space-y-4 border border-gray-200 shadow-sm">
                {tournament.rules.map((rule, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-green-50 text-[#1abc60] flex-shrink-0 flex items-center justify-center text-xs font-semibold mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed pt-0.5">{rule}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gallery Section */}
          {tournament.gallery && tournament.gallery.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Tournament Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {tournament.gallery.map((img, idx) => (
                  <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
                    <img src={getImageUrl(img)} alt={`Gallery ${idx}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ================= 3. RIGHT SIDEBAR ================= */}
        <div className="w-full lg:w-[340px] flex-shrink-0 space-y-6 self-start lg:sticky lg:top-8">
          
          {/* Register Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Entry Fee</p>
            <div className="flex items-baseline gap-1 mb-5">
              <span className="text-3xl font-bold text-gray-900">₹ {formatPrice(tournament.entryFee)}</span>
              <span className="text-sm text-gray-500">/team</span>
            </div>
            
            <button 
              onClick={handleRegisterClick}
              disabled={isRegistrationClosed()}
              className={`!w-full !text-sm !font-semibold !uppercase !tracking-wide !py-3 !rounded-lg !transition-colors !mb-4 !shadow-sm !border-none ${
                isRegistrationClosed() 
                  ? '!bg-gray-100 !text-gray-400 !cursor-not-allowed !shadow-none' 
                  : '!bg-[#1abc60] hover:!bg-[#17a554] !text-white !cursor-pointer'
              }`}
            >
              {isRegistrationClosed() ? getRegistrationStatusMessage() : "REGISTER NOW"}
            </button>
            
            <p className="text-center text-xs text-gray-500 leading-relaxed">
              Limited spots available. Registration closes on <br/>
              <span className="font-semibold text-gray-700">
                {new Date(tournament.registrationDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>.
            </p>
          </div>

          {/* Location Details */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-gray-900">Location Details</h3>
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                <MapPin className="w-5 h-5 text-[#1abc60]" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-gray-900">{tournament.location.venue}</p>
                <p className="text-xs text-gray-500">
                  {[tournament.location.address, tournament.location.city].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>

            <div className="relative h-40 w-full rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
              {embedUrl || (tournament.location.venue && tournament.location.city) ? (
                <iframe
                  title="Tournament Location"
                  src={embedUrl || `https://www.google.com/maps?q=${encodeURIComponent([tournament.location.venue, tournament.location.address, tournament.location.city].filter(Boolean).join(', '))}&output=embed`}
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-1">
                  <MapIcon className="w-6 h-6" />
                  <span className="text-xs font-medium">Map Unavailable</span>
                </div>
              )}
            </div>

            <a 
              href={tournament.location.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([tournament.location.venue, tournament.location.address, tournament.location.city].filter(Boolean).join(', '))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="!flex !items-center !justify-between !p-3 !bg-gray-50 !rounded-lg hover:!bg-gray-100 !transition-colors !no-underline !border !border-gray-200"
            >
              <div className="flex items-center gap-2">
                <MapIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700 font-medium">View on Maps</span>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </a>
          </div>

          {/* Organizer Contact */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Organizer Contact</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 border border-gray-200">
                  <User className="w-4 h-4 text-gray-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">{tournament.contact?.name || "Organizer"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 border border-gray-200">
                  <Phone className="w-4 h-4 text-gray-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-semibold text-gray-900">{tournament.contact?.phone || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 border border-gray-200">
                  <Mail className="w-4 h-4 text-gray-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">{tournament.contact?.email || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}