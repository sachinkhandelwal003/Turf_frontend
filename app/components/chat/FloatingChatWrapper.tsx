"use client";

import FloatingChat from "./FloatingChat";
import { PublicChatProvider } from "./PublicChatProvider";
import { useAuth } from "@/app/context/AuthContext";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import api from "@/app/services/api";

export default function FloatingChatWrapper() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const [hasConfirmedBooking, setHasConfirmedBooking] = useState(false);

  // Don't show on admin routes
  const isAdminRoute = pathname?.startsWith('/admin');

  useEffect(() => {
    const checkBookings = async () => {
      if (isAuthenticated && user) {
        try {
          const res = await api.get('/bookings/my-bookings');
          if (res.data.success) {
            const confirmed = res.data.bookings.some((b: any) => 
              b.status === 'confirmed' || b.status === 'completed'
            );
            setHasConfirmedBooking(confirmed);
          }
        } catch (error) {
          console.error("Failed to check bookings for chat:", error);
        }
      } else {
        setHasConfirmedBooking(false);
      }
    };

    if (!isAdminRoute) {
      checkBookings();
    }
  }, [isAuthenticated, user, isAdminRoute]);

  if (isAdminRoute) return null;
  
  // Only show if user is authenticated and has at least one confirmed/completed booking
  if (!isAuthenticated || !hasConfirmedBooking) return null;

  return (
    <PublicChatProvider>
      <FloatingChat />
    </PublicChatProvider>
  );
}