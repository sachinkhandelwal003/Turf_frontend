"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, User, LogOut } from 'lucide-react'; 
import { useAuth } from '@/app/context/AuthContext';
const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Ground', href: '/ground' },
  { name: 'Tournaments', href: '/tournament' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // === AUTHENTICATION STATES ===
  const { isAuthenticated: isLoggedIn, logout, user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [isOpen]);

  // Click outside to close Profile Dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white border-b border-gray-100 py-4 lg:py-5">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
          
          <div className="flex items-center justify-between h-[40px]">

            {/* --- LEFT: LOGO --- */}
            <div className="flex-1 flex justify-start">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <img 
                  src="/mainlogo.png" 
                  alt="GameOn Logo" 
                  className="h-10 md:h-14 object-contain"
                />
              </Link>
            </div>

            {/* --- CENTER: DESKTOP NAV LINKS --- */}
            <div className="hidden lg:flex items-center justify-center gap-10">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`relative text-[14px] font-bold transition-colors duration-300 py-1 ${
                      isActive ? '!text-[#1abc60]' : '!text-gray-700 hover:!text-[#1abc60]'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-[#1abc60] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* --- RIGHT: AUTH / PROFILE (DESKTOP) --- */}
            <div className="hidden lg:flex flex-1 items-center justify-end gap-6">
              {isLoggedIn ? (
                // === LOGGED IN STATE ===
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    // Button pe fix: !bg-transparent lagaya hai global CSS hatane ke liye
                    className="w-10 h-10 rounded-full border-2 border-transparent hover:border-[#1abc60] overflow-hidden cursor-pointer transition-all shadow-sm focus:outline-none !bg-transparent !p-0"
                  >
                    <img
                      src={user?.profilePhoto 
                        ? (user.profilePhoto.startsWith('http') ? user.profilePhoto : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '')}${user.profilePhoto}`)
                        : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Felix'}`} 
                      alt="Profile"
                      className="w-full h-full object-cover bg-gray-100"
                    />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        // Z-index badha diya taaki kisi element ke peeche na chhupe
                        className="absolute right-0 mt-3 w-[240px] bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 py-2 overflow-hidden z-[100]"
                      >
                        {/* Header: Exact image jaisa design */}
                        <div className="px-5 py-4 border-b border-gray-50 mb-2">
                          <p className="text-[15px] font-bold !text-[#2d3748] truncate tracking-tight">{user?.name || 'User'}</p>
                          <p className="text-[13px] font-medium !text-gray-500 truncate">{user?.email || 'email@example.com'}</p>
                        </div>
                        
                        <Link
                          href="/profile"
                          onClick={() => setIsDropdownOpen(false)}
                          // My profile icon and text green as per image
                          className="flex items-center gap-3 px-5 py-3 text-[14px] font-bold !text-[#1abc60] hover:bg-gray-50 transition-colors !no-underline"
                        >
                          <User className="w-4 h-4" strokeWidth={2.5} /> My Profile
                        </Link>
                        
                        {/* 
                          SIGN OUT FIX: 
                          <button> ki jagah <div> use kiya hai. Global CSS ab isko kabhi target nahi kar payegi. 
                        */}
                        <div
                          onClick={() => {
                            logout();
                            setIsDropdownOpen(false);
                            window.location.href = '/'; 
                          }}
                          className="flex items-center gap-3 px-5 py-3 text-[14px] font-bold !text-red-500 hover:bg-red-50 transition-colors cursor-pointer m-0"
                        >
                          <LogOut className="w-4 h-4" strokeWidth={2.5} /> Sign Out
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                // === LOGGED OUT STATE ===
                <>
                  <Link 
                    href="/login" 
                    className="text-[14px] font-bold !text-gray-700 hover:!text-[#1abc60] transition-colors !no-underline"
                  >
                    Login
                  </Link>
                  <Link 
                    href="/Signup" 
                    className="!bg-[#1abc60] !text-white text-[14px] font-bold !px-6 !py-2 !rounded-[6px] hover:!bg-[#169c4e] transition-colors !border-none !shadow-none inline-flex items-center justify-center !no-underline"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* --- MOBILE HAMBURGER MENU BUTTON --- */}
            <button
              onClick={() => setIsOpen(true)}
              className="lg:hidden flex-none !bg-transparent !border-none !text-gray-800 hover:!text-[#1abc60] !shadow-none !p-1 transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              <Menu className="w-7 h-7 sm:w-8 sm:h-8" />
            </button>

          </div>
        </div>
      </nav>

      {/* ================= MOBILE OFF-CANVAS MENU ================= */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden"
            />
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[80%] max-w-sm bg-white shadow-2xl z-[70] flex flex-col lg:hidden"
            >
              <div className="p-5 sm:p-6 flex justify-end border-b border-gray-100">
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="!p-2 !text-gray-600 hover:!text-[#1abc60] transition-colors !bg-gray-100 !border-none !rounded-full !shadow-none cursor-pointer"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="flex flex-col px-6 py-8 sm:px-8 gap-6 flex-1 overflow-y-auto">
                {navLinks.map((link, i) => {
                  const isActive = pathname === link.href;
                  return (
                    <motion.div 
                      key={link.name} 
                      initial={{ opacity: 0, x: 20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: i * 0.1 }}
                    >
                      <Link 
                        href={link.href} 
                        onClick={() => setIsOpen(false)} 
                        className={`block text-[18px] sm:text-xl font-bold transition-all duration-300 !no-underline ${
                          isActive ? '!text-[#1abc60] pl-2 border-l-4 border-[#1abc60]' : '!text-gray-700 hover:!text-[#1abc60]'
                        }`}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  );
                })}

                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.4 }}
                  className="mt-8 flex flex-col gap-4"
                >
                  {isLoggedIn ? (
                    // === MOBILE LOGGED IN STATE ===
                    <>
                      <Link 
                        href="/profile" 
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 text-[18px] font-bold !text-[#1abc60] !no-underline"
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-[#1abc60]/20">
                          <img
                            src={user?.profilePhoto 
                              ? (user.profilePhoto.startsWith('http') ? user.profilePhoto : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '')}${user.profilePhoto}`)
                              : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Felix'}`} 
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        My Profile
                      </Link>
                      <div 
                        onClick={() => {
                          logout();
                          setIsOpen(false);
                          window.location.href = '/';
                        }}
                        className="flex items-center gap-3 text-[18px] font-bold !text-red-500 cursor-pointer"
                      >
                        <LogOut className="w-5 h-5" /> Sign Out
                      </div>
                    </>
                  ) : (
                    // === MOBILE LOGGED OUT STATE ===
                    <>
                      <Link 
                        href="/login" 
                        onClick={() => setIsOpen(false)}
                        className="w-full text-center py-3.5 border-2 border-[#1abc60] text-[#1abc60] rounded-xl font-bold !no-underline"
                      >
                        Login
                      </Link>
                      <Link 
                        href="/Signup" 
                        onClick={() => setIsOpen(false)}
                        className="w-full text-center py-3.5 bg-[#1abc60] text-white rounded-xl font-bold !no-underline"
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}