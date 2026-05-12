"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  MapPin, Star, ChevronDown, Calendar, Clock, ChevronLeft,
  Activity, CheckCircle2, ShieldPlus, 
  Circle, X, Loader2 
} from 'lucide-react';
import api from '@/app/services/api';
import { toast } from 'sonner';

// === DUMMY DATA FOR DEMO ===
const DUMMY_TURFS = [
  {
    _id: "dummy-venue-1",
    name: "Champions Sports Hub",
    location: {
      address: "Plot 45, Near Mansarovar Metro Station",
      city: "Jaipur",
      landmark: "Mansarovar Plaza",
      mapUrl: "https://maps.google.com/?q=Mansarovar+Jaipur"
    },
    pricePerHour: 1200,
    slotDuration: 60,
    sports: ["Football", "Cricket", "Badminton"],
    amenities: ["Changing Rooms", "Floodlights", "Parking", "Drinking Water", "First Aid"],
    description: "A premium FIFA-certified synthetic turf suitable for high-intensity football and box cricket. Equipped with professional-grade LED lighting for night matches.",
    images: ["https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80"],
    isActive: true,
    rating: 4.8,
    reviewsCount: 124,
    courts: [{ name: "Court 1", courtType: "Synthetic" }, { name: "Court 2", courtType: "Synthetic" }],
    priceHikes: [
      { startTime: "18:00", endTime: "22:00", extraPrice: 200 }
    ],
    operatingHours: [
      { day: "Monday", open: "06:00", close: "23:00", isOpen: true },
      { day: "Tuesday", open: "06:00", close: "23:00", isOpen: true },
      { day: "Wednesday", open: "06:00", close: "23:00", isOpen: true },
      { day: "Thursday", open: "06:00", close: "23:00", isOpen: true },
      { day: "Friday", open: "06:00", close: "23:00", isOpen: true },
      { day: "Saturday", open: "06:00", close: "23:00", isOpen: true },
      { day: "Sunday", open: "06:00", close: "23:00", isOpen: true }
    ]
  }
];

export default function VenueDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id || ""); 
  
  const [venue, setVenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVenue = async () => {
      if (!id || id === 'undefined') return;

      // Handle dummy data
      if (id.startsWith('dummy-')) {
        const dummy = DUMMY_TURFS.find(t => t._id === id);
        if (dummy) {
          const mappedVenue = {
            id: dummy._id,
            title: dummy.name,
            rating: dummy.rating,
            reviews: dummy.reviewsCount,
            location: dummy.location.city,
            address: `${dummy.location.address}, ${dummy.location.landmark}, ${dummy.location.city}`,
            mapUrl: dummy.location.mapUrl,
            price: dummy.pricePerHour,
            slotDuration: dummy.slotDuration,
            image: dummy.images[0],
            images: dummy.images,
            sports: dummy.sports,
            amenities: dummy.amenities,
            about: dummy.description,
            courts: dummy.courts,
            priceHikes: dummy.priceHikes || [],
            operatingHours: dummy.operatingHours
          };
          setVenue(mappedVenue);
          setLoading(false);
          return;
        }
      }

      if (id.length < 10) return;

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
            slotDuration: t.slotDuration || 60,
            peakHourSurcharge: t.peakHourSurcharge || 0,
            surfaceType: t.surfaceType || 'Natural Grass',
            logo: t.logo ? (t.logo.startsWith('http') ? t.logo : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '')}${t.logo}`) : null,
            image: t.images && t.images.length > 0 
              ? (t.images[0].startsWith('http') 
                  ? t.images[0] 
                  : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '')}${t.images[0]}`)
              : '/Perreferred1.png',
            images: t.images?.map((img: string) => img.startsWith('http') 
              ? img 
              : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '')}${img}`) || [],
            sports: t.sports || ["Sports"],
            amenities: (t.amenities || []).map((a: any) => (typeof a === 'string' ? a : (a?.name || 'Amenity'))),
            about: t.description || t.about || "Premium sports facility featuring high-quality turf and excellent amenities. Perfect for competitive matches and friendly games.",
            courts: t.courts || [],
            operatingHours: t.operatingHours || [],
            rates: t.rates || [],
            priceHikes: Array.isArray(t.priceHikes) 
              ? t.priceHikes 
              : (typeof t.priceHikes === 'string' ? JSON.parse(t.priceHikes) : []),
            availableSlots: t.availableSlots || []
          };
          setVenue(mappedVenue);
        }
      } catch (error) {
        console.warn("Failed to fetch venue details:", id);
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
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [isCourtModalOpen, setIsCourtModalOpen] = useState(false);
  const [selectedCourts, setSelectedCourts] = useState<string[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [isBooking, setIsBooking] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<any[]>([]);
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(false);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!id || id === 'undefined' || id.startsWith('dummy-') || id.length < 10) return;
      setIsAvailabilityLoading(true);
      try {
        const res = await api.get(`/bookings/check-availability?turfId=${id}&date=${selectedDate}`);
        if (res.data.success) {
          setBookedSlots(res.data.bookedSlots || []);
        }
      } catch (error) {
        console.error("Failed to fetch availability:", error);
      } finally {
        setIsAvailabilityLoading(false);
      }
    };
    fetchAvailability();
  }, [id, selectedDate]);

  const formatMinutes = (mins: number) =>
    String(Math.floor(mins / 60)).padStart(2, "0") + ":" + String(mins % 60).padStart(2, "0");
  const parseTimeToMinutes = (time: string) => {
    const [h, m] = (time || "00:00").split(":").map((v) => Number(v));
    return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
  };
  const to12hLabel = (time: string) => {
    const [hh, mm] = time.split(":").map((v) => Number(v));
    const h = hh % 12 || 12;
    const ampm = hh < 12 ? "AM" : "PM";
    return `${h}:${String(mm || 0).padStart(2, "0")} ${ampm}`;
  };

  const getTimeSlots = () => {
    if (!venue) return { "MORNING": [], "AFTERNOON": [], "EVENING": [] };

    const checkIsBooked = (timeVal: string) => {
      const [start, end] = timeVal.split(" - ");
      // A slot is booked if there's an overlapping booking on the same date and turf
      // where any of the available courts for that turf are booked for this time range.
      
      const bookedCourts = new Set<string>();
      
      bookedSlots.forEach(b => {
        // Overlap condition: (start < b.endTime) && (end > b.startTime)
        if (start < b.endTime && end > b.startTime) {
          b.courts.forEach((c: string) => bookedCourts.add(c));
        }
      });
      
      return Array.from(bookedCourts);
    };

    // Generate slots dynamically from operating hours + slotDuration for the selected date's day
    const groups: Record<string, any[]> = {
      "MORNING": [],
      "AFTERNOON": [],
      "EVENING": []
    };

    const dayName = new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long" });
    const operatingDay = venue?.operatingHours?.find((d: any) => d.day === dayName);
    if (!operatingDay || operatingDay.isOpen === false) {
      return groups;
    }

    const dayRate = venue?.rates?.find((r: any) => r.day === dayName)?.price;
    const baseHourlyRate = Number(dayRate ?? venue?.price ?? 0);

    const open = operatingDay.open || "06:00";
    const close = operatingDay.close || "23:00";
    const duration = Number(venue?.slotDuration || 60);

    let cur = parseTimeToMinutes(open);
    const end = parseTimeToMinutes(close);
    const d = Math.max(15, duration || 60);

    while (cur + d <= end) {
      const start = formatMinutes(cur);
      const endTime = formatMinutes(cur + d);
      const timeVal = `${start} - ${endTime}`;
      const label = `${to12hLabel(start)} - ${to12hLabel(endTime)}`;
      const type = cur < 12 * 60 ? "MORNING" : cur >= 17 * 60 ? "EVENING" : "AFTERNOON";

      const bookedCourts = checkIsBooked(timeVal);
      
      // Check for price hikes (peak hours)
      const hike = venue?.priceHikes?.find((h: any) => {
        const hStart = parseTimeToMinutes(h.startTime);
        const hEnd = parseTimeToMinutes(h.endTime);
        return cur < hEnd && (cur + d) > hStart;
      });

      const extra = (hike && !isNaN(Number(hike.extraPrice))) ? Number(hike.extraPrice) : 0;
      const slotPrice = (baseHourlyRate * (d / 60)) + extra;

      groups[type].push({
        time: label,
        status: bookedCourts.length >= (venue?.courts?.length || 1) ? "disabled" : "available",
        value: timeVal,
        bookedCourts,
        basePrice: baseHourlyRate * (d / 60),
        extraPrice: extra,
        totalPrice: slotPrice,
        isPeak: extra > 0
      });
      cur += d;
    }

    return groups;
  };

  const currentSlots = getTimeSlots();

  const getCourts = () => {
    if (venue?.courts && venue.courts.length > 0) {
      return venue.courts.map((c: any) => typeof c === 'string' ? c : (c.name || 'Court'));
    }
    return ["Court 1"]; // Default to at least one court if none specified
  };

  const currentCourts = getCourts();

  const getSlotMinutes = (slotValue: string) => {
    const [start, end] = slotValue.split(" - ");
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    return (eh * 60 + em) - (sh * 60 + sm);
  };

  const getBookedCourtsForSlot = (slotValue: string) => {
    const [start, end] = slotValue.split(" - ");
    const booked = new Set<string>();
    bookedSlots.forEach((b) => {
      if (start < b.endTime && end > b.startTime) {
        b.courts.forEach((c: string) => booked.add(c));
      }
    });
    return booked;
  };

  useEffect(() => {
    if (!selectedTimes.length || !selectedCourts.length) return;
    setSelectedCourts((prev) =>
      prev.filter((courtName) =>
        !selectedTimes.some((slot) => getBookedCourtsForSlot(slot).has(courtName))
      )
    );
  }, [selectedTimes, bookedSlots]);

  const handleBooking = async () => {
    if (!id || selectedTimes.length === 0 || selectedCourts.length === 0) {
      if (selectedCourts.length === 0) toast.error("Please select at least one court");
      if (selectedTimes.length === 0) toast.error("Please select at least one time slot");
      return;
    }

    setIsBooking(true);
    try {
      const dayName = new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long" });
      const dayRate = venue?.rates?.find((r: any) => r.day === dayName)?.price;
      const effectiveHourlyRate = Number(dayRate ?? venue?.price ?? 0);
      
      const totalMinutes = selectedTimes.reduce((sum, slot) => sum + Math.max(0, getSlotMinutes(slot)), 0);
      const basePrice = (effectiveHourlyRate * (totalMinutes / 60)) * selectedCourts.length;

      // Calculate total extra price for peak hours
      const extraPriceTotal = selectedTimes.reduce((sum, timeVal) => {
        const [start] = timeVal.split(" - ");
        const cur = parseTimeToMinutes(start);
        const slotDuration = venue?.slotDuration || 60;
        
        const hike = venue?.priceHikes?.find((h: any) => {
          const hStart = parseTimeToMinutes(h.startTime);
          const hEnd = parseTimeToMinutes(h.endTime);
          return cur < hEnd && (cur + slotDuration) > hStart;
        });
        
        const extra = (hike && !isNaN(Number(hike.extraPrice))) ? Number(hike.extraPrice) : 0;
        return sum + extra;
      }, 0);

      const finalPrice = basePrice + (extraPriceTotal * selectedCourts.length);

      const res = await api.post("/bookings", {
        turfId: id,
        sport: venue?.sports?.[0] || "Sport",
        date: selectedDate,
        slots: selectedTimes,
        courts: selectedCourts,
        price: finalPrice,
      });

      if (res.data.success) {
        toast.success("Booking initiated!");
        // Navigate to checkout with the single booking ID
        const bookingId = res.data.booking?._id;
        if (bookingId) {
          router.push(`/checkout/${bookingId}`);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create booking");
    } finally {
      setIsBooking(false);
    }
  };

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

  const embedUrl = venue ? toEmbedUrl(venue.mapUrl) : '';

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
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="min-w-0">
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
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md font-bold text-[10px] uppercase tracking-wider">
                    {venue.surfaceType}
                  </span>
                </div>
              </div>
              {venue.logo && (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border border-gray-100 shadow-sm shrink-0 bg-white p-1">
                  <img src={venue.logo} alt={`${venue.title} Logo`} className="w-full h-full object-contain" />
                </div>
              )}
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
                {venue.amenities.map((amenity: string, idx: number) => (
                  <div
                    key={idx}
                    className="bg-gray-50 border border-gray-100 p-5 rounded-2xl flex items-center justify-center text-center hover:shadow-sm transition-shadow"
                  >
                    <span className="text-sm font-semibold text-gray-800">{amenity}</span>
                  </div>
                ))}
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
              <div className="flex items-baseline justify-between mb-6">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold text-gray-900">₹{venue.price}</span>
                  <span className="text-sm text-gray-500 font-medium">/ hour</span>
                </div>
                {venue.peakHourSurcharge > 0 && (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">
                    +₹{venue.peakHourSurcharge} Peak Surcharge
                  </span>
                )}
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
                    {selectedTimes.length > 0 
                      ? `${selectedTimes.length} Slot${selectedTimes.length > 1 ? 's' : ''} Selected` 
                      : 'Select Time Slots'}
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
                    {selectedCourts.length > 0 
                      ? `${selectedCourts.length} Court${selectedCourts.length > 1 ? 's' : ''} Selected` 
                      : 'Select Courts'}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              <button 
                disabled={isBooking}
                onClick={handleBooking}
                className="w-full !bg-[#1abc60] hover:!bg-[#169c4e] disabled:opacity-50 !text-white !text-base !font-bold !py-3.5 !rounded-xl !transition-all !border-none !shadow-sm !m-0 !cursor-pointer flex items-center justify-center gap-2"
              >
                {isBooking ? <Loader2 className="w-5 h-5 animate-spin" /> : "Book Now"}
              </button>
            </div>

            {/* Operating Hours Card */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                  <Clock className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Operating Hours</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Weekly Schedule</p>
                </div>
              </div>
              <div className="space-y-1.5 pt-2 border-t border-gray-100">
                {venue.operatingHours?.length > 0 ? (
                  venue.operatingHours.map((oh: any) => (
                    <div key={oh.day} className="flex justify-between text-xs">
                      <span className="font-semibold text-gray-600">{oh.day}</span>
                      <span className={`${oh.isOpen ? 'text-gray-900 font-bold' : 'text-red-500 font-bold uppercase'}`}>
                        {oh.isOpen ? `${oh.open} - ${oh.close}` : 'Closed'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-900 font-bold">06:00 AM - 11:00 PM</p>
                )}
              </div>
            </div>

            {/* Closure Dates Card (If any) */}
            {venue.unavailableDates?.length > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm border border-red-100">
                    <Calendar className="w-5 h-5 text-red-500" />
                  </div>
                  <span className="text-sm font-bold text-red-900 uppercase tracking-tight">Venue Closures</span>
                </div>
                <div className="space-y-2">
                  {venue.unavailableDates.map((ud: any, idx: number) => (
                    <div key={idx} className="bg-white/50 p-2 rounded-lg border border-red-200">
                      <p className="text-xs font-bold text-red-700">{new Date(ud.date).toLocaleDateString()}</p>
                      <p className="text-[10px] text-red-500 italic">{ud.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
              {Object.entries(currentSlots).map(([period, slots]) => (
                <div key={period} className="mb-6 last:mb-0">
                  <h3 className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-3">{period}</h3>
                  <div className="grid grid-cols-1 gap-2.5">
                    {slots.map((slot, idx) => {
                      const isSelected = selectedTimes.includes(slot.time);
                      const isDisabled = slot.status === "disabled";
                      return (
                        <button
                          key={idx}
                          disabled={isDisabled}
                          onClick={() => { 
                            const val = slot.value || slot.time;
                            if (selectedTimes.includes(val)) {
                              setSelectedTimes(selectedTimes.filter(t => t !== val));
                            } else {
                              setSelectedTimes([...selectedTimes, val]);
                            }
                          }}
                          className={`!w-full !py-3 !px-4 !rounded-xl !text-sm !transition-all !text-left flex justify-between items-center !m-0 !shadow-none !cursor-pointer !border
                            ${isDisabled 
                              ? '!bg-gray-50 !text-gray-400 !border-gray-100 !cursor-not-allowed !font-medium' 
                              : selectedTimes.includes(slot.value || slot.time)
                                ? '!bg-[#1abc60]/5 !text-[#1abc60] !border-[#1abc60] !font-bold'
                                : '!bg-white !text-gray-700 !border-gray-200 hover:!border-[#1abc60] hover:!text-[#1abc60] !font-medium'
                            }
                          `}
                        >
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900">{slot.time}</span>
                              <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-100 font-black whitespace-nowrap">
                                + ₹ 300 Peak
                              </span>
                            </div>
                          </div>
                          {selectedTimes.includes(slot.value || slot.time) && (
                            <div className="bg-[#1abc60] p-1 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-gray-100">
               <button 
                 onClick={() => setIsTimeModalOpen(false)}
                 className="w-full bg-[#1abc60] text-white py-3.5 rounded-xl font-bold transition-all hover:bg-[#169c4e]"
               >
                 Confirm {selectedTimes.length} Slot{selectedTimes.length !== 1 ? 's' : ''}
               </button>
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
              {venue.courts.map((court: any) => {
                const courtName = typeof court === 'string' ? court : (court.name || 'Court');
                const courtType = typeof court === 'string' ? '' : (court.courtType || '');
                const isSelected = selectedCourts.includes(courtName);
                
                // A court is disabled if it's already booked for ANY of the selected time slots
                const isAlreadyBooked = selectedTimes.some(timeVal => {
                  return getBookedCourtsForSlot(timeVal).has(courtName);
                });

                return (
                  <button 
                    key={courtName}
                    disabled={isAlreadyBooked}
                    onClick={() => { 
                      if (isSelected) {
                        setSelectedCourts(selectedCourts.filter(c => c !== courtName));
                      } else {
                        setSelectedCourts([...selectedCourts, courtName]);
                      }
                    }}
                    className={`!w-full !flex !items-center !justify-between !p-4 !rounded-xl !cursor-pointer !border !transition-all !m-0 !shadow-none
                      ${isAlreadyBooked
                        ? '!bg-gray-50 !text-gray-400 !border-gray-100 !cursor-not-allowed'
                        : isSelected 
                          ? '!border-[#1abc60] !bg-white !text-[#1abc60] !font-bold'
                          : '!border-gray-200 !bg-white !text-gray-700 hover:!border-[#1abc60]'
                    }`}
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-bold">{courtName}</span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest">{courtType} Surface</span>
                      {isAlreadyBooked && <span className="text-[10px] text-red-400 font-bold uppercase mt-1">Already Booked for Selected Time</span>}
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-[#1abc60]" />}
                  </button>
                );
              })}
            </div>
            <div className="p-6 border-t border-gray-100">
               <button 
                 onClick={() => setIsCourtModalOpen(false)}
                 className="w-full bg-[#1abc60] text-white py-3.5 rounded-xl font-bold transition-all hover:bg-[#169c4e]"
               >
                 Confirm {selectedCourts.length} Court{selectedCourts.length !== 1 ? 's' : ''}
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}