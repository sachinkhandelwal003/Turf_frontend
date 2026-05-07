"use client";
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, ChevronDown, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/app/services/api';

// Mock Data Dropdowns ke liye
const LOCATIONS = [
  "Indiranagar, Bangalore",
  "Koramangala, Bangalore",
  "HSR Layout, Bangalore",
  "Whitefield, Bangalore",
  "Jayanagar, Bangalore"
];

export default function Hero() {
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [sports, setSports] = useState<string[]>([]);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isSportOpen, setIsSportOpen] = useState(false);
  const [heroData, setHeroData] = useState({
    title: "UP YOUR GAME",
    subtitle: "Premium sports venues, professional training, and competitive matches. Book your victory in seconds.",
    image: "/heroimage.png"
  });

  const locationRef = useRef<HTMLDivElement>(null);
  const sportRef = useRef<HTMLDivElement>(null);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedLocation) params.set('location', selectedLocation);
    if (selectedSport) params.set('sport', selectedSport);
    
    router.push(`/ground?${params.toString()}`);
  };

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const res = await api.get('/masters');
        if (res.data.success) {
          const sportsList = res.data.masters
            .filter((m: any) => m.category === 'sport')
            .map((m: any) => m.name);
          setSports(sportsList);
        }
      } catch (error) {
        console.error('Failed to fetch sports:', error);
      }
    };

    const fetchHeroSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data.success && res.data.settings) {
          const s = res.data.settings;
          const hero = s.heroBanner || {};
          
          // Fallback to top level fields if heroBanner is not an object
          const title = hero.title || s.heroTitle || s.hero_title || "UP YOUR GAME";
          const subtitle = hero.subtitle || s.heroSubtitle || s.hero_subtitle || "Premium sports venues, professional training, and competitive matches. Book your victory in seconds.";
          
          // Check various possible image fields
          let image = hero.image || s.heroImage || s.hero_image || s.image || "";
          if (!image && s.images && s.images.length > 0) {
            image = s.images[0];
          }
          
          const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || '';
          
          let finalImageUrl = "/heroimage.png"; // Default fallback
          
          if (image) {
            if (image.startsWith('http')) {
              finalImageUrl = image;
            } else if (image.startsWith('/uploads') || image.startsWith('uploads')) {
              // Backend uploads
              const path = image.startsWith('/') ? image : `/${image}`;
              finalImageUrl = `${baseUrl}${path}`;
            } else if (image.startsWith('/')) {
              // Local public assets or absolute paths
              // If it's a known backend path pattern, prepend baseUrl
              // Otherwise keep as is for frontend public assets
              finalImageUrl = image;
            } else {
              // Relative path, assume backend
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

    fetchSports();
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
    <section className="relative h-[550px] md:h-[650px] flex items-center justify-center font-sans overflow-hidden pt-[80px]">
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

      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 text-center mt-[-40px]">

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-7xl lg:text-[85px] font-bold !text-white uppercase tracking-tight mb-4 leading-none"
        >
          {formatTitle(heroData.title)}
        </motion.h1>

        {/* Sub-heading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-white text-[14px] md:text-[17px] font-medium mb-10 max-w-2xl mx-auto leading-relaxed whitespace-pre-line"
        >
          {heroData.subtitle}
        </motion.p>

        {/* ================= COMPACT SEARCH BAR ================= */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-white p-1.5 shadow-2xl flex flex-row items-center w-[92%] sm:w-full max-w-[520px] mx-auto rounded-xl"
        >

          {/* LOCATION SECTION */}
          <div ref={locationRef} className="relative flex-1 min-w-0">
            <div
              className="flex items-center px-3 md:px-4 py-2 cursor-pointer"
              onClick={() => {
                setIsLocationOpen(!isLocationOpen);
                setIsSportOpen(false);
              }}
            >
              <MapPin className="text-[#2b7bf5] w-4 h-4 md:w-5 md:h-5 mr-2 flex-shrink-0" strokeWidth={1.5} />
              <input
                type="text"
                readOnly
                value={selectedLocation}
                placeholder="Location"
                className="w-full outline-none text-gray-800 bg-transparent text-[14px] md:text-[15px] font-medium placeholder:text-gray-600 cursor-pointer truncate"
              />
              {selectedLocation && (
                <X 
                  className="w-4 h-4 text-gray-400 hover:text-gray-600 ml-1 cursor-pointer flex-shrink-0" 
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
                  className="absolute top-[120%] left-0 w-[220px] md:w-full bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 text-left"
                >
                  {LOCATIONS.map((loc, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedLocation(loc);
                        setIsLocationOpen(false);
                      }}
                      className="px-4 py-2.5 hover:bg-gray-50 text-[14px] text-gray-700 cursor-pointer truncate"
                    >
                      {loc}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* DIVIDER 1 */}
          <div className="h-6 w-[1.5px] bg-[#f5e3b5] flex-shrink-0 mx-1"></div>

          {/* SPORT SECTION */}
          <div ref={sportRef} className="relative flex-1 min-w-0">
            <div
              className="flex items-center justify-between px-3 md:px-5 py-1 cursor-pointer"
              onClick={() => {
                setIsSportOpen(!isSportOpen);
                setIsLocationOpen(false);
              }}
            >
              <div className="flex items-center flex-1 min-w-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  className="text-[#1abc60] w-4 h-4 md:w-5 md:h-5 mr-2 flex-shrink-0"
                >
                  <circle cx="9" cy="9" r="6" /><path d="M13.2 13.2L19 19" /><line x1="6" y1="9" x2="12" y2="9" /><line x1="9" y1="6" x2="9" y2="12" /><circle cx="18" cy="6" r="2" fill="currentColor" stroke="none" />
                </svg>
                <input
                  type="text"
                  readOnly
                  value={selectedSport}
                  placeholder="sports"
                  className="w-full outline-none text-gray-800 bg-transparent text-[14px] md:text-[15px] font-medium placeholder:text-gray-600 cursor-pointer truncate"
                />
                {selectedSport && (
                  <X 
                    className="w-4 h-4 text-gray-400 hover:text-gray-600 ml-1 cursor-pointer flex-shrink-0" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSport('');
                    }}
                  />
                )}
              </div>
              <ChevronDown
                className="w-4 h-4 text-gray-400 transition-transform flex-shrink-0"
                style={{ transform: isSportOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            </div>

            <AnimatePresence>
              {isSportOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-[120%] left-0 w-[180px] md:w-full bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 text-left"
                >
                  {sports.map((sport, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedSport(sport);
                        setIsSportOpen(false);
                      }}
                      className="px-4 py-2.5 hover:bg-gray-50 text-[14px] text-gray-700 cursor-pointer"
                    >
                      {sport}
                    </div>
                  ))}
                  {sports.length === 0 && (
                    <div className="px-4 py-2.5 text-[14px] text-gray-400 italic">
                      No sports available
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* DIVIDER 2 */}
          <div className="h-6 w-[1.5px] bg-[#f5e3b5] flex-shrink-0 mx-1 md:mx-2"></div>

          {/* SEARCH BUTTON */}
          <button
            onClick={handleSearch}
            className="bg-[#1abc60] hover:bg-[#169c4e] !text-white font-medium py-4 px-5 md:px-6 rounded-lg transition-colors flex items-center justify-center gap-1.5 text-[14px] md:text-[15px] flex-shrink-0 !border-none"
          >
            <span className="hidden sm:inline">Search</span>
            <Search className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
          </button>

        </motion.div>

      </div>
    </section>
  );
}