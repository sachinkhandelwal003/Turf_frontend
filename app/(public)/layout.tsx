import { Suspense } from 'react';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<div className="min-h-[80px]" />}>
        <Navbar />
      </Suspense>
      <main className="min-h-screen">{children}</main>
      <Suspense fallback={<div className="min-h-[200px]" />}>
        <Footer />
      </Suspense>
    </>
  );
}