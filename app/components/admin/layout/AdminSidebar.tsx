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
  Shield,
  Database,
  X,
  ChevronDown,
  Square,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/app/services/api';

const baseMenuItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'view_dashboard' },
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
  { href: '/admin/settings', label: 'Settings', icon: Settings, permission: 'manage_settings' },
];

const superadminMenuItems: any[] = [];

interface AdminSidebarProps {
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

export default function AdminSidebar({ sidebarOpen = false, setSidebarOpen }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [venueMenuOpen, setVenueMenuOpen] = useState(true);
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

  const menuItems = (isSuperadmin ? [...baseMenuItems, ...superadminMenuItems] : baseMenuItems)
     .filter(item => {
       // If superadmin, show everything
       if (isSuperadmin) return true;
       
       // Check if user has permission for this item
       const userPermissions = user?.permissions || [];
       if (item.permission && !userPermissions.includes(item.permission) && !userPermissions.includes('all')) {
         return false;
       }
       
       return true;
     })
     .map(item => {
       // Filter children based on permissions if they exist
       if (item.children) {
         return {
           ...item,
           children: item.children.filter((child: any) => {
             if (isSuperadmin) return true;
             const userPermissions = user?.permissions || [];
             if (child.permission && !userPermissions.includes(child.permission) && !userPermissions.includes('all')) {
               return false;
             }
             return true;
           })
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
            const hasChildren = Array.isArray((item as any).children) && (item as any).children.length > 0;
            
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
                    {(item as any).children.map((child: any) => {
                      const childActive = pathname === child.href || pathname.startsWith(`${child.href}/`);
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
</toolcall_result>
