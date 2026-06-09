"use client";
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, ChevronDown, X, Navigation, Trophy } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/app/services/api';
import { toast } from 'sonner';

export default function Hero() {
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [searchType, setSearchType] = useState<'ground' | 'tournament'>('ground');
  const [sports, setSports] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isSportOpen, setIsSportOpen] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [heroData, setHeroData] = useState({
    title: "UP YOUR GAME",
    subtitle: "Premium sports venues, professional training, and competitive matches. Book your victory in seconds.",
    image: "/heroimage.png"
  });

  const locationRef = useRef<HTMLDivElement>(null);
  const sportRef = useRef<HTMLDivElement>(null);

  const handleAutoDetect = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const city = data.address.city || data.address.town || data.address.village || data.address.state_district || "Unknown Location";
          
          setSelectedLocation(city);
          setIsLocationOpen(false);
          toast.success(`Location detected: ${city}`);
        } catch (error) {
          console.error("Reverse geocoding failed:", error);
          toast.error("Failed to detect city name");
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        toast.error("Failed to get your location. Please check permissions.");
        setIsDetecting(false);
      }
    );
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedLocation) params.set('location', selectedLocation);
    if (selectedSport) params.set('sport', selectedSport);
    
    const path = searchType === 'ground' ? '/ground' : '/tournament';
    router.push(`${path}?${params.toString()}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mastersRes, turfRes] = await Promise.all([
          api.get('/masters'),
          api.get('/turfs')
        ]);

        if (mastersRes.data.success) {
          const sportsList = mastersRes.data.masters
            .filter((m: any) => m.category === 'sport')
            .map((m: any) => m.name);
          setSports(sportsList);
        }

        if (turfRes.data.success) {
          const citySet = new Set<string>();
          turfRes.data.turfs.forEach((t: any) => {
            if (t.location?.city) citySet.add(t.location.city);
          });
          setCities(Array.from(citySet).sort());
        }
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    };

    const fetchHeroSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data.success && res.data.settings) {
          const s = res.data.settings;
          const hero = s.heroBanner || {};
          
          const title = hero.title || s.heroTitle || s.hero_title || "UP YOUR GAME";
          const subtitle = hero.subtitle || s.heroSubtitle || s.hero_subtitle || "Premium sports venues, professional training, and competitive matches. Book your victory in seconds.";
          
          let image = hero.image || s.heroImage || s.hero_image || s.image || "";
          if (!image && s.images && s.images.length > 0) {
            image = s.images[0];
          }
          
          const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || '';
          let finalImageUrl = "/heroimage.png"; 
          
          if (image) {
            if (image.startsWith('http')) {
              finalImageUrl = image;
            } else if (image.startsWith('/uploads') || image.startsWith('uploads')) {
              const path = image.startsWith('/') ? image : `/${image}`;
              finalImageUrl = `${baseUrl}${path}`;
            } else if (image.startsWith('/')) {
              finalImageUrl = image;
            } else {
              finalImageUrl = `${baseUrl}/${image}`;
            }
          }
          
          setHeroData({
            title: title,
            subtitle: subtitle,
            image: finalImageUrl
          });
        }
      } catch (error) {
        console.error('Failed to fetch hero settings:', error);
      }
    };

    fetchData();
    fetchHeroSettings();
  }, []);

  const formatTitle = (title: string) => {
    if (!title) return "";
    const words = title.trim().split(' ');
    if (words.length <= 1) return title;
    
    const lastWord = words.pop();
    const remainingTitle = words.join(' ');
    
    return (
      <>
        {remainingTitle} <span className="text-[#1abc60]">{lastWord}</span>
      </>
    );
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setIsLocationOpen(false);
      }
      if (sportRef.current && !sportRef.current.contains(event.target as Node)) {
        setIsSportOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <section className="relative h-[550px] md:h-[600px] flex items-center justify-center font-sans overflow-hidden pt-[80px]">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroData.image}
          alt="Sports Turf Banner"
          className="w-full h-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 text-center mt-[-20px]">

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-7xl lg:text-[85px] font-bold !text-white uppercase tracking-tight mb-3 md:mb-4 leading-none"
        >
          {formatTitle(heroData.title)}
        </motion.h1>

        {/* Sub-heading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-white text-[13px] sm:text-[14px] md:text-[16px] font-medium mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed md:whitespace-pre-line px-2"
        >
          <span className="md:hidden">
            {heroData.subtitle.replace(/\n/g, ' ')}
          </span>
          <span className="hidden md:inline">
            {heroData.subtitle}
          </span>
        </motion.p>

        {/* ================= RESPONSIVE, SLIM & SEAMLESS SEARCH BAR ================= */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-col items-center w-[98%] sm:w-[94%] max-w-[600px] mx-auto"
        >
          <div className="bg-white p-1.5 md:p-2 shadow-2xl flex flex-row items-center w-full rounded-[14px] md:rounded-2xl relative">
            
            {/* LOCATION SECTION */}
            <div ref={locationRef} className="relative flex-1 min-w-0">
              <div
                className="flex items-center px-2 md:px-3 py-1.5 md:py-2.5 cursor-pointer mx-0.5 md:mx-1 rounded-xl hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setIsLocationOpen(!isLocationOpen);
                  setIsSportOpen(false);
                }}
              >
                <MapPin className="text-[#1abc60] w-3.5 h-3.5 md:w-[18px] md:h-[18px] mr-1.5 md:mr-2 flex-shrink-0" strokeWidth={2.5} />
                <input
                  type="text"
                  readOnly
                  value={selectedLocation}
                  placeholder="Location"
                  className="w-full outline-none text-gray-800 bg-transparent text-[13px] md:text-[14px] font-bold placeholder:text-gray-400 cursor-pointer truncate"
                />
                {selectedLocation && (
                  <X 
                    className="w-3 h-3 md:w-[14px] md:h-[14px] text-gray-400 hover:text-red-500 ml-1 cursor-pointer flex-shrink-0 transition-colors" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLocation('');
                    }}
                  />
                )}
              </div>

              <AnimatePresence>
                {isLocationOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-[calc(100%+12px)] left-0 w-[200px] sm:w-[220px] md:w-[120%] bg-white rounded-xl shadow-2xl border border-gray-100 py-1.5 z-[100] text-left overflow-hidden"
                  >
                    {/* Auto Detect Option */}
                    <div
                      onClick={handleAutoDetect}
                      className="px-3 md:px-4 py-2.5 hover:bg-[#e8f8ef] text-[12px] md:text-[13px] text-[#1abc60] font-bold cursor-pointer border-b border-gray-50 flex items-center gap-2 group transition-colors"
                    >
                      <Navigation className={`w-3.5 h-3.5 md:w-[14px] md:h-[14px] group-hover:animate-pulse ${isDetecting ? 'animate-spin' : ''}`} />
                      {isDetecting ? "Detecting..." : "Detect Location"}
                    </div>

                    <div className="max-h-[160px] md:max-h-[200px] overflow-y-auto custom-scrollbar bg-white">
                      {cities.length > 0 ? (
                        cities.map((loc, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setSelectedLocation(loc);
                              setIsLocationOpen(false);
                            }}
                            className="px-3 md:px-4 py-2 hover:bg-gray-50 text-[12px] md:text-[13px] text-gray-700 cursor-pointer truncate font-medium border-b border-gray-50 last:border-0"
                          >
                            {loc}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 md:px-4 py-2.5 text-[12px] text-gray-400 italic">No locations found</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* SEPARATOR */}
            <div className="w-[1px] h-5 md:h-6 bg-gray-200 mx-0.5 md:mx-1 flex-shrink-0"></div>

            {/* SPORT SECTION */}
            <div ref={sportRef} className="relative flex-1 min-w-0">
              <div
                className="flex items-center px-2 md:px-3 py-1.5 md:py-2.5 cursor-pointer mx-0.5 md:mx-1 rounded-xl hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setIsSportOpen(!isSportOpen);
                  setIsLocationOpen(false);
                }}
              >
                <div className="relative mr-1.5 md:mr-2 flex-shrink-0">
                  <Trophy className="text-[#1abc60] w-3.5 h-3.5 md:w-[18px] md:h-[18px]" strokeWidth={2.5} />
                  <div className="absolute -top-0.5 -right-0.5 w-1 h-1 md:w-1.5 md:h-1.5 bg-[#1abc60] rounded-full border border-white"></div>
                </div>
                <input
                  type="text"
                  readOnly
                  value={selectedSport}
                  placeholder="Sports"
                  className="w-full outline-none text-gray-800 bg-transparent text-[13px] md:text-[14px] font-bold placeholder:text-gray-500 cursor-pointer truncate"
                />
                <ChevronDown className={`w-3 h-3 md:w-[14px] md:h-[14px] text-gray-400 flex-shrink-0 transition-transform duration-300 ${isSportOpen ? 'rotate-180' : ''}`} />
              </div>

              <AnimatePresence>
                {isSportOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-[180px] sm:w-[200px] md:w-[120%] bg-white rounded-xl shadow-2xl border border-gray-100 py-1.5 z-[100] text-left overflow-hidden"
                  >
                    {/* max-h-[114px] exactly perfectly fits ~3 items (approx 38px height per item) */}
                    <div className="max-h-[114px] overflow-y-auto custom-scrollbar bg-white">
                      {sports.length > 0 ? (
                        sports.map((sport, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setSelectedSport(sport);
                              setIsSportOpen(false);
                            }}
                            className="px-3 md:px-4 py-2 hover:bg-[#e8f8ef] text-[12px] md:text-[13px] text-gray-700 hover:text-[#1abc60] cursor-pointer truncate font-medium border-b border-gray-50 last:border-0"
                          >
                            {sport}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 md:px-4 py-2.5 text-[12px] text-gray-400 italic">No sports found</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* SEARCH BUTTON */}
            <button
              onClick={handleSearch}
              className="bg-[#1abc60] hover:bg-[#169c4e] text-white font-bold p-2 sm:py-2 sm:px-4 md:py-2.5 md:px-6 rounded-[10px] md:rounded-xl transition-all flex items-center justify-center gap-2 text-[13px] md:text-[15px] flex-shrink-0 border-none ml-1 md:ml-2 shadow-lg shadow-green-100 active:scale-95 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 md:w-[18px] md:h-[18px] text-white flex-shrink-0" strokeWidth={3} />
              <span className="tracking-wide hidden sm:inline">Search</span>
            </button>

          </div>
        </motion.div>

      </div>
    </section>
  );
}