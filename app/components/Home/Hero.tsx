"use client";
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

// Mock Data Dropdowns ke liye
const LOCATIONS = [
  "Indiranagar, Bangalore",
  "Koramangala, Bangalore",
  "HSR Layout, Bangalore",
  "Whitefield, Bangalore",
  "Jayanagar, Bangalore"
];

const SPORTS = [
  "Football",
  "Cricket",
  "Badminton",
  "Tennis",
  "Swimming",
  "Basketball"
];

export default function Hero() {
  // State variables dropdown manage karne ke liye
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isSportOpen, setIsSportOpen] = useState(false);

  // Click outside handle karne ke liye (taaki bahar click karne pe dropdown band ho jaye)
  const locationRef = useRef<HTMLDivElement>(null);
  const sportRef = useRef<HTMLDivElement>(null);

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
    <section className="relative h-[700px] flex items-center justify-center font-sans overflow-hidden pt-[80px]">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/heroimage.png" 
          alt="Sports Turf Banner"
          className="w-full h-full object-cover"
        />
        
      </div>

      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 md:px-6 text-center mt-[-60px]">
        
        {/* Main Heading */}
        {/* FIX 1 & 2: `animate` ki jagah `whileInView` lagaya aur `!text-white` kiya */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-6xl md:text-[90px] font-semibold !text-white uppercase tracking-tight mb-4 leading-none drop-shadow-md whitespace-nowrap"
        >
          UP YOUR <span className="text-[#1abc60]">GAME</span>
        </motion.h1>

        {/* Sub-heading */}
        {/* Yahan bhi whileInView aur !text-white lagaya */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="!text-white text-[14px] md:text-[17px] font-semibold mb-12 max-w-4xl mx-auto leading-relaxed drop-shadow-sm px-2"
        >
          Premium sports venues, professional training, and competitive <br className="hidden md:block" /> matches. Book your victory in seconds.
        </motion.p>

        {/* --- INTERACTIVE SEARCH BAR --- */}
        {/* Yahan bhi whileInView lagaya taaki back aane par gayab na ho */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-white p-1.5 shadow-2xl flex flex-row items-center max-w-[550px] mx-auto gap-0 border border-gray-100 rounded-[14px]"
        >
          
          {/* LOCATION DROPDOWN */}
          <div ref={locationRef} className="relative flex-1 flex items-center border-r border-gray-200 min-w-0">
            <div 
              className="flex-1 flex items-center px-3 md:px-5 py-1.5 md:py-2.5 cursor-pointer"
              onClick={() => {
                setIsLocationOpen(!isLocationOpen);
                setIsSportOpen(false); // Doosra band kar do
              }}
            >
              <MapPin className="text-[#2979FF] w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-3 flex-shrink-0" />
              <input
                type="text"
                readOnly // readOnly kiya hai taaki mobile me keyboard na khule, sirf list aaye
                value={selectedLocation}
                placeholder="Location" 
                className="w-full outline-none text-gray-800 bg-transparent text-[13px] md:text-[15.5px] font-medium placeholder:text-gray-500 min-w-0 truncate cursor-pointer"
              />
            </div>

            {/* Location Dropdown Menu */}
            <AnimatePresence>
              {isLocationOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-[120%] left-0 w-[250px] bg-white rounded-[12px] shadow-xl border border-gray-100 py-2 z-50 text-left"
                >
                  {LOCATIONS.map((loc, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        setSelectedLocation(loc);
                        setIsLocationOpen(false);
                      }}
                      className="px-4 py-2.5 hover:bg-gray-50 text-[14px] text-gray-700 cursor-pointer transition-colors"
                    >
                      {loc}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* SPORT DROPDOWN */}
          <div ref={sportRef} className="relative flex-1 flex items-center min-w-0">
            <div 
              className="flex-1 flex items-center px-2.5 md:px-5 py-1.5 md:py-2.5 cursor-pointer justify-between"
              onClick={() => {
                setIsSportOpen(!isSportOpen);
                setIsLocationOpen(false); // Doosra band kar do
              }}
            >
              <div className="flex items-center flex-1 min-w-0">
                {/* Custom Racket & Ball Icon */}
                <svg 
                  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                  className="text-[#1abc60] w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-3 flex-shrink-0"
                >
                  <circle cx="9" cy="9" r="6" /><path d="M13.2 13.2L19 19" /><line x1="6" y1="9" x2="12" y2="9" /><line x1="9" y1="6" x2="9" y2="12" /><circle cx="18" cy="6" r="2" fill="currentColor" stroke="none" />
                </svg>
                <input
                  type="text"
                  readOnly // readOnly kiya hai taaki typing na ho, bas select ho
                  value={selectedSport}
                  placeholder="Sports"
                  className="w-full outline-none text-gray-800 bg-transparent text-[13px] md:text-[15.5px] font-medium placeholder:text-gray-500 min-w-0 truncate cursor-pointer"
                />
              </div>
              <ChevronDown className={`w-4 h-4 md:w-5 md:h-5 text-gray-400 ml-1 md:ml-2 cursor-pointer flex-shrink-0 hidden sm:block transition-transform ${isSportOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Sport Dropdown Menu */}
            <AnimatePresence>
              {isSportOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-[120%] left-0 w-[200px] bg-white rounded-[12px] shadow-xl border border-gray-100 py-2 z-50 text-left"
                >
                  {SPORTS.map((sport, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        setSelectedSport(sport);
                        setIsSportOpen(false);
                      }}
                      className="px-4 py-2.5 hover:bg-gray-50 text-[14px] text-gray-700 cursor-pointer transition-colors"
                    >
                      {sport}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Green Search Button */}
     <Link 
  href="/ground"
  className="!bg-[#1abc60] hover:!bg-[#169c4e] !text-white font-semibold py-2 md:py-2.5 px-4 md:px-8 rounded-[10px] transition-all duration-300 flex items-center justify-center gap-2 text-[13px] md:text-[15.5px] !shadow-md hover:!shadow-lg ml-1 flex-shrink-0 !border-none"
>
  <span className="hidden sm:inline">Search</span>
  <Search className="w-[16px] h-[16px] md:w-[18px] md:h-[18px] !text-white" strokeWidth={2.5} />
</Link>
        </motion.div>

      </div>
    </section>
  );
}