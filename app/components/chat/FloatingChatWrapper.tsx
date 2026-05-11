"use client";

import FloatingChat from "./FloatingChat";
import { PublicChatProvider } from "./PublicChatProvider";
import { useAuth } from "@/app/context/AuthContext";
import { usePathname } from "next/navigation";

export default function FloatingChatWrapper() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  // Don't show on admin routes
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) return null;
  
  // Show chat for all authenticated users
  if (!isAuthenticated) return null;

  return (
    <PublicChatProvider>
      <FloatingChat />
    </PublicChatProvider>
  );
}