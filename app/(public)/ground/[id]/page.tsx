"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  MapPin, Star, ChevronDown, Calendar, Clock, ChevronLeft,
  Activity, CheckCircle2, Circle, X, Loader2 
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
              : '/placeholder-turf.png',
            images: t.images?.map((img: string) => img.startsWith('http') 
              ? img 
              : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '')}${img}`) || [],
            sports: t.sports || ["Sports"],
            amenities: (t.amenities || []).map((a: any) => (typeof a === 'string' ? a : (a?.name || 'Amenity'))),
            about: t.description || t.about || "Premium sports facility featuring high-quality turf and excellent amenities. Perfect for competitive matches and friendly games.",
            courts: t.courts || [],
            operatingHours: t.operatingHours || [],
            rates: t.rates || [],
            slotPricings: t.slotPricings || [],
            availableSlots: t.availableSlots || [],
            unavailableDates: t.unavailableDates || []
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

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!id || id === 'undefined' || id.startsWith('dummy-') || id.length < 10) return;
      try {
        const res = await api.get(`/bookings/check-availability?turfId=${id}&date=${selectedDate}`);
        if (res.data.success) {
          console.log(`Fetched ${res.data.bookedSlots?.length} booked slots for ${selectedDate}`);
          setBookedSlots(res.data.bookedSlots || []);
        }
      } catch (error) {
        console.error("Failed to fetch availability:", error);
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
      const bookedCourts = new Set<string>();
      
      bookedSlots.forEach(b => {
        // More robust overlap check
        const isOverlap = (start < b.endTime && end > b.startTime);
        
        if (isOverlap) {
          if (b.courts && Array.isArray(b.courts)) {
            b.courts.forEach((c: string) => bookedCourts.add(c));
          } else if (b.slots && b.slots.includes(timeVal)) {
            // Fallback: if courts missing but slot matches exactly
            bookedCourts.add("Default Court");
          }
        }
      });
      return Array.from(bookedCourts);
    };

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

    const now = new Date();
    const isToday = selectedDate === now.toISOString().split('T')[0];
    const currentMins = now.getHours() * 60 + now.getMinutes();

    while (cur + d <= end) {
      const start = formatMinutes(cur);
      const endTime = formatMinutes(cur + d);
      const timeVal = `${start} - ${endTime}`;
      const label = `${to12hLabel(start)} - ${to12hLabel(endTime)}`;
      const type = cur < 12 * 60 ? "MORNING" : cur >= 17 * 60 ? "EVENING" : "AFTERNOON";

      const bookedCourts = checkIsBooked(timeVal);
      const isPast = isToday && cur < currentMins;
      
      const customSlot = venue?.slotPricings?.find((s: any) => {
        const sStart = parseTimeToMinutes(s.startTime);
        const sEnd = parseTimeToMinutes(s.endTime);
        return (cur < sEnd && (cur + d) > sStart);
      });

      let slotPrice = 0;
      let extra = 0;

      const basePriceForDuration = (baseHourlyRate * (d / 60));

      if (customSlot) {
        extra = Number(customSlot.price || 0);
        slotPrice = basePriceForDuration + extra;
      } else {
        slotPrice = basePriceForDuration;
      }

      groups[type].push({
        time: label,
        status: (isPast || bookedCourts.length >= (venue?.courts?.length || 1)) ? "disabled" : "available",
        value: timeVal,
        bookedCourts,
        isPast,
        totalPrice: slotPrice // Direct total price (base + any extra)
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
    return ["Court 1"];
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
        if (b.courts && Array.isArray(b.courts)) {
          b.courts.forEach((c: string) => booked.add(c));
        } else if (b.slots && b.slots.includes(slotValue)) {
          booked.add("Default Court");
        }
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
      
      const finalPrice = selectedTimes.reduce((sum, timeVal) => {
        const [start, end] = timeVal.split(" - ");
        const cur = parseTimeToMinutes(start);
        const endMins = parseTimeToMinutes(end);
        const slotDuration = endMins - cur;

        const customSlot = venue?.slotPricings?.find((s: any) => {
          const sStart = parseTimeToMinutes(s.startTime);
          const sEnd = parseTimeToMinutes(s.endTime);
          return cur < sEnd && (cur + slotDuration) > sStart;
        });

        const basePrice = (effectiveHourlyRate * (slotDuration / 60));
        const extraPrice = customSlot ? Number(customSlot.price || 0) : 0;
        const slotPrice = basePrice + extraPrice;
          
        return sum + (slotPrice * selectedCourts.length);
      }, 0);

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
      <div className="!min-h-screen !flex !items-center !justify-center !bg-[#f8fafc]">
        <Loader2 className="!w-10 !h-10 !animate-spin !text-[#1abc60]" />
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="!min-h-screen !flex !flex-col !items-center !justify-center !gap-4 !bg-[#f8fafc]">
        <h2 className="!text-2xl !font-bold !text-gray-900">Venue not found</h2>
        <Link href="/ground" className="!text-[#1abc60] !font-bold !bg-white !px-6 !py-2.5 !rounded-lg !shadow-sm !no-underline">Back to Grounds</Link>
      </div>
    );
  }

  const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

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
    if (url.includes('goo.gl/maps') || url.includes('maps.app.goo.gl')) {
      return url; 
    }
    return url;
  };

  const embedUrl = venue ? toEmbedUrl(venue.mapUrl) : '';
  const dayNameForDisplay = new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long" });
  const currentDayRate = venue?.rates?.find((r: any) => r.day === dayNameForDisplay)?.price;
  const displayPrice = Number(currentDayRate ?? venue?.price ?? 0);

  return (
    <div className="!min-h-screen !bg-[#f8fafc] !pb-20 !pt-24 !font-sans">
      <div className="!max-w-[1200px] !mx-auto !px-4 sm:!px-6 lg:!px-8">
        
        <Link href="/ground" className="!inline-flex !items-center !text-sm !font-bold !text-gray-500 hover:!text-[#1abc60] !mb-6 !transition-colors !no-underline">
          <ChevronLeft className="!w-4 !h-4 !mr-1" /> Back to Venues
        </Link>

        {/* ================= MAIN LAYOUT ================= */}
        <div className="!flex !flex-col lg:!flex-row !gap-10">
          
          {/* LEFT COLUMN */}
          <div className="!flex-1 !min-w-0">
            <div className="!mb-6 !flex !items-start !justify-between !gap-4">
              <div className="!min-w-0">
                <h1 className="!text-3xl md:!text-4xl !font-bold !text-gray-900 !mb-3 !tracking-tight !m-0 !leading-tight">
                  {venue.title}
                </h1>
                <div className="!flex !flex-wrap !items-center !gap-3 !text-sm !font-medium !text-gray-500">
                  <div className="!bg-amber-50 !text-amber-700 !px-2.5 !py-1 !rounded-md !flex !items-center !gap-1 !font-bold !border !border-amber-100">
                    {venue.rating} <Star className="!w-3.5 !h-3.5 !fill-amber-500 !text-amber-500" />
                  </div>
                  <span>{venue.reviews} Reviews</span>
                  <span className="!w-1 !h-1 !rounded-full !bg-gray-300"></span>
                  <span className="!flex !items-center !text-gray-600">
                    <MapPin className="!w-4 !h-4 !mr-1.5 !text-gray-400" /> {venue.location}
                  </span>
                  <span className="!w-1 !h-1 !rounded-full !bg-gray-300"></span>
                  <span className="!bg-gray-100 !text-gray-700 !px-2.5 !py-1 !rounded-md !font-bold !text-[10px] !uppercase !tracking-wider">
                    {venue.surfaceType}
                  </span>
                </div>
              </div>
              {venue.logo && (
                <div className="!w-16 !h-16 md:!w-20 md:!h-20 !rounded-2xl !overflow-hidden !border !border-gray-200 !shadow-sm !shrink-0 !bg-white !p-1">
                  <img src={venue.logo} alt={`${venue.title} Logo`} className="!w-full !h-full !object-contain" />
                </div>
              )}
            </div>

            <div className="!space-y-4 !mb-12">
              <div className="!relative !h-[300px] md:!h-[450px] !w-full !rounded-2xl !overflow-hidden !shadow-sm !border !border-gray-200 !bg-white">
                <img 
                  src={venue.images?.[activeImage] || venue.image} 
                  alt={venue.title} 
                  className="!w-full !h-full !object-cover !transition-all !duration-500"
                />
              </div>
              
              {venue.images && venue.images.length > 1 && (
                <div className="!flex !gap-3 !overflow-x-auto !pb-2 !custom-scrollbar">
                  {venue.images.map((img: string, idx: number) => (
                    <button 
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`!relative !w-20 !h-20 !rounded-xl !overflow-hidden !flex-shrink-0 !border-2 !transition-all !bg-white !p-0 !cursor-pointer ${
                        activeImage === idx ? '!border-[#1abc60] !shadow-sm' : '!border-transparent !opacity-70 hover:!opacity-100'
                      }`}
                    >
                      <img src={img} alt={`${venue.title} ${idx + 1}`} className="!w-full !h-full !object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="!mb-12">
              <h3 className="!text-xl !font-bold !text-gray-900 !mb-4">Sports Available</h3>
              <div className="!flex !flex-wrap !gap-3">
                {venue.sports.map((sport: string, index: number) => (
                  <div 
                    key={sport}
                    className={`!flex !items-center !gap-2 !px-5 !py-2.5 !rounded-full !text-sm !font-bold !transition-colors !border ${
                      index === 0 
                        ? '!bg-[#1abc60] !border-[#1abc60] !text-white !shadow-sm' 
                        : '!bg-white !border-gray-200 !text-gray-700 hover:!bg-gray-50'
                    }`}
                  >
                    {sport} 
                    {index === 0 ? <Activity className="!w-4 !h-4" /> : <Circle className="!w-4 !h-4 !text-gray-400" />}
                  </div>
                ))}
              </div>
            </div>

            <div className="!mb-12">
              <h3 className="!text-xl !font-bold !text-gray-900 !mb-4">Amenities</h3>
              <div className="!grid !grid-cols-2 md:!grid-cols-4 !gap-4">
                {venue.amenities.map((amenity: string, idx: number) => (
                  <div
                    key={idx}
                    className="!bg-white !border !border-gray-200 !shadow-sm !p-4 !rounded-xl !flex !items-center !justify-center !text-center hover:!shadow-md !transition-shadow"
                  >
                    <span className="!text-sm !font-bold !text-gray-800">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="!mb-12">
              <h3 className="!text-xl !font-bold !text-gray-900 !mb-4">About Venue</h3>
              <p className="!text-base !text-gray-600 !leading-relaxed !font-medium">
                {venue.about}
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN (Booking Widget) */}
          <div className="!w-full lg:!w-[380px] !flex-shrink-0 !space-y-6 lg:!sticky lg:!top-28 !self-start">
            
            <div className="!bg-white !border !border-gray-200 !rounded-2xl !p-6 md:!p-8 !shadow-sm">
              <div className="!flex !items-baseline !justify-between !mb-8">
                <div className="!flex !items-baseline !gap-1.5">
                  <span className="!text-3xl !font-bold !text-gray-900 !m-0">₹{displayPrice}</span>
                  <span className="!text-sm !text-gray-500 !font-medium !m-0">/ hour</span>
                </div>
              </div>

              <div className="!space-y-4 !mb-8">
                
                {/* Date Picker */}
                <div className="!relative !bg-white hover:!bg-gray-50 !border !border-gray-200 !rounded-xl !px-4 !py-4 !flex !items-center !justify-between !cursor-pointer focus-within:!border-[#1abc60] focus-within:!ring-1 focus-within:!ring-[#1abc60] !transition-all">
                  <div className="!flex !items-center !text-sm !font-bold !text-gray-800">
                    <Calendar className="!w-4 !h-4 !mr-3 !text-[#1abc60]" /> 
                    {formattedDate}
                  </div>
                  <ChevronDown className="!w-4 !h-4 !text-gray-400" />
                  <input 
                    type="date" 
                    value={selectedDate}
                    min={todayDateStr}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="!absolute !inset-0 !w-full !h-full !opacity-0 !cursor-pointer"
                  />
                </div>

                {/* Time Picker */}
                <div 
                  onClick={() => setIsTimeModalOpen(true)}
                  className="!relative !bg-white hover:!bg-gray-50 !border !border-gray-200 !rounded-xl !px-4 !py-4 !flex !items-center !justify-between !cursor-pointer hover:!border-[#1abc60] !transition-all"
                >
                  <div className="!flex !items-center !text-sm !font-bold !text-gray-800">
                    <Clock className="!w-4 !h-4 !mr-3 !text-[#1abc60]" /> 
                    {selectedTimes.length > 0 
                      ? `${selectedTimes.length} Slot${selectedTimes.length > 1 ? 's' : ''} Selected` 
                      : 'Select Time Slots'}
                  </div>
                  <ChevronDown className="!w-4 !h-4 !text-gray-400" />
                </div>

                {/* Court Picker */}
                <div 
                  onClick={() => setIsCourtModalOpen(true)}
                  className="!relative !bg-white hover:!bg-gray-50 !border !border-gray-200 !rounded-xl !px-4 !py-4 !flex !items-center !justify-between !cursor-pointer hover:!border-[#1abc60] !transition-all"
                >
                  <div className="!flex !items-center !text-sm !font-bold !text-gray-800">
                    <CheckCircle2 className="!w-4 !h-4 !mr-3 !text-[#1abc60]" /> 
                    {selectedCourts.length > 0 
                      ? `${selectedCourts.length} Court${selectedCourts.length > 1 ? 's' : ''} Selected` 
                      : 'Select Courts'}
                  </div>
                  <ChevronDown className="!w-4 !h-4 !text-gray-400" />
                </div>
              </div>

              <button 
                disabled={isBooking}
                onClick={handleBooking}
                className="!w-full !bg-[#1abc60] hover:!bg-[#169c4e] disabled:!opacity-70 !text-white !text-base !font-bold !py-3.5 !rounded-xl !transition-all !border-none !shadow-sm !m-0 !cursor-pointer !flex !items-center !justify-center !gap-2"
              >
                {isBooking ? <Loader2 className="!w-5 !h-5 !animate-spin" /> : "Book Now"}
              </button>
            </div>

            {/* Operating Hours */}
            <div className="!bg-white !border !border-gray-200 !rounded-2xl !p-6 md:!p-8 !shadow-sm">
              <div className="!flex !items-center !gap-3 !mb-5">
                <div className="!bg-gray-50 !p-2 !rounded-lg !border !border-gray-200">
                  <Clock className="!w-5 !h-5 !text-gray-600" />
                </div>
                <p className="!text-base !font-bold !text-gray-900 !m-0">Operating Hours</p>
              </div>
              <div className="!space-y-3 !pt-2">
                {venue.operatingHours?.length > 0 ? (
                  venue.operatingHours.map((oh: any) => (
                    <div key={oh.day} className="!flex !justify-between !text-xs !items-center">
                      <span className="!font-medium !text-gray-600">{oh.day}</span>
                      <span className={`!font-bold ${oh.isOpen ? '!text-gray-900' : '!text-red-500'}`}>
                        {oh.isOpen ? `${oh.open} - ${oh.close}` : 'Closed'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="!text-sm !text-gray-900 !font-bold !m-0">06:00 AM - 11:00 PM</p>
                )}
              </div>
            </div>

            {/* Location Map */}
            <div className="!bg-white !border !border-gray-200 !rounded-2xl !p-6 md:!p-8 !shadow-sm">
              <div className="!flex !items-center !gap-3 !mb-4">
                <div className="!bg-gray-50 !p-2 !rounded-lg !border !border-gray-200">
                  <MapPin className="!w-5 !h-5 !text-gray-600" />
                </div>
                <span className="!text-base !font-bold !text-gray-900">Location</span>
              </div>
              <p className="!text-sm !font-medium !text-gray-600 !mb-5 !leading-relaxed">
                {venue.address}
              </p>
              <div className="!relative !h-[180px] !w-full !rounded-xl !overflow-hidden !bg-gray-100 !border !border-gray-200">
                {embedUrl ? (
                  <iframe
                    title="Venue Location"
                    src={embedUrl}
                    className="!w-full !h-full !border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="!w-full !h-full !flex !items-center !justify-center !bg-gray-100">
                     <MapPin className="!w-8 !h-8 !text-gray-400" />
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* 1. TIME SLOT MODAL (Updated exactly as per screenshot) */}
      {isTimeModalOpen && (
        <div className="!fixed !inset-0 !z-[100] !flex !items-center !justify-center !px-4">
          <div 
            className="!absolute !inset-0 !bg-gray-900/60 !backdrop-blur-sm" 
            onClick={() => setIsTimeModalOpen(false)}
          />
          <div className="!relative !bg-white !rounded-[20px] !shadow-2xl !w-full !max-w-md !overflow-hidden !flex !flex-col !max-h-[85vh] !border !border-gray-100">
            
            <div className="!px-6 !py-5 !flex !justify-between !items-center !border-b !border-gray-100 !bg-white !shrink-0">
              <h2 className="!text-lg !font-bold !text-gray-900 !m-0">Select Time</h2>
              <button onClick={() => setIsTimeModalOpen(false)} className="!p-1.5 !bg-gray-50 !text-gray-400 hover:!text-gray-800 hover:!bg-gray-100 !rounded-full !transition-colors !border-none !cursor-pointer">
                <X className="!w-5 !h-5 !block" />
              </button>
            </div>
            
            <div className="!p-6 !overflow-y-auto !custom-scrollbar">
              {Object.entries(currentSlots).map(([period, slots]) => (
                <div key={period} className="!mb-6 last:!mb-0">
                  <h3 className="!text-[11px] !font-bold !text-gray-400 !tracking-widest !uppercase !mb-3 !m-0">{period}</h3>
                  <div className="!flex !flex-col !gap-3">
                    {slots.map((slot, idx) => {
                      const val = slot.value || slot.time;
                      const isSelected = selectedTimes.includes(val);
                      const isDisabled = slot.status === "disabled";
                      return (
                        <button
                          key={idx}
                          disabled={isDisabled}
                          onClick={() => { 
                            if (selectedTimes.includes(val)) {
                              setSelectedTimes(selectedTimes.filter(t => t !== val));
                            } else {
                              setSelectedTimes([...selectedTimes, val]);
                            }
                          }}
                          className={`!w-full !py-3.5 !px-4 !rounded-xl !transition-all !text-left !flex !justify-between !items-center !m-0 !cursor-pointer !border
                            ${isDisabled 
                              ? '!bg-gray-100 !text-gray-400 !border-gray-200 !cursor-not-allowed !shadow-none !opacity-60' 
                              : isSelected
                                ? '!bg-[#e8f8ef] !border-[#1abc60] !ring-1 !ring-[#1abc60]'
                                : '!bg-white !text-gray-700 !border-gray-200 hover:!border-[#1abc60]'
                            }
                          `}
                        >
                          <div className="!flex !flex-col">
                            <span className={`!text-sm !font-bold ${isDisabled ? '!text-gray-400' : isSelected ? '!text-[#1abc60]' : '!text-gray-700'}`}>
                              {slot.time}
                            </span>
                            {isDisabled && (
                              <span className="!text-[10px] !font-bold !text-gray-400 !uppercase !mt-0.5">
                                {slot.isPast ? "Time Passed" : "Already Booked"}
                              </span>
                            )}
                          </div>
                          <span className={`!text-sm !font-bold ${isDisabled ? '!text-gray-300' : '!text-[#1abc60]'}`}>
                            ₹{slot.totalPrice}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="!p-6 !border-t !border-gray-100 !bg-white !shrink-0">
               <button 
                 onClick={() => setIsTimeModalOpen(false)}
                 className="!w-full !bg-[#1abc60] !text-white !py-3.5 !rounded-xl !font-bold !text-base !transition-all hover:!bg-[#169c4e] !border-none !cursor-pointer"
               >
                 Confirm {selectedTimes.length} Slot{selectedTimes.length !== 1 ? 's' : ''}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. COURT SELECTION MODAL */}
      {isCourtModalOpen && (
        <div className="!fixed !inset-0 !z-[100] !flex !items-center !justify-center !px-4">
          <div 
            className="!absolute !inset-0 !bg-gray-900/60 !backdrop-blur-sm" 
            onClick={() => setIsCourtModalOpen(false)}
          />
          <div className="!relative !bg-white !rounded-[20px] !shadow-2xl !w-full !max-w-md !overflow-hidden !flex !flex-col !border !border-gray-100">
            <div className="!px-6 !py-5 !flex !justify-between !items-center !border-b !border-gray-100 !bg-white !shrink-0">
              <h2 className="!text-lg !font-bold !text-gray-900 !m-0">Select Court</h2>
              <button onClick={() => setIsCourtModalOpen(false)} className="!p-1.5 !bg-gray-50 !text-gray-400 hover:!text-gray-800 hover:!bg-gray-100 !rounded-full !transition-colors !border-none !cursor-pointer">
                <X className="!w-5 !h-5 !block" />
              </button>
            </div>
            
            <div className="!p-6 !space-y-3 !overflow-y-auto !custom-scrollbar">
              {venue.courts.map((court: any) => {
                const courtName = typeof court === 'string' ? court : (court.name || 'Court');
                const courtType = typeof court === 'string' ? '' : (court.courtType || '');
                const isSelected = selectedCourts.includes(courtName);
                
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
                    className={`!w-full !flex !items-center !justify-between !p-4 !rounded-xl !cursor-pointer !border !transition-all !m-0
                      ${isAlreadyBooked
                        ? '!bg-gray-100 !text-gray-400 !border-gray-200 !cursor-not-allowed !shadow-none !opacity-60'
                        : isSelected 
                          ? '!border-[#1abc60] !bg-[#e8f8ef] !text-[#1abc60] !ring-1 !ring-[#1abc60]'
                          : '!border-gray-200 !bg-white !text-gray-700 hover:!border-[#1abc60]'
                    }`}
                  >
                    <div className="!flex !flex-col !text-left">
                      <span className={`!text-sm !font-bold ${isAlreadyBooked ? '!text-gray-400' : isSelected ? '!text-[#1abc60]' : '!text-gray-900'}`}>{courtName}</span>
                      <span className="!text-[10px] !font-medium !text-gray-500 !uppercase !tracking-widest !mt-0.5">{courtType} Surface</span>
                      {isAlreadyBooked && <span className="!text-[10px] !text-gray-400 !font-bold !uppercase !mt-1">Booked for Selected Time</span>}
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="!w-5 !h-5 !text-[#1abc60] !block" />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="!p-6 !border-t !border-gray-100 !bg-white !shrink-0">
               <button 
                 onClick={() => setIsCourtModalOpen(false)}
                 className="!w-full !bg-[#1abc60] !text-white !py-3.5 !rounded-xl !font-bold !text-base !transition-all hover:!bg-[#169c4e] !border-none !cursor-pointer"
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