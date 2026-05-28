'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin' | 'superadmin';
  permissions: string[];
  profilePhoto?: string;
  coverPhoto?: string;
  coins?: number;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isSuperadmin: boolean;
  hasPermission: (permission: string) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        }
      });

      const data = await response.json();
      if (data.success && data.user) {
        const userData: User = {
          id: data.user.id || data.user._id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          role: data.user.role,
          permissions: data.user.permissions || [],
          profilePhoto: data.user.profilePhoto,
          coverPhoto: data.user.coverPhoto,
          coins: data.user.coins || 0,
          createdAt: data.user.createdAt
        };
        setUser(userData);
        localStorage.setItem('adminUser', JSON.stringify(userData));
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  useEffect(() => {
    // Check if user is logged in (only on client side)
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('adminUser');
      const token = localStorage.getItem('token');
      if (storedUser && token) {
        try {
          setUser(JSON.parse(storedUser));
          // Always refresh from server to get latest photos/data
          refreshUser();
        } catch (error) {
          localStorage.removeItem('adminUser');
          localStorage.removeItem('token');
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.msg || data.message || 'Invalid credentials');
      }

      const userData: User = {
        id: data.user.id || data.user._id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        role: data.user.role,
        permissions: data.user.permissions || [],
        profilePhoto: data.user.profilePhoto,
        coverPhoto: data.user.coverPhoto,
        coins: data.user.coins || 0,
        createdAt: data.user.createdAt
      };

      setUser(userData);
      localStorage.setItem('adminUser', JSON.stringify(userData));
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      return userData;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      
      if (token) {
        // Optional: Call backend to notify about logout
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
          }
        });
      }
    } catch (error) {
      console.error("Logout API Error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem('adminUser');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  };

  const hasPermission = (permission: string) => {
    if (!user) return false;
    if (user.role === 'superadmin') return true;
    return user.permissions.includes(permission) || user.permissions.includes('all');
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    isSuperadmin: user?.role === 'superadmin',
    hasPermission,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
