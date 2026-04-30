"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react'; 

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Ground', href: '/ground' },
  { name: 'Tournaments', href: '/tournament' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [isOpen]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white border-b border-gray-100 py-5">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          
          <div className="flex items-center justify-between h-[40px]">

            {/* 1. Left side: Logo */}
            <div className="flex-1 flex justify-start">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <img 
                  src="/mainlogo.png" 
                  alt="GameOn Logo" 
                  className="h-10 md:h-16 object-contain"
                />
              </Link>
            </div>

            {/* 2. Center: Desktop Nav Links */}
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

            {/* 3. Right side: Login & Sign Up (Desktop) */}
            <div className="hidden lg:flex flex-1 items-center justify-end gap-6">
              <Link 
                href="/login" 
                className="text-[14px] font-bold !text-gray-700 hover:!text-[#1abc60] transition-colors"
              >
                Login
              </Link>
              <Link 
                href="/Signup"
                className="!bg-[#1abc60] !text-white text-[14px] font-bold !px-6 !py-2 !rounded-[6px] hover:!bg-[#169c4e] transition-colors !border-none !shadow-none inline-flex items-center justify-center h-auto w-auto m-0"
              >
                Sign Up
              </Link>
            </div>

            {/* Mobile hamburger menu button */}
            <button
              onClick={() => setIsOpen(true)}
              className="lg:hidden flex-none !bg-transparent !text-gray-800 hover:!text-[#1abc60] !shadow-none !p-1 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-8 h-8" />
            </button>

          </div>
        </div>
      </nav>

      {/* Off-Canvas Mobile Menu */}
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
              <div className="p-6 flex justify-end border-b border-gray-100">
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="!p-2 !text-gray-600 hover:!text-[#1abc60] transition-colors !bg-gray-100 !rounded-full !shadow-none"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-col px-8 py-8 gap-6 flex-1 overflow-y-auto">
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
                        className={`block text-xl font-bold transition-all duration-300 ${
                          isActive ? 'text-[#1abc60] pl-2 border-l-4 border-[#1abc60]' : 'text-gray-700 hover:text-[#1abc60]'
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
                  <Link 
                    href="/login" 
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center py-3 text-gray-700 font-bold border border-gray-200 rounded-[10px] hover:border-[#1abc60] hover:text-[#1abc60] transition-colors"
                  >
                    Login
                  </Link>
                  <Link 
                    href="/Signup" 
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center py-3 bg-[#1abc60] text-white font-bold rounded-[10px] hover:bg-[#169c4e] transition-colors"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}