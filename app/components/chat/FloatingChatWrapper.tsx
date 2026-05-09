"use client";

import FloatingChat from "./FloatingChat";
import { PublicChatProvider } from "./PublicChatProvider";
import { useAuth } from "@/app/context/AuthContext";

export default function FloatingChatWrapper() {
  return (
    <PublicChatProvider>
      <FloatingChat />
    </PublicChatProvider>
  );
}