"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Calendar, Clock, Loader2 } from 'lucide-react';
import api from '@/app/services/api';

interface Tournament {
  _id: string;
  title: string;
  sport: string;
  location: {
    address: string;
    city: string;
    venue: string;
  };
  prizePool: string;
  entryFee: number;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxTeams: number;
  registeredTeams: any[];
  status: string;
  image?: string;
}

export default function Tournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await api.get('tournaments');
        if (res.data.success) {
          // Show only first 2 for home page
          setTournaments(res.data.tournaments.slice(0, 2));
        }
      } catch (error) {
        console.error('Failed to fetch tournaments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

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

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center bg-[#f8f9fa]">
        <Loader2 className="w-12 h-12 animate-spin text-[#1abc60]" />
      </div>
    );
  }

  if (tournaments.length === 0) return null;

  return (
    <section className="py-20 bg-[#f8f9fa]">
      <div className="max-w-[1200px] mx-auto px-4">
        
        {/* --- Section Header --- */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">Tournaments</h2>
          <p className="text-gray-500 text-[15px]">
            Rise through the ranks and prove your skills in our curated seasonal leagues.
          </p>
        </div>

        {/* --- Tournament Cards Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {tournaments.map((tournament) => (
            <Link 
              href={`/tournament/${tournament._id}`}
              key={tournament._id}
              className="relative rounded-[24px] overflow-hidden h-[320px] flex flex-col justify-end p-8 group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 no-underline"
            >
              <img 
                src={getImageUrl(tournament.image || "")} 
                alt={tournament.title} 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
              />
              
              {/* Gradient dark background */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent z-0" />

              <div className="relative z-10 w-full text-left">
                {/* Green Badge */}
                <span className="bg-[#1abc60] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-sm inline-block mb-4">
                  {tournament.sport}
                </span>

                <h3 className="text-3xl font-bold !text-white mb-1.5 drop-shadow-sm truncate">
                  {tournament.title}
                </h3>

                {/* Location */}
                <div className="flex items-center text-gray-300 text-[13px] mb-6">
                  <MapPin className="w-4 h-4 text-[#FFB800] mr-1.5" /> 
                  {tournament.location.venue}, {tournament.location.city}
                </div>

                {/* Entry Fee */}
                <div className="flex items-center gap-12 mb-4">
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-0.5">Entry Fee</div>
                    <div className="text-[22px] font-bold !text-white">₹{formatPrice(tournament.entryFee)}</div>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="flex items-center gap-6 mb-6 text-[13px] text-gray-300 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#FFB800]" />
                    {new Date(tournament.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(tournament.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#FFB800]" />
                    TBA
                  </div>
                </div>

                <button 
                  disabled={(() => {
                    const now = new Date();
                    const deadline = new Date(tournament.registrationDeadline);
                    const isFull = tournament.registeredTeams?.length >= (tournament.maxTeams || 16);
                    const terminalStatuses = ['finished', 'completed', 'cancelled', 'postponed'];
                    return now > deadline || isFull || terminalStatuses.includes(tournament.status?.toLowerCase());
                  })()}
                  className={`font-bold py-2.5 px-6 rounded-lg text-[14px] transition-colors shadow-md w-fit border-none ${
                    (() => {
                      const now = new Date();
                      const deadline = new Date(tournament.registrationDeadline);
                      const isFull = tournament.registeredTeams?.length >= (tournament.maxTeams || 16);
                      const terminalStatuses = ['finished', 'completed', 'cancelled', 'postponed'];
                      return now > deadline || isFull || terminalStatuses.includes(tournament.status?.toLowerCase());
                    })()
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-[#1abc60] hover:bg-[#169c4e] text-white'
                  }`}
                >
                  {(() => {
                    const now = new Date();
                    const deadline = new Date(tournament.registrationDeadline);
                    const isFull = tournament.registeredTeams?.length >= (tournament.maxTeams || 16);
                    if (tournament.status?.toLowerCase() === 'cancelled') return "Cancelled";
                    if (tournament.status?.toLowerCase() === 'postponed') return "Postponed";
                    if (tournament.status?.toLowerCase() === 'finished' || tournament.status?.toLowerCase() === 'completed') return "Finished";
                    if (isFull) return "Full";
                    if (now > deadline) return "Closed";
                    return "Register Team";
                  })()}
                </button>
              </div>
            </Link>
          ))}
        </div>
        
      </div>
    </section>
  );
}