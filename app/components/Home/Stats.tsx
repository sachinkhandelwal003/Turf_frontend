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
    <section className="bg-white py-16">
      <div className="max-w-[1000px] mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {statsData.map((stat, i) => (
            <div key={i} className="flex flex-col items-center justify-center gap-1.5">
              <span className="text-4xl md:text-[42px] font-bold text-[#1abc60] leading-none">
                {stat.value}
              </span>
              <span className="text-[12px] md:text-[14px] font-bold text-gray-700 uppercase tracking-[0.15em]">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}