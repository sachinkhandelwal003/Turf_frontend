"use client";

import Link from 'next/link';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#f8f9fa] border-t border-gray-200 font-sans">
      
      <div className="max-w-[1250px] mx-auto px-4 lg:px-8 py-16">
        
        {/* --- Main 4 Column Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

          {/* 1. Brand Info */}
          <div className="lg:col-span-1 pr-4">
            <Link href="/" className="inline-block mb-5">
              <img 
                src="/mainlogo.png" // Update with your local logo path
                alt="GameOn Logo" 
                className="h-14 object-contain"
              />
            </Link>
            <p className="text-gray-500 text-[14px] leading-relaxed max-w-[240px]">
              The Kinetic Editorial of Sport. Transforming how the world plays together.
            </p>
          </div>

          {/* 2. Company Links */}
          <div>
            <h4 className="text-[13px] font-extrabold text-[#111111] uppercase tracking-widest mb-7">
              Company
            </h4>
            <ul className="space-y-4">
              {['About Us', 'Terms of Service', 'Privacy Policy', 'Careers'].map(item => (
                <li key={item}>
                  <Link href={`/${item.toLowerCase().replace(/ /g, '-')}`}
                    // FIX: Default Gray, Hover pe Green hoga
                    className="!text-gray-500 text-[14px] font-medium hover:!text-[#1abc60] transition-colors duration-200 !no-underline block"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Support Links */}
          <div>
            <h4 className="text-[13px] font-extrabold text-[#111111] uppercase tracking-widest mb-7">
              Support
            </h4>
            <ul className="space-y-4">
              {['Contact Support', 'FAQs', 'Owner Help', 'Safety Center'].map(item => (
                <li key={item}>
                  <Link href={`/${item.toLowerCase().replace(/ /g, '-')}`}
                    // FIX: Default Gray, Hover pe Green hoga
                    className="!text-gray-500 text-[14px] font-medium hover:!text-[#1abc60] transition-colors duration-200 !no-underline block"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Newsletter Box */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-[16px] p-7 shadow-sm">
              <h4 className="text-[13px] font-extrabold text-[#111111] uppercase tracking-widest mb-3">
                Newsletter
              </h4>
              <p className="text-gray-500 text-[13px] leading-relaxed mb-5">
                Get the latest match alerts and venue openings.
              </p>
              
              <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-3.5">
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-[14px] w-full text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#1abc60] focus:ring-1 focus:ring-[#1abc60] transition-all"
                />
                <button 
                  type="submit"
                  className="!bg-[#1abc60] hover:!bg-[#169c4e] !text-white font-bold py-3 rounded-lg text-[14px] transition-colors w-full !border-none !shadow-sm cursor-pointer !m-0"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* --- Bottom Bar --- */}
        <div className="mt-16 pt-8 flex items-center justify-center border-t border-gray-200">
          <p className="text-gray-400 text-[13px]">
            &copy; {year} GameOn. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;