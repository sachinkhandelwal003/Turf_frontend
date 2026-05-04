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
  
  const venue = ALL_VENUES.find(v => v.id === id) || ALL_VENUES[0];

  // === UI STATES ===
  const todayDateStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayDateStr);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState("06:00 PM - 07:00 PM");
  const [isCourtModalOpen, setIsCourtModalOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState("Court 1");

  const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-white pb-20 pt-[100px] font-sans">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        
        {/* Back Button */}
        <Link href="/ground" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#1abc60] mb-6 transition-colors !no-underline">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Grounds
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
            <div className="relative h-[300px] md:h-[450px] w-full rounded-2xl overflow-hidden mb-12 shadow-sm border border-gray-100">
              <img 
                src={venue.image} 
                alt={venue.title} 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Sports Available Section */}
            <div className="mb-12">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Sports Available</h3>
              <div className="flex flex-wrap gap-3">
                {venue.sports.map((sport, index) => (
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
                {venue.amenities.map((amenity, idx) => {
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