'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Database,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/app/services/api';

const baseMenuItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/turfs', label: 'Venues', icon: FolderOpen },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/roles', label: 'Roles & Permissions', icon: Shield },
  { href: '/admin/masters', label: 'Masters', icon: Database },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

const superadminMenuItems: any[] = [];

interface AdminSidebarProps {
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

export default function AdminSidebar({ sidebarOpen = false, setSidebarOpen }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { isSuperadmin, isAuthenticated, user } = useAuth();
  const [logo, setLogo] = useState<string>('/mainlogo.png');

  useEffect(() => {
    const fetchSettings = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await api.get('/settings');
        if (res.data.success && res.data.settings.backendLogo) {
          const backendLogo = res.data.settings.backendLogo;
          const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || '';
          setLogo(backendLogo.startsWith('http') ? backendLogo : `${baseUrl}${backendLogo}`);
        }
      } catch (error) {
        // Silent error
      }
    };
    fetchSettings();
  }, [isAuthenticated]);

  const menuItems = isSuperadmin ? [...baseMenuItems, ...superadminMenuItems] : baseMenuItems;

  return (
    <>
      {/* ========================================== */}
      {/*             DESKTOP SIDEBAR                */}
      {/* ========================================== */}
      <aside 
        className={`
          hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out
          ${collapsed ? 'w-[88px]' : 'w-72'} 
          h-screen sticky top-0 flex-shrink-0 relative z-30
        `}
      >
        {/* Logo Header */}
        <div className="h-24 flex items-center justify-center px-4 shrink-0 relative border-b border-gray-100">
          <div className={`relative flex items-center justify-center transition-all duration-300 ${collapsed ? 'w-10 h-10' : 'w-36 h-12'}`}>
            {!collapsed ? (
              <Image 
                src={logo} 
                alt="Admin Logo" 
                fill 
                sizes="144px"
                className="object-contain" 
                priority
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-xl">
                <span className="!text-[#1abc60] font-black text-2xl">G</span>
              </div>
            )}
          </div>
          
          {/* Toggle Button (FIXED: Bada kiya, Black BG diya) */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-1 top-1/2 -translate-y-1/2 w-8 h-8 !bg-[#1abc60] hover:!bg-[#1abc60]/80 rounded-full flex items-center justify-center !text-white transition-all z-50 !shadow-md !border-2 !border-white !p-0 cursor-pointer"
          >
            {collapsed ? <ChevronRight className="w-5 h-5 ml-0.5" strokeWidth={2.5} /> : <ChevronLeft className="w-5 h-5 pr-0.5" strokeWidth={2.5} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  relative flex items-center rounded-xl transition-all duration-200 group border-[1.5px] !no-underline
                  ${collapsed ? 'justify-center p-3' : 'px-4 py-3.5 gap-3.5'}
                  ${isActive
                    ? '!bg-[#1abc60] !text-white !border-black shadow-sm' 
                    : '!bg-transparent !text-[#1abc60] !border-transparent hover:!bg-gray-50'
                  }
                `}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? '!text-white' : '!text-slate-500'}`} strokeWidth={2.5} />
                
                {!collapsed && (
                  <span className={`text-[15px] flex-1 ${isActive ? 'font-medium' : 'font-medium'}`}>
                    {item.label}
                  </span>
                )}

                {/* White Dot Indicator for Active Item */}
                {!collapsed && isActive && (
                  <div className="w-[5px] h-[5px] rounded-full !bg-white absolute right-4"></div>
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* User Profile Footer */}
        <div className="p-4 shrink-0 border-t border-gray-100 mb-2 mt-auto">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} p-2 rounded-xl hover:bg-gray-50 transition-all cursor-pointer`}>
            <div className="w-10 h-10 rounded-full !bg-[#111827] flex items-center justify-center !text-white font-bold text-lg flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'S'}
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[15px] font-semibold !text-gray-900 truncate">{user?.name || 'Super Admin'}</span>
                <span className="text-[12px] !text-gray-500 lowercase truncate">{user?.role || 'superadmin'}</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ========================================== */}
      {/*             MOBILE SIDEBAR                 */}
      {/* ========================================== */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen?.(false)}
              className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 z-[70] w-72 bg-white shadow-2xl flex flex-col"
            >
              {/* Mobile Header */}
              <div className="h-24 border-b border-gray-100 flex justify-between items-center px-6 shrink-0">
                <div className="relative h-10 w-32">
                  <Image src={logo} alt="Logo" fill className="object-contain" unoptimized />
                </div>
                <button
                  onClick={() => setSidebarOpen?.(false)}
                  className="p-2 !text-gray-500 hover:!text-gray-900 !bg-gray-50 hover:!bg-gray-100 rounded-xl transition-all !border-none !shadow-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen?.(false)}
                      className={`
                        relative flex items-center px-4 py-3.5 gap-3.5 rounded-xl transition-all border-[1.5px] !no-underline
                        ${isActive
                          ? '!bg-[#1abc60] !text-white !border-black shadow-sm'
                          : '!bg-transparent !text-[#1abc60] !border-transparent hover:!bg-gray-50'
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? '!text-white' : '!text-slate-500'}`} strokeWidth={2.5} />
                      <span className="text-[15px] flex-1 font-medium">{item.label}</span>
                      
                      {/* White Dot Indicator */}
                      {isActive && (
                        <div className="w-[5px] h-[5px] rounded-full !bg-white absolute right-4"></div>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Footer */}
              <div className="p-4 shrink-0 border-t border-gray-100 mb-2">
                <div className="flex items-center gap-3 p-2 rounded-xl">
                  <div className="w-10 h-10 rounded-full !bg-[#111827] flex items-center justify-center !text-white font-bold text-lg flex-shrink-0">
                    {user?.name?.[0]?.toUpperCase() || 'S'}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[15px] font-semibold !text-gray-900 truncate">{user?.name || 'Super Admin'}</span>
                    <span className="text-[12px] !text-gray-500 lowercase truncate">{user?.role || 'superadmin'}</span>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}