"use client";

import dynamic from "next/dynamic";
const FloatingChat = dynamic(() => import("./FloatingChat"), { ssr: false });
import { PublicChatProvider } from "./PublicChatProvider";
import { useAuth } from "@/app/context/AuthContext";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function FloatingChatWrapper() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Don't show on admin routes or partner terms page
  const isExcludedRoute = pathname?.startsWith('/admin') || pathname === '/partner-terms';

  if (isExcludedRoute) return null;
  
  // Show chat for all authenticated users
  if (!isAuthenticated) return null;

  return (
    <PublicChatProvider>
      <FloatingChat />
    </PublicChatProvider>
  );
}