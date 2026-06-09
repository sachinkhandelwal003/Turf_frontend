import dynamic from 'next/dynamic';
import Hero from '@/app/components/Home/Hero';

const Stats = dynamic(() => import('@/app/components/Home/Stats'), { ssr: true });
const PreferredVenues = dynamic(() => import('@/app/components/Home/PreferredVenues'), { ssr: true });
const PopularSports = dynamic(() => import('@/app/components/Home/PopularSports'), { ssr: true });
const Tournament = dynamic(() => import('@/app/components/Home/Tournament'), { ssr: true });
const HowItWorks = dynamic(() => import('@/app/components/Home/HowsitWork'), { ssr: true });

export default function Home() {
  return (
    <main className="bg-gray-50 min-h-screen font-sans pb-8 pt-[80px]">
      
      {/* 1. Hero & Search Section */}
      <Hero />

      {/* 2. Platform Statistics */}
      <Stats />

      {/* 3. Top Rated Venues */}
      <PreferredVenues />

      {/* {/* 4. Browse by Sports */}
      <PopularSports />
 {/* 6. Latest News & Blogs */}
      <Tournament />
      {/* 5. Booking Process Steps */}
      <HowItWorks />

     

      {/* 7. Bottom Call to Action for Venue Owners */}
      {/* <PartnerCTA /> */} 

    </main>
  );
}