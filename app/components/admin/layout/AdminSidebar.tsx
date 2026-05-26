'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import type { ComponentType } from 'react';
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Settings,
  Shield,
  Database,
  X,
  ChevronDown,
  Square,
  Trophy,
  Calendar,
  Star,
  MessageSquare,
  CreditCard,
  QrCode,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/app/services/api';

type MenuChild = {
  href: string;
  label: string;
  permission: string;
};

type MenuItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  permission: string;
  children?: MenuChild[];
};

const baseMenuItems: MenuItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'view_dashboard' },
  { href: '/admin/bookings', label: 'Bookings', icon: Calendar, permission: 'view_bookings' },
  { href: '/admin/reviews', label: 'Reviews', icon: Star, permission: 'view_reviews' },
  {
    href: '/admin/venues',
    label: 'Venues',
    icon: FolderOpen,
    permission: 'view_venues',
    children: [
      { href: '/admin/venues/list', label: 'List Venues', permission: 'view_venues' },
      { href: '/admin/venues/add', label: 'Add Venue', permission: 'add_venue' },
    ],
  },
  { href: '/admin/users', label: 'Users', icon: Users, permission: 'manage_users' },
  { href: '/admin/user-access-matrix', label: 'Access Matrix', icon: Shield, permission: 'manage_permissions' },
  { href: '/admin/roles', label: 'Roles', icon: Shield, permission: 'manage_roles' },
  { href: '/admin/permissions', label: 'Permissions', icon: Shield, permission: 'manage_permissions' },
  { href: '/admin/masters', label: 'Masters', icon: Database, permission: 'manage_masters' },
  {
    href: '/admin/tournaments',
    label: 'Tournaments',
    icon: Trophy,
    permission: 'manage_tournaments',
    children: [
      { href: '/admin/tournaments', label: 'List Tournaments', permission: 'manage_tournaments' },
      { href: '/admin/tournaments/add', label: 'Add Tournament', permission: 'manage_tournaments' },
      { href: '/admin/tournaments/registrations', label: 'Tournament Registration', permission: 'manage_tournaments' },
    ],
  },
  { href: '/admin/chat', label: 'Chat', icon: MessageSquare, permission: 'view_chat' },
  { href: '/admin/billing', label: 'Billing', icon: CreditCard, permission: 'view_billing' },
  { href: '/admin/payment-settings', label: 'QR Settings', icon: QrCode, permission: 'manage_payment_settings' },
  { href: '/admin/settings', label: 'Settings', icon: Settings, permission: 'manage_settings' },
  { href: '/admin/venue-leads', label: 'Venue Leads', icon: Users, permission: 'superadmin_only' },
];

const superadminMenuItems: MenuItem[] = [
  { href: '/admin/admin-accounts', label: 'Admin Accounts', icon: Shield, permission: 'superadmin_only' },
];

interface AdminSidebarProps {
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

export default function AdminSidebar({ sidebarOpen = false, setSidebarOpen }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [venueMenuOpen, setVenueMenuOpen] = useState(true);
  const { isSuperadmin, isAuthenticated, user, hasPermission } = useAuth();
  const [logo, setLogo] = useState<string>('/mainlogo.png');

  useEffect(() => {
    const fetchSettings = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await api.get('/settings');
        if (res.data.success && res.data.settings.backendLogo) {
          const backendLogo = res.data.settings.backendLogo;
          const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || '';
          
          if (backendLogo.startsWith('http')) {
            setLogo(backendLogo);
          } else if (backendLogo.startsWith('/uploads') || backendLogo.startsWith('uploads')) {
            const path = backendLogo.startsWith('/') ? backendLogo : `/${backendLogo}`;
            setLogo(`${baseUrl}${path}`);
          } else {
            // Keep as is for local public assets
            setLogo(backendLogo);
          }
        }
      } catch (error) {
        // Silent error
      }
    };
    fetchSettings();
  }, [isAuthenticated]);

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5001';
    return `${baseUrl}${path}`;
  };

  const canAccess = (permission: string) => {
    if (permission === 'superadmin_only') return isSuperadmin;
    return isSuperadmin || hasPermission(permission);
  };

  const menuItems = (isSuperadmin ? [...baseMenuItems, ...superadminMenuItems] : baseMenuItems)
      .filter(item => {
        // Hide QR Settings for Super Admin
        if (item.href === '/admin/payment-settings' && isSuperadmin) {
          return false;
        }
        
        // Ensure QR Settings shows for Admins
        if (item.href === '/admin/payment-settings' && !isSuperadmin) {
          return true; // We want to force show this for admins
        }

        if (item.href === '/admin/bookings') {
          return canAccess('view_bookings') || canAccess('manage_bookings');
        }
        return canAccess(item.permission);
      })
      .map(item => {
        // Filter children based on permissions if they exist
        if (item.children) {
          return {
            ...item,
            children: item.children.filter((child) => canAccess(child.permission))
          };
        }
        return item;
      });

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
        <div className="h-24 flex items-center justify-center px-4 shrink-0 relative border-b border-gray-200 bg-white">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`!bg-transparent !border-none !shadow-none !p-0 relative flex items-center justify-center transition-all duration-300 cursor-pointer focus:outline-none group ${collapsed ? 'w-12 h-12' : 'w-36 h-12 hover:scale-105'}`}
            title={collapsed ? "Expand Menu" : "Collapse Menu"}
          >
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
              // Collapsed state mein favicon
              <Image 
                src="/favicon.ico" 
                alt="Favicon" 
                fill 
                sizes="32px"
                className="object-contain" 
                priority
                unoptimized
              />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const hasChildren = Array.isArray(item.children) && item.children.length > 0;
            
            return (
              <div key={item.href}>
                {hasChildren ? (
                  <button
                    onClick={() => setVenueMenuOpen((prev) => !prev)}
                    className={`
                      relative flex w-full items-center rounded-xl transition-all duration-200 group border-[1.5px] !no-underline
                      ${collapsed ? 'justify-center p-3' : 'px-4 py-3.5 gap-3.5'}
                      ${isActive
                        ? '!bg-[#1abc60] !text-white !border-black shadow-sm'
                        : '!bg-transparent !text-[#1abc60] !border-transparent hover:!bg-gray-50'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? '!text-white' : '!text-[#1abc60]'}`} strokeWidth={2.5} />
                    {!collapsed && <span className="text-[15px] flex-1 text-left font-medium">{item.label}</span>}
                    {!collapsed && (
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${venueMenuOpen ? 'rotate-180' : ''} ${isActive ? '!text-white' : '!text-[#1abc60]'}`}
                      />
                    )}
                  </button>
                ) : (
                  <Link
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
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? '!text-white' : '!text-[#1abc60]'}`} strokeWidth={2.5} />
                    {!collapsed && <span className="text-[15px] flex-1 font-medium">{item.label}</span>}
                    {!collapsed && isActive && (
                      <div className="w-[5px] h-[5px] rounded-full !bg-white absolute right-4"></div>
                    )}
                  </Link>
                )}
                {hasChildren && venueMenuOpen && !collapsed && (
                  <div className="mt-1 ml-4 space-y-1 border-l border-gray-200 pl-4">
                    {item.children?.map((child) => {
                      // FIXED LOGIC: Stricter checking to prevent both sub-menus from highlighting
                      const isExactMatch = pathname === child.href;
                      const isSubPathMatch = pathname.startsWith(`${child.href}/`);
                      const hasBetterMatch = item.children?.some((c) => 
                        c.href !== child.href && 
                        (pathname === c.href || pathname.startsWith(`${c.href}/`)) && 
                        c.href.length > child.href.length
                      ) || false;
                      const childActive = isExactMatch || (isSubPathMatch && !hasBetterMatch);

                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm !no-underline ${
                            childActive ? 'bg-[#e8f8ef] text-[#1abc60] font-semibold' : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <Square className={`h-3 w-3 ${childActive ? 'fill-[#1abc60] text-[#1abc60]' : 'text-gray-400'}`} />
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        
        {/* User Profile Footer */}
        <div className="p-4 shrink-0 border-t border-gray-200 mt-auto bg-white">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} p-2 rounded-xl hover:bg-gray-50 transition-all cursor-pointer`}>
            <div className="w-10 h-10 rounded-full !bg-[#111827] flex items-center justify-center !text-white font-bold text-lg flex-shrink-0 overflow-hidden border border-gray-100">
              {user?.profilePhoto ? (
                <img src={getImageUrl(user.profilePhoto)} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.[0]?.toUpperCase() || 'S'
              )}
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
              <div className="h-24 border-b border-gray-200 flex justify-between items-center px-6 shrink-0 bg-white">
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
              <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto bg-white">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const hasChildren = Array.isArray(item.children) && item.children.length > 0;
                  
                  return (
                    <div key={item.href}>
                      {hasChildren ? (
                        <button
                          onClick={() => setVenueMenuOpen((prev) => !prev)}
                          className={`
                            relative flex w-full items-center px-4 py-3.5 gap-3.5 rounded-xl transition-all border-[1.5px] !no-underline
                            ${isActive
                              ? '!bg-[#1abc60] !text-white !border-black shadow-sm'
                              : '!bg-transparent !text-[#1abc60] !border-transparent hover:!bg-gray-50'
                            }
                          `}
                        >
                          <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? '!text-white' : '!text-[#1abc60]'}`} strokeWidth={2.5} />
                          <span className="text-[15px] flex-1 text-left font-medium">{item.label}</span>
                          <ChevronDown className={`h-4 w-4 transition-transform ${venueMenuOpen ? 'rotate-180' : ''} ${isActive ? '!text-white' : '!text-[#1abc60]'}`} />
                        </button>
                      ) : (
                        <Link
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
                          <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? '!text-white' : '!text-[#1abc60]'}`} strokeWidth={2.5} />
                          <span className="text-[15px] flex-1 font-medium">{item.label}</span>
                          {isActive && (
                            <div className="w-[5px] h-[5px] rounded-full !bg-white absolute right-4"></div>
                          )}
                        </Link>
                      )}
                      {hasChildren && venueMenuOpen && (
                        <div className="mt-1 ml-4 space-y-1 border-l border-gray-200 pl-4">
                          {item.children?.map((child) => {
                            // FIXED LOGIC FOR MOBILE TOO
                            const isExactMatch = pathname === child.href;
                            const isSubPathMatch = pathname.startsWith(`${child.href}/`);
                            const hasBetterMatch = item.children?.some((c) => 
                              c.href !== child.href && 
                              (pathname === c.href || pathname.startsWith(`${c.href}/`)) && 
                              c.href.length > child.href.length
                            ) || false;
                            const childActive = isExactMatch || (isSubPathMatch && !hasBetterMatch);

                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={() => setSidebarOpen?.(false)}
                                className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm !no-underline ${
                                  childActive ? 'bg-[#e8f8ef] text-[#1abc60] font-semibold' : 'text-gray-600 hover:bg-gray-50'
                                }`}
                              >
                                <Square className={`h-3 w-3 ${childActive ? 'fill-[#1abc60] text-[#1abc60]' : 'text-gray-400'}`} />
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>

              {/* Mobile Footer */}
              <div className="p-4 shrink-0 border-t border-gray-200 mt-auto bg-white">
                <div className="flex items-center gap-3 p-2 rounded-xl">
                  <div className="w-10 h-10 rounded-full !bg-[#111827] flex items-center justify-center !text-white font-bold text-lg flex-shrink-0 overflow-hidden border border-gray-100">
                    {user?.profilePhoto ? (
                      <img src={getImageUrl(user.profilePhoto)} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.[0]?.toUpperCase() || 'S'
                    )}
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
