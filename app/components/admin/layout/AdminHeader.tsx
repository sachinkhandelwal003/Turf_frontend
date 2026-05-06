'use client';

import { useAuth } from '@/app/context/AuthContext';
import { Bell, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function AdminHeader() {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const pathname = usePathname();

  const pageNames: Record<string, string> = {
    '/admin/dashboard': 'Dashboard',
    '/admin/users': 'Users Management',
    '/admin/projects': 'Projects Management',
    '/admin/blogs': 'Blogs Management',
    '/admin/settings': 'Settings',
  };

  const currentPage = pageNames[pathname] || 'Dashboard';

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{currentPage}</h1>
            <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-700 hidden sm:inline">{user?.name}</span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}