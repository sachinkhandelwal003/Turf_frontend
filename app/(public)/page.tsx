import Hero from '@/app/components/Home/Hero';
import Stats from '@/app/components/Home/Stats';
import PreferredVenues from '@/app/components/Home/PreferredVenues';
import PopularSports from '@/app/components/Home/PopularSports';
import Tournament from '@/app/components/Home/Tournament';
import HowItWorks from '@/app/components/Home/HowsitWork';
// import BlogSection from '@/app/components/Home/BlogSection';
// import PartnerCTA from '@/app/components/Home/PartnerCTA';

export default function Home() {
  return (
    <main className="bg-gray-50 min-h-screen font-sans pb-20 pt-[80px]">
      
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