"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { 
  MapPin, Star, ChevronDown, Calendar, Clock, ChevronLeft,
  Activity, CheckCircle2, Droplets, Car, Utensils, ShieldPlus, 
  Circle, X 
} from 'lucide-react';

// === SAARA 6 GROUNDS KA DATA YAHAN HAI ===
const ALL_VENUES = [
  {
    id: "1",
    title: "Elite Box Cricket Arena",
    rating: 4.8,
    reviews: "342",
    location: "Koramangala, Bangalore",
    address: "Koramangala 5th Block, Bengaluru, Karnataka 560034",
    price: 1200,
    image: "/Elitebox.png",
    sports: ["Cricket"],
    amenities: [
      { name: "Parking", icon: Car },
      { name: "Showers", icon: Droplets },
      { name: "Floodlights", icon: Activity }
    ],
    about: "Premium box cricket arena featuring high-quality turf and excellent floodlights for night matches. Perfect for corporate tournaments and friendly weekend games."
  },
  {
    id: "2",
    title: "Champions Football Hub",
    rating: 4.9,
    reviews: "512",
    location: "Indiranagar, Bangalore",
    address: "100ft Road, Indiranagar, Bengaluru, Karnataka 560038",
    price: 1800,
    image: "/hub.png",
    sports: ["Football"],
    amenities: [
      { name: "Parking", icon: Car },
      { name: "Showers", icon: Droplets },
      { name: "Pro Turf", icon: Activity },
      { name: "Cafeteria", icon: Utensils }
    ],
    about: "Professional grade football turf with FIFA standard artificial grass. Hosts multiple local leagues and is equipped with a cafeteria for post-match refreshments."
  },
  {
    id: "3",
    title: "Velocity Padel & Sports",
    rating: 4.7,
    reviews: "128",
    location: "Whitefield, Bangalore",
    address: "Whitefield Main Road, Bengaluru, Karnataka 560066",
    price: 1500,
    image: "/velocity.png",
    sports: ["Badminton", "Tennis"],
    amenities: [
      { name: "Parking", icon: Car },
      { name: "Air Conditioned", icon: Activity },
      { name: "Equipment Hire", icon: ShieldPlus }
    ],
    about: "State-of-the-art indoor sports facility with temperature control. Best place to play Padel and Badminton in any weather."
  },
  {
    id: "4",
    title: "Grand Slam Tennis Club",
    rating: 4.5,
    reviews: "89",
    location: "Jayanagar, Bangalore",
    address: "Jayanagar 4th Block, Bengaluru",
    price: 800,
    image: "/grand.png",
    sports: ["Tennis"],
    amenities: [
      { name: "Showers", icon: Droplets },
      { name: "Clay Courts", icon: Activity },
      { name: "Ball Machine", icon: ShieldPlus }
    ],
    about: "Classic clay courts offering a traditional tennis experience. Well-maintained facilities with coaching available on request."
  },
  {
    id: "5",
    title: "SvHigh Basketball Park",
    rating: 4.6,
    reviews: "204",
    location: "MG Road, Bangalore",
    address: "MG Road Metro Station near, Bengaluru",
    price: 1000,
    image: "/svhigh.png",
    sports: ["Basketball"],
    amenities: [
      { name: "Parking", icon: Car },
      { name: "Night Lights", icon: Activity },
      { name: "Rooftop", icon: Activity }
    ],
    about: "A stunning rooftop basketball court in the heart of the city. Equipped with professional hoops and great lighting for evening games."
  },
  {
    id: "6",
    title: "Ace Padel Club",
    rating: 4.8,
    reviews: "156",
    location: "Sarjapur, Bangalore",
    address: "Sarjapur Main Road, Bengaluru",
    price: 2200,
    image: "/ace.jpg",
    sports: ["Badminton", "Padel"],
    amenities: [
      { name: "Parking", icon: Car },
      { name: "Panoramic Glass", icon: Activity },
      { name: "Coaching", icon: ShieldPlus }
    ],
    about: "Premium panoramic glass courts offering an international standard playing experience. Top choice for professional players."
  }
];

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
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id || "1"); 
  
  // DYNAMIC FETCHING: ID match karega to wahi ground dikhega
  const venue = ALL_VENUES.find(v => v.id === id) || ALL_VENUES[0];

  // === UI STATES ===
  const todayDateStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayDateStr);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState("06:00 PM - 07:00 PM");
  const [isCourtModalOpen, setIsCourtModalOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState("Court 1");

  // Format date to look like "May 24, 2024"
  const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-white font-sans pb-20 pt-[90px]">
      <div className="max-w-[1150px] mx-auto px-4 md:px-6 pt-6">
        
        {/* Back Button */}
        <Link href="/ground" className="inline-flex items-center text-gray-500 hover:text-[#1abc60] font-bold mb-6 transition-colors !no-underline">
          <ChevronLeft className="w-5 h-5 mr-1" /> Back to Grounds
        </Link>

        {/* ================= MAIN LAYOUT ================= */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT COLUMN (Content) */}
          <div className="flex-1 min-w-0">
            {/* Header Area */}
            <div className="mb-6">
              <h1 className="text-[30px] md:text-[34px] font-extrabold text-[#111111] mb-3 tracking-tight">
                {venue.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-[12px] font-bold text-gray-500">
                <div className="text-[#FFB800] flex items-center gap-1">
                  {venue.rating} <Star className="w-3.5 h-3.5 fill-[#FFB800]" />
                </div>
                <span className="text-gray-400">({venue.reviews} Reviews)</span>
                <span className="text-gray-300">•</span>
                <span>{venue.location}</span>
              </div>
            </div>

            {/* Big Hero Image */}
            <div className="relative h-[350px] md:h-[450px] w-full rounded-2xl overflow-hidden mb-10 shadow-sm">
              <img 
                src={venue.image} 
                alt={venue.title} 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Sports Available Section */}
            <div className="mb-10">
              <h3 className="text-[12px] font-extrabold text-gray-800 uppercase tracking-widest mb-4">Sports Available</h3>
              <div className="flex flex-wrap gap-3">
                {venue.sports.map((sport, index) => (
                  <button 
                    key={sport}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-bold transition-colors !border-none !m-0 !cursor-pointer ${
                      index === 0 // FIX: Jo pehla sport hoga wo hamesha green aayega
                        ? '!bg-[#1abc60] !text-white' 
                        : '!bg-[#f4f6f5] text-gray-700 hover:!bg-gray-200'
                    }`}
                  >
                    {sport} 
                    {index === 0 ? <Activity className="w-4 h-4 text-white" /> : <Circle className="w-4 h-4 text-gray-500" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Amenities Section */}
            <div className="mb-10">
              <h3 className="text-[12px] font-extrabold text-gray-800 uppercase tracking-widest mb-4">Amenities</h3>
              <div className="bg-[#f4f6f5] p-6 rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-4">
                {venue.amenities.map((amenity, idx) => {
                  const Icon = amenity.icon;
                  return (
                    <div key={idx} className="bg-white py-5 px-3 rounded-xl shadow-sm flex flex-col items-center justify-center text-center gap-2.5">
                      <Icon className="w-6 h-6 text-[#1abc60]" strokeWidth={2.5} />
                      <span className="text-[10px] font-extrabold text-gray-800 uppercase tracking-wider">{amenity.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* About Venue Section */}
            <div className="mb-10">
              <h3 className="text-[12px] font-extrabold text-gray-800 uppercase tracking-widest mb-4">About Venue</h3>
              <div className="bg-[#f4f6f5] p-6 md:p-8 rounded-2xl">
                <p className="text-gray-500 text-[13px] leading-relaxed font-medium">
                  {venue.about}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (Sidebar Widget) */}
          <div className="w-full lg:w-[340px] flex-shrink-0 space-y-6 lg:sticky lg:top-24 self-start">
            
            {/* Booking Widget Card */}
            <div className="bg-[#f4f6f5] rounded-2xl p-6">
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-[26px] font-extrabold text-gray-900">₹{venue.price}</span>
                <span className="text-[12px] text-gray-500 font-bold">/ hr</span>
              </div>

              <div className="space-y-3 mb-6">
                
                <div className="relative bg-white rounded-xl px-4 py-3.5 flex items-center justify-between cursor-pointer focus-within:ring-2 focus-within:ring-[#1abc60]">
                  <div className="flex items-center text-[12px] font-bold text-[#111]">
                    <Calendar className="w-4 h-4 mr-3 text-[#1abc60]" strokeWidth={2.5} /> 
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

                <div 
                  onClick={() => setIsTimeModalOpen(true)}
                  className="relative bg-white rounded-xl px-4 py-3.5 flex items-center justify-between cursor-pointer hover:ring-2 hover:ring-[#1abc60]/50 transition-all"
                >
                  <div className="flex items-center text-[12px] font-bold text-[#111]">
                    <Clock className="w-4 h-4 mr-3 text-[#1abc60]" strokeWidth={2.5} /> 
                    {selectedTime}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>

                <div 
                  onClick={() => setIsCourtModalOpen(true)}
                  className="relative bg-white rounded-xl px-4 py-3.5 flex items-center justify-between cursor-pointer hover:ring-2 hover:ring-[#1abc60]/50 transition-all"
                >
                  <div className="flex items-center text-[12px] font-bold text-[#111]">
                    <CheckCircle2 className="w-4 h-4 mr-3 text-[#1abc60]" strokeWidth={2.5} /> 
                    {selectedCourt}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              <button className="w-full !bg-[#1abc60] hover:!bg-[#169c4e] !text-white text-[13px] font-extrabold uppercase tracking-widest py-4 !rounded-xl transition-all !border-none cursor-pointer !m-0">
                BOOK NOW
              </button>
            </div>

            {/* Operating Hours Card */}
            <div className="bg-[#f4f6f5] rounded-2xl p-6 flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#1abc60]" strokeWidth={2.5} />
              <span className="text-[13px] font-extrabold text-gray-900">Operating Hours</span>
            </div>

            {/* Location Map Card */}
            <div className="bg-[#f4f6f5] rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-[#1abc60]" strokeWidth={2.5} />
                <span className="text-[13px] font-extrabold text-gray-900">Location</span>
              </div>
              <p className="text-[11px] text-gray-500 font-bold mb-4 ml-6">
                {venue.address}
              </p>
              <div className="relative h-[180px] w-full rounded-xl overflow-hidden bg-gray-200">
                <img 
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&q=80" 
                  alt="Map View" 
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <MapPin className="w-8 h-8 text-red-500 drop-shadow-md fill-white" strokeWidth={2} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* 1. TIME SLOT MODAL */}
      {isTimeModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="bg-white rounded-[20px] shadow-2xl w-[90%] max-w-[340px] overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-5 py-4 flex justify-between items-center border-b border-gray-100">
              <h2 className="text-[16px] font-extrabold text-gray-800">Available Time Slots</h2>
              <button onClick={() => setIsTimeModalOpen(false)} className="!p-1 !bg-transparent !border-none !shadow-none text-gray-400 hover:text-gray-700 cursor-pointer !m-0">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto custom-scrollbar">
              {Object.entries(TIME_SLOTS).map(([period, slots]) => (
                <div key={period} className="mb-6 last:mb-0">
                  <h3 className="text-[11px] font-extrabold text-gray-400 tracking-widest uppercase mb-3">{period}</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {slots.map((slot, idx) => {
                      const isSelected = selectedTime === slot.time;
                      const isDisabled = slot.status === "disabled";
                      return (
                        <button
                          key={idx}
                          disabled={isDisabled}
                          onClick={() => { setSelectedTime(slot.time); setIsTimeModalOpen(false); }}
                          className={`!w-full !py-3 !px-4 !rounded-xl !text-[12px] !font-bold !m-0 !transition-all text-left flex justify-between items-center
                            ${isDisabled 
                              ? '!bg-[#f4f6f5] !text-gray-400 !border !border-transparent !cursor-not-allowed' 
                              : isSelected
                                ? '!bg-[#1abc60] !text-white !border !border-[#1abc60]'
                                : '!bg-white !text-gray-700 !border !border-gray-200 hover:!border-[#1abc60] hover:!text-[#1abc60] !cursor-pointer'
                            }
                          `}
                        >
                          {slot.time}
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="bg-white rounded-[20px] shadow-2xl w-[90%] max-w-[300px] overflow-hidden flex flex-col">
            <div className="px-5 py-4 flex justify-between items-center border-b border-gray-100">
              <h2 className="text-[16px] font-extrabold text-gray-800">Select Court</h2>
              <button onClick={() => setIsCourtModalOpen(false)} className="!p-1 !bg-transparent !border-none !shadow-none text-gray-400 hover:text-gray-700 cursor-pointer !m-0">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {COURTS.map((court) => {
                const isSelected = selectedCourt === court;
                return (
                  <div 
                    key={court}
                    onClick={() => { setSelectedCourt(court); setIsCourtModalOpen(false); }}
                    className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border transition-all ${
                      isSelected ? 'border-[#1abc60] bg-[#e8f8ef]' : 'border-gray-100 bg-white hover:border-[#1abc60]'
                    }`}
                  >
                    <span className={`text-[13px] font-extrabold ${isSelected ? 'text-[#1abc60]' : 'text-gray-700'}`}>
                      {court}
                    </span>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-[#1abc60]" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}