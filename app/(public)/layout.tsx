"use client";

import { Suspense } from 'react';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';
import { usePathname } from 'next/navigation';
import { useScrollRestoration } from '@/app/hooks/useScrollRestoration';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useScrollRestoration();
  const pathname = usePathname() || "";
  const hideNavbarFooter = ['/login', '/Signup', '/ForgotPassword', '/ResetPassword'].some(path => 
    pathname.startsWith(path)
  );
// kehfn;oiwhef;/ih;fuiph
  return (
    <div className="flex flex-col min-h-screen">
      {!hideNavbarFooter && (
        <Suspense fallback={<div className="min-h-[80px]" />}>
          <Navbar />
        </Suspense>
      )}
      <main className="flex-grow">{children}</main>
      {!hideNavbarFooter && (
        <Suspense fallback={<div className="min-h-[200px]" />}>
          <Footer />
        </Suspense>
      )}
    </div>
  );
}