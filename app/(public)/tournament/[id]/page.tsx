"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { 
  MapPin, Users, Video, 
  CheckCircle2, Plus, Trash2, ShieldCheck, AlertCircle, HeadphonesIcon,
  ExternalLink
} from 'lucide-react';

const TOURNAMENTS_DATA = [
  {
    id: "1",
    status: "Open for Registration",
    titlePrefix: "SUMMER SMASH",
    titleHighlight: "CRICKET CUP",
    prizePool: "5,00,000",
    entryFee: "2,499",
    dates: "Aug 12 - 20",
    image: "/Elitebox.png",
    overview: "The Summer Smash Cricket Cup is the pinnacle of semi-professional e-cricket in the city. Hosted at the premium Kinetic Arena, this 8-day extravaganza brings together 32 elite teams competing for the ultimate trophy and a massive prize pool. Experience the game like never before with professional umpiring, digital scoring, and live broadcasting.",
    stats: [
      { label: "Teams", value: "32 Total", icon: Users },
      { label: "Format", value: "7-A-Side", icon: ShieldCheck },
      { label: "Coverage", value: "Live Stream", icon: Video },
      { label: "Ball", value: "Pink Leather", icon: CheckCircle2 }
    ],
    rules: [
      "League + Knockout format: 8 groups of 4 teams. Top 2 from each group advance to Round of 16.",
      "Standard ICC T20 rules apply with a maximum of 4 overs per bowler.",
      "Powerplay of 2 overs. Only 2 fielders allowed outside the 30-yard circle."
    ],
    rewards: {
      first: "3,50,000",
      firstDesc: "Gold Trophy + Medals & Goodies",
      second: "1,00,000",
      secondDesc: "Silver Shield"
    },
    venueDetails: "Kinetic Sports Arena, Sector 7",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.48148825838!2d77.61864117507593!3d12.93459521555568!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae144e3391d3e1%3A0xc547348983995f5!2sKoramangala%205th%20Block%2C%20Koramangala%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1714896000000!5m2!1sen!2sin",
    registrationCloseDate: "Aug 10"
  }
];

const TrophyWatermark = () => (
  <svg className="absolute -right-6 -bottom-6 w-56 h-56 text-white opacity-20 pointer-events-none" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 22c-2.76 0-5-2.24-5-5v-1c0-.55.45-1 1-1h8c.55 0 1 .45 1 1v1c0 2.76-2.24 5-5 5zm-3-6h6v1c0 1.65-1.35 3-3 3s-3-1.35-3-3v-1zm11-4h-2V7c0-2.21-1.79-4-4-4H9C6.79 3 5 4.79 5 7v5H3c-.55 0-1-.45-1-1V8c0-1.65 1.35-3 3-3h1V4c0-.55.45-1 1-1h6c.55 0 1 .45 1 1v1h1c1.65 0 3 1.35 3 3v3c0 .55-.45 1-1 1zm-1-5H5v5h14V7zM7 7h10v5H7V7z" />
  </svg>
);

export default function TournamentDetailsPage() {
  const params = useParams();
  
  let id = "1"; 
  if (params && params.id) {
    id = Array.isArray(params.id) ? params.id[0] : params.id;
  }
  
  const tournament = TOURNAMENTS_DATA.find(t => t.id === id) || TOURNAMENTS_DATA[0];

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

  const embedUrl = toEmbedUrl(tournament.mapUrl);

  const [teamName, setTeamName] = useState("");
  const [captainName, setCaptainName] = useState("");
  const [mobile, setMobile] = useState("");
  const [altMobile, setAltMobile] = useState("");
  
  const [squad, setSquad] = useState([
    { id: 1, name: "Arjun Malhotra", role: "Batsman / Wicket Keeper" },
    { id: 2, name: "", role: "Select Role" }
  ]);

  const addPlayer = () => {
    setSquad([...squad, { id: Date.now(), name: "", role: "Select Role" }]);
  };

  const removePlayer = (playerId: number) => {
    if (squad.length > 1) {
      setSquad(squad.filter(p => p.id !== playerId));
    }
  };

  const updatePlayer = (playerId: number, field: string, value: string) => {
    setSquad(squad.map(p => p.id === playerId ? { ...p, [field]: value } : p));
  };

  return (
    <div className="min-h-screen bg-white pb-24" style={{ fontFamily: 'var(--font-main)' }}>
      
      {/* ================= 1. HERO SECTION ================= */}
      <div className="relative w-full h-[900px] md:h-[550px] flex flex-col justify-end pb-12">
        <div className="absolute inset-0 z-0 w-full h-full bg-[#111827]">
          <Image 
            src={tournament.image} 
            alt={tournament.titlePrefix} 
            fill 
            className="object-cover object-center opacity-90"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/80 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 lg:px-12 xl:px-16">
          <div className="inline-flex items-center bg-[#1abc60] text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider mb-4">
            <span className="w-1.5 h-1.5 bg-white rounded-full mr-2"></span>
            {tournament.status}
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight mb-6 leading-tight">
            <span className="text-white drop-shadow-md">{tournament.titlePrefix}</span>
            <span className="text-[#1abc60] drop-shadow-md ml-2">{tournament.titleHighlight}</span>
          </h1>
          
          <div className="flex flex-wrap items-center gap-8 md:gap-12">
            <div>
              <p className="text-white/60 text-[9px] font-bold uppercase tracking-[0.2em] mb-1.5">PRIZE POOL</p>
              <p className="text-xl md:text-2xl font-black text-white leading-none drop-shadow-md">₹ {tournament.prizePool}</p>
            </div>
            <div>
              <p className="text-white/60 text-[9px] font-bold uppercase tracking-[0.2em] mb-1.5">ENTRY FEE</p>
              <p className="text-xl md:text-2xl font-black text-white leading-none drop-shadow-md">₹ {tournament.entryFee}</p>
            </div>
            <div>
              <p className="text-white/60 text-[9px] font-bold uppercase tracking-[0.2em] mb-1.5">DATES</p>
              <p className="text-xl md:text-2xl font-black text-white leading-none drop-shadow-md">{tournament.dates}</p>
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
            <h2 className="text-[20px] font-extrabold !text-[#1abc60] uppercase mb-4 tracking-wide">The Tournament Overview</h2>
            <p className="text-[14px] text-gray-600 leading-relaxed font-normal max-w-4xl">
              {tournament.overview}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {tournament.stats.map((stat, idx) => {
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
          <div className="mb-12">
            <h2 className="text-[20px] font-extrabold !text-[#1abc60] uppercase mb-5 tracking-wide">Format & Rules</h2>
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

          {/* Team Identity */}
          <div className="bg-[#fcfcfd] border border-gray-100 rounded-[12px] p-7 mb-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-[10px] bg-[#1abc60] flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-[#1e293b]">Team Identity</h2>
                <p className="text-[11px] text-gray-400 font-medium">Basic information for the tournament roster.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Team Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Kinetic Mavericks" 
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-[8px] px-3 py-2.5 text-[13px] outline-none focus:border-[#1abc60] transition-all text-[#1e293b]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Captain Name</label>
                <input 
                  type="text" 
                  placeholder="Full Legal Name" 
                  value={captainName}
                  onChange={(e) => setCaptainName(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-[8px] px-3 py-2.5 text-[13px] outline-none focus:border-[#1abc60] transition-all text-[#1e293b]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Mobile Number</label>
                <div className="flex">
                  <span className="bg-[#f3f4f6] border border-gray-200 border-r-0 rounded-l-[8px] px-3 py-2.5 text-[13px] font-semibold text-gray-600 flex items-center justify-center">+91</span>
                  <input 
                    type="tel" 
                    placeholder="98765 43210" 
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-r-[8px] px-3 py-2.5 text-[13px] outline-none focus:border-[#1abc60] transition-all text-[#1e293b]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Alternate Contact</label>
                <div className="flex">
                  <span className="bg-[#f3f4f6] border border-gray-200 border-r-0 rounded-l-[8px] px-3 py-2.5 text-[13px] font-semibold text-gray-600 flex items-center justify-center">+91</span>
                  <input 
                    type="tel" 
                    placeholder="99999 11111" 
                    value={altMobile}
                    onChange={(e) => setAltMobile(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-r-[8px] px-3 py-2.5 text-[13px] outline-none focus:border-[#1abc60] transition-all text-[#1e293b]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Squad Members */}
          <div className="bg-[#fcfcfd] border border-gray-100 rounded-[12px] p-7 mb-12 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[10px] bg-[#1abc60] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-[17px] font-bold text-[#1e293b]">Squad Members</h2>
                  <p className="text-[11px] text-gray-400 font-medium">Add players and define their specific roles.</p>
                </div>
              </div>
              <button 
                onClick={addPlayer}
                className="flex items-center gap-1 text-[13px] font-bold text-[#1abc60] hover:text-[#169c4e] transition-colors bg-transparent border-none p-0 shadow-none cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2.5} /> Add Player
              </button>
            </div>

            <div className="space-y-2.5">
              {squad.map((player, index) => (
                <div key={player.id} className="flex flex-col md:flex-row items-center gap-2.5 bg-white p-2 rounded-[8px] border border-gray-200 shadow-sm">
                  <div className="w-7 h-7 rounded-full bg-[#1abc60] text-white flex-shrink-0 flex items-center justify-center text-[11px] font-bold ml-1">
                    {index + 1}
                  </div>
                  <input 
                    type="text" 
                    placeholder={index === 0 ? "Arjun Malhotra" : "Player Name"} 
                    value={player.name}
                    onChange={(e) => updatePlayer(player.id, 'name', e.target.value)}
                    className="flex-1 w-full bg-transparent border-none text-[13px] outline-none placeholder:text-gray-400 px-2 text-[#1e293b]"
                  />
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <select 
                      value={player.role}
                      onChange={(e) => updatePlayer(player.id, 'role', e.target.value)}
                      className="w-full md:w-[180px] bg-[#f8f9fa] border border-gray-200 rounded-[6px] px-2 py-1.5 text-[12px] text-gray-600 outline-none focus:border-[#1abc60]"
                    >
                      <option disabled>Select Role</option>
                      <option>Batsman</option>
                      <option>Bowler</option>
                      <option>All-Rounder</option>
                      <option>Batsman / Wicket Keeper</option>
                    </select>
                    <button 
                      onClick={() => removePlayer(player.id)}
                      disabled={squad.length === 1}
                      className="p-1.5 text-gray-400 hover:text-red-500 bg-transparent border-none shadow-none disabled:opacity-50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Championship Rewards */}
          <div className="mb-8">
            <h2 className="text-[20px] font-extrabold text-[#1abc60] uppercase mb-5 tracking-wide">Championship Rewards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative bg-[#1abc60] rounded-[14px] p-5 overflow-hidden flex flex-col justify-between min-h-[150px] shadow-sm">
                <TrophyWatermark />
                <div className="relative z-10">
                  <p className="text-white/80 text-[9px] font-bold uppercase tracking-widest mb-1">Champions Winner</p>
                  <p className="text-3xl font-black text-white mb-4">₹ {tournament.rewards.first}</p>
                </div>
                <div className="relative z-10 flex items-center text-white text-[12px] font-semibold">
                  <span className="mr-1">🥇</span> {tournament.rewards.firstDesc}
                </div>
              </div>

              <div className="relative bg-[#0288d1] rounded-[14px] p-5 overflow-hidden flex flex-col justify-between min-h-[150px] shadow-sm">
                <TrophyWatermark />
                <div className="relative z-10">
                  <p className="text-white/80 text-[9px] font-bold uppercase tracking-widest mb-1">Runner Up</p>
                  <p className="text-3xl font-black text-white mb-4">₹ {tournament.rewards.second}</p>
                </div>
                <div className="relative z-10 flex items-center text-white text-[12px] font-semibold">
                  <span className="mr-1">🥈</span> {tournament.rewards.secondDesc}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ================= 3. RIGHT SIDEBAR ================= */}
        <div className="w-full lg:w-[340px] xl:w-[380px] flex-shrink-0 space-y-5 self-start lg:sticky lg:top-8">
          
          {/* Register Card */}
          <div className="bg-white border border-gray-100 rounded-[12px] p-6 shadow-sm">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">Total Fee</p>
            <div className="flex items-baseline gap-1 mb-5">
              <span className="text-3xl font-black text-[#1abc60] leading-none">₹ {tournament.entryFee}</span>
              <span className="text-[12px] text-gray-500 font-medium">/team</span>
            </div>
            <button className="w-full bg-[#1abc60] hover:bg-[#169c4e] text-white text-[13px] font-bold uppercase tracking-widest py-3 rounded-[8px] transition-all mb-3 shadow-sm cursor-pointer border-none">
              REGISTER NOW
            </button>
            <p className="text-center text-[10px] text-gray-400 font-medium leading-relaxed">
              Limited spots available. Registration closes on <br/><span className="font-bold text-[#1e293b]">{tournament.registrationCloseDate}</span>.
            </p>
          </div>

          {/* Crucial Details */}
          <div className="bg-white border border-gray-100 rounded-[12px] p-6 shadow-sm">
            <h3 className="text-[14px] font-extrabold text-[#1e293b] uppercase tracking-wide mb-5">Crucial Details</h3>
            
            <div className="space-y-4">
              <div className="flex gap-2.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1abc60] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-[#1e293b] uppercase tracking-wider mb-0.5">Eligibility</p>
                  <p className="text-[11px] text-gray-500 leading-relaxed">Open to all amateur and semi-pro teams. Professional/state players strictly prohibited.</p>
                </div>
              </div>
              
              <div className="flex gap-2.5">
                <MapPin className="w-3.5 h-3.5 text-[#1abc60] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-[#1e293b] uppercase tracking-wider mb-0.5">Venue Guidelines</p>
                  <p className="text-[11px] text-gray-500 leading-relaxed">Spiked shoes required. Players must arrive 45 mins before scheduled match time.</p>
                </div>
              </div>

              <div className="flex gap-2.5">
                <AlertCircle className="w-3.5 h-3.5 text-[#1abc60] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-[#1e293b] uppercase tracking-wider mb-0.5">Refund Policy</p>
                  <p className="text-[11px] text-gray-500 leading-relaxed">Full refund if cancelled 7 days prior. No refunds for last-minute withdrawals.</p>
                </div>
              </div>
            </div>

            <div className="h-[1px] w-full bg-gray-100 my-4" />

            <h3 className="text-[10px] font-bold text-[#1e293b] uppercase tracking-wider mb-2">Tournament Address</h3>
            <div className="relative h-[120px] w-full rounded-[8px] overflow-hidden bg-gray-200 border border-gray-200 mb-2.5 group cursor-pointer">
              {embedUrl ? (
                <iframe
                  title="Tournament Location"
                  src={embedUrl}
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              ) : (
                <>
                  <img 
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&q=80" 
                    alt="Map View Placeholder" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <MapPin className="w-5 h-5 text-red-500 fill-white drop-shadow-md" strokeWidth={1.5} />
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center justify-between group cursor-pointer">
              <p className="text-[11px] text-gray-600 font-medium group-hover:text-[#1abc60] transition-colors">{tournament.venueDetails}</p>
              <ExternalLink className="w-3 h-3 text-[#1abc60]" />
            </div>
          </div>

          {/* Need Help */}
          <div className="bg-[#fcfcfd] border border-gray-100 rounded-[12px] p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-[#1abc60] p-2 rounded-full flex-shrink-0">
                <HeadphonesIcon className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="text-[14px] font-bold text-[#1e293b]">Need Help?</p>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">24/7 Support Active</p>
              </div>
            </div>
            <button className="w-full bg-white border border-gray-200 hover:border-[#1abc60] hover:text-[#1abc60] text-gray-600 text-[11px] font-bold uppercase tracking-widest py-2 rounded-[6px] transition-all shadow-none cursor-pointer">
              Contact Organizer
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}