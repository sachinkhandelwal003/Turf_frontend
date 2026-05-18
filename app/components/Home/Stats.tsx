"use client";

import { useState, useEffect } from 'react';
import api from '@/app/services/api';

export default function Stats() {
  const [stats, setStats] = useState({
    grounds: 0,
    players: 0,
    cities: 0,
    bookings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/public-stats');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}k+`;
    }
    return `${num}+`;
  };

  const statsData = [
    { value: loading ? '...' : formatNumber(stats.grounds), label: 'GROUNDS' },
    { value: loading ? '...' : formatNumber(stats.players), label: 'PLAYERS' },
    { value: loading ? '...' : formatNumber(stats.cities), label: 'CITIES' },
    { value: loading ? '...' : formatNumber(stats.bookings), label: 'BOOKING' },
  ];

  return (
    <section className="bg-white py-10 md:py-16">
      <div className="max-w-[1000px] mx-auto px-4">
        {/* Mobile: Horizontal scroll or single line wrap, Desktop: Grid */}
        <div className="flex flex-row md:grid md:grid-cols-4 items-center justify-center md:justify-items-center gap-4 sm:gap-6 md:gap-8 text-center overflow-x-auto no-scrollbar md:overflow-visible py-2">
          {statsData.map((stat, i) => (
            <div key={i} className="flex flex-col items-center justify-center gap-1 md:gap-1.5 min-w-[80px] sm:min-w-[100px] flex-shrink-0">
              <span className="text-2xl sm:text-3xl md:text-[42px] font-bold text-[#1abc60] leading-none">
                {stat.value}
              </span>
              <span className="text-[10px] sm:text-[11px] md:text-[14px] font-bold text-gray-700 uppercase tracking-[0.1em] md:tracking-[0.15em] whitespace-nowrap">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}