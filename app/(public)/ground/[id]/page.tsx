"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  MapPin, Star, ChevronDown, Calendar, Clock, ChevronLeft,
  Activity, CheckCircle2, Droplets, Car, Utensils, ShieldPlus, 
  Circle, X, Loader2 
} from 'lucide-react';
import api from '@/app/services/api';

// === TIME SLOTS MOCK DATA ===
const TIME_SLOTS = {
  MORNING: [
    { time: "06:00 AM - 07:00 AM", status: "disabled" },
    { time: "07:00 AM - 08:00 AM", status: "available" },
    { time: "08:00 AM - 09:00 AM", status: "available" }
  ],
  EVENING: [
    { time: "06:00 PM - 07:00 PM", status: "available" },
    { time: "07:00 PM - 08:00 PM", status: "available" },
    { time: "08:00 PM - 09:00 PM", status: "disabled" }
  ]
};

const COURTS = ["Court 1", "Court 2", "Court 3", "VIP Court"];

export default function VenueDetailsPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id || ""); 
  
  const [venue, setVenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVenue = async () => {
      if (!id) return;
      try {
        const res = await api.get(`/turfs/${id}`);
        if (res.data.success) {
          const t = res.data.turf;
          const mappedVenue = {
            id: t._id,
            title: t.name,
            rating: t.rating || 4.5,
            reviews: t.reviewsCount || "150",
            location: t.location.city,
            address: `${t.location.address ? t.location.address + ', ' : ''}${t.location.landmark ? t.location.landmark + ', ' : ''}${t.location.city}`,
            mapUrl: t.location.mapUrl || '',
            coordinates: t.location.coordinates,
            price: t.pricePerHour,
            image: t.images && t.images.length > 0 
              ? (t.images[0].startsWith('http') 
                  ? t.images[0] 
                  : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '')}${t.images[0]}`)
              : '/Perreferred1.png',
            images: t.images?.map((img: string) => img.startsWith('http') 
              ? img 
              : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '')}${img}`) || [],
            sports: t.sports || ["Sports"],
            amenities: t.amenities?.map((a: any) => {
              const name = typeof a === 'string' ? a : (a?.name || 'Amenity');
              return {
                name: name,
                icon: name.toLowerCase().includes('park') ? Car : 
                      name.toLowerCase().includes('show') ? Droplets : 
                      name.toLowerCase().includes('light') ? Activity :
                      name.toLowerCase().includes('food') || name.toLowerCase().includes('cafe') ? Utensils :
                      Activity
              };
            }) || [],
            about: t.description || t.about || "Premium sports facility featuring high-quality turf and excellent amenities. Perfect for competitive matches and friendly games."
          };
          setVenue(mappedVenue);
        }
      } catch (error) {
        console.error("Failed to fetch venue details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVenue();
  }, [id]);

  // === UI STATES ===
  const todayDateStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayDateStr);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState("06:00 PM - 07:00 PM");
  const [isCourtModalOpen, setIsCourtModalOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState("Court 1");
  const [activeImage, setActiveImage] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#1abc60]" />
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-bold">Venue not found</h2>
        <Link href="/ground" className="text-[#1abc60] font-bold">Back to Grounds</Link>
      </div>
    );
  }

  const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  const toEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // If it's already an embed URL, return as is
    if (url.includes('output=embed') || url.includes('/maps/embed')) return url;

    // Handle standard Google Maps URLs with coordinates
    const latLngMatch = url.match(/q=(-?\d+(\.\d+)?),(-?\d+(\.\d+)?)/);
    if (latLngMatch?.[1] && latLngMatch?.[3]) {
      return `https://www.google.com/maps?q=${latLngMatch[1]},${latLngMatch[3]}&output=embed`;
    }

    // Handle place IDs or general search queries
    if (url.includes('google.com/maps')) {
      return `${url}${url.includes('?') ? '&' : '?'}output=embed`;
    }

    // Handle shortened maps.app.goo.gl or goo.gl/maps links
    // NOTE: These links cannot be easily converted to embed URLs on the client side 
    // because they require a redirect to get the full URL.
    // For now, we return the URL as is if it's already a google link, 
    // but users should ideally provide the embed link or a standard maps link.
    if (url.includes('goo.gl/maps') || url.includes('maps.app.goo.gl')) {
      return url; // Still won't work in iframe but better than nothing
    }

    return url;
  };

  const embedUrl = toEmbedUrl(venue.mapUrl);

  return (
    <div className="min-h-screen bg-white pb-20 pt-[100px] font-sans">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        
        {/* Back Button */}
        <Link href="/ground" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#1abc60] mb-6 transition-colors !no-underline">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Venues
        </Link>

        {/* ================= MAIN LAYOUT ================= */}
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* LEFT COLUMN (Content) */}
          <div className="flex-1 min-w-0">
            {/* Header Area */}
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                {venue.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-gray-500">
                <div className="bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-md flex items-center gap-1 font-semibold">
                  {venue.rating} <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                </div>
                <span>{venue.reviews} Reviews</span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-1.5 text-gray-400" /> {venue.location}
                </span>
              </div>
            </div>

            {/* Big Hero Image */}
            <div className="space-y-4 mb-12">
              <div className="relative h-[300px] md:h-[450px] w-full rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <img 
                  src={venue.images?.[activeImage] || venue.image} 
                  alt={venue.title} 
                  className="w-full h-full object-cover transition-all duration-500"
                />
              </div>
              
              {/* Thumbnail Gallery */}
              {venue.images && venue.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {venue.images.map((img: string, idx: number) => (
                    <button 
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                        activeImage === idx ? 'border-[#1abc60] shadow-md scale-95' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`${venue.title} ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sports Available Section */}
            <div className="mb-12">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Sports Available</h3>
              <div className="flex flex-wrap gap-3">
                {venue.sports.map((sport: string, index: number) => (
                  <div 
                    key={sport}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors border ${
                      index === 0 
                        ? 'bg-[#1abc60] border-[#1abc60] text-white shadow-sm' 
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {sport} 
                    {index === 0 ? <Activity className="w-4 h-4" /> : <Circle className="w-4 h-4 text-gray-400" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities Section */}
            <div className="mb-12">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {venue.amenities.map((amenity: any, idx: number) => {
                  const Icon = amenity.icon;
                  return (
                    <div key={idx} className="bg-gray-50 border border-gray-100 p-5 rounded-2xl flex flex-col items-center justify-center text-center gap-3 hover:shadow-sm transition-shadow">
                      <div className="bg-white p-2.5 rounded-full shadow-sm">
                        <Icon className="w-5 h-5 text-[#1abc60]" strokeWidth={2.5} />
                      </div>
                      <span className="text-sm font-semibold text-gray-800">{amenity.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* About Venue Section */}
            <div className="mb-12">
              <h3 className="text-lg font-bold text-gray-900 mb-4">About Venue</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                {venue.about}
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN (Sidebar Widget) */}
          <div className="w-full lg:w-[360px] flex-shrink-0 space-y-6 lg:sticky lg:top-28 self-start">
            
            {/* Booking Widget Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <div className="flex items-baseline gap-1.5 mb-6">
                <span className="text-3xl font-bold text-gray-900">₹{venue.price}</span>
                <span className="text-sm text-gray-500 font-medium">/ hour</span>
              </div>

              <div className="space-y-4 mb-6">
                
                {/* Date Picker */}
                <div className="relative bg-white border border-gray-200 rounded-xl px-4 py-3.5 flex items-center justify-between cursor-pointer focus-within:border-[#1abc60] focus-within:ring-1 focus-within:ring-[#1abc60] transition-all">
                  <div className="flex items-center text-sm font-medium text-gray-800">
                    <Calendar className="w-4 h-4 mr-3 text-gray-400" /> 
                    {formattedDate}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                  <input 
                    type="date" 
                    value={selectedDate}
                    min={todayDateStr}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>

                {/* Time Picker */}
                <div 
                  onClick={() => setIsTimeModalOpen(true)}
                  className="relative bg-white border border-gray-200 rounded-xl px-4 py-3.5 flex items-center justify-between cursor-pointer hover:border-[#1abc60] transition-all"
                >
                  <div className="flex items-center text-sm font-medium text-gray-800">
                    <Clock className="w-4 h-4 mr-3 text-gray-400" /> 
                    {selectedTime}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>

                {/* Court Picker */}
                <div 
                  onClick={() => setIsCourtModalOpen(true)}
                  className="relative bg-white border border-gray-200 rounded-xl px-4 py-3.5 flex items-center justify-between cursor-pointer hover:border-[#1abc60] transition-all"
                >
                  <div className="flex items-center text-sm font-medium text-gray-800">
                    <CheckCircle2 className="w-4 h-4 mr-3 text-gray-400" /> 
                    {selectedCourt}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              <button className="w-full !bg-[#1abc60] hover:!bg-[#169c4e] !text-white !text-base !font-bold !py-3.5 !rounded-xl !transition-all !border-none !shadow-sm !m-0 !cursor-pointer">
                Book Now
              </button>
            </div>

            {/* Operating Hours Card */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex items-center gap-4">
              <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                <Clock className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Operating Hours</p>
                <p className="text-sm text-gray-500 mt-0.5">06:00 AM - 11:00 PM</p>
              </div>
            </div>

            {/* Location Map Card */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                  <MapPin className="w-5 h-5 text-gray-600" />
                </div>
                <span className="text-sm font-bold text-gray-900">Location</span>
              </div>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed pl-1">
                {venue.address}
              </p>
              <div className="relative h-[160px] w-full rounded-xl overflow-hidden bg-gray-200 border border-gray-200">
                {embedUrl ? (
                  <iframe
                    title="Venue Location"
                    src={embedUrl}
                    className="w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <>
                    <img 
                      src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&q=80" 
                      alt="Map View Placeholder" 
                      className="w-full h-full object-cover opacity-90"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <MapPin className="w-8 h-8 text-red-500 drop-shadow-md fill-white" strokeWidth={2} />
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* 1. TIME SLOT MODAL */}
      {isTimeModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          {/* Background Overlay - Clicking this closes the modal */}
          <div 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" 
            onClick={() => setIsTimeModalOpen(false)}
          />
          
          {/* Modal Content Box */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Select Time</h2>
              <button onClick={() => setIsTimeModalOpen(false)} className="!p-1.5 !bg-transparent !text-gray-400 hover:!text-gray-800 hover:!bg-gray-100 rounded-full transition-colors !border-none !shadow-none !m-0 !cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto">
              {Object.entries(TIME_SLOTS).map(([period, slots]) => (
                <div key={period} className="mb-6 last:mb-0">
                  <h3 className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-3">{period}</h3>
                  <div className="grid grid-cols-1 gap-2.5">
                    {slots.map((slot, idx) => {
                      const isSelected = selectedTime === slot.time;
                      const isDisabled = slot.status === "disabled";
                      return (
                        <button
                          key={idx}
                          disabled={isDisabled}
                          onClick={() => { setSelectedTime(slot.time); setIsTimeModalOpen(false); }}
                          className={`!w-full !py-3.5 !px-4 !rounded-xl !text-sm !transition-all !text-left flex justify-between items-center !m-0 !shadow-none !cursor-pointer !border
                            ${isDisabled 
                              ? '!bg-gray-50 !text-gray-400 !border-gray-100 !cursor-not-allowed !font-medium' 
                              : isSelected
                                ? '!bg-white !text-[#1abc60] !border-[#1abc60] !font-bold' // FIX: Background transparent/white, text/border green
                                : '!bg-white !text-gray-700 !border-gray-200 hover:!border-[#1abc60] hover:!text-[#1abc60] !font-medium'
                            }
                          `}
                        >
                          {slot.time}
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#1abc60]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. COURT SELECTION MODAL */}
      {isCourtModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          {/* Background Overlay */}
          <div 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" 
            onClick={() => setIsCourtModalOpen(false)}
          />
          
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Select Court</h2>
              <button onClick={() => setIsCourtModalOpen(false)} className="!p-1.5 !bg-transparent !text-gray-400 hover:!text-gray-800 hover:!bg-gray-100 rounded-full transition-colors !border-none !shadow-none !m-0 !cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-2.5">
              {COURTS.map((court) => {
                const isSelected = selectedCourt === court;
                return (
                  <button 
                    key={court}
                    onClick={() => { setSelectedCourt(court); setIsCourtModalOpen(false); }}
                    className={`!w-full !flex !items-center !justify-between !p-4 !rounded-xl !cursor-pointer !border !transition-all !m-0 !shadow-none
                      ${isSelected 
                        ? '!border-[#1abc60] !bg-white !text-[#1abc60] !font-bold' // FIX: Background white, text/border green
                        : '!border-gray-200 !bg-white !text-gray-700 hover:!border-[#1abc60]'
                    }`}
                  >
                    <span className="text-sm">{court}</span>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-[#1abc60]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}