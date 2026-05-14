"use client";

import { useChat } from "@/app/context/ChatContext";
import ConversationList from "./ConversationList";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useState, useEffect } from "react";
import { Plus, Menu, ChevronLeft, MessageSquare, Search, X } from "lucide-react";
import { getAllAdmins } from "@/app/services/chat.service";
import { User } from "@/app/types/chat.types";
import { useAuth } from "@/app/context/AuthContext";

export default function ChatLayout({ userId }: { userId: string }) {
  const { user: currentUser } = useAuth();
  const {
    conversations,
    messages,
    selectedConversation,
    setSelectedConversation,
    startConversationWithAdmin,
    startConversationWithSuperAdmin,
    isLoading
  } = useChat();

  const [filter, setFilter] = useState<string>("all");
  const [showAdminList, setShowAdminList] = useState(false);
  const [admins, setAdmins] = useState<User[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (selectedConversation && typeof window !== 'undefined' && window.innerWidth < 768) {
      setShowSidebar(false);
    }
  }, [selectedConversation]);

  useEffect(() => {
    if ((currentUser?.role === 'superadmin' || currentUser?.role === 'admin') && showAdminList) {
      const fetchAdmins = async () => {
        const data = await getAllAdmins();
        // If current user is admin, only show superadmins in the list
        if (currentUser?.role === 'admin') {
          const superAdmins = data.admins?.filter((a: User) => a.role === 'superadmin') || [];
          setAdmins(superAdmins);
        } else {
          setAdmins(data.admins || []);
        }
      };
      fetchAdmins();
    }
  }, [currentUser, showAdminList]);

  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = conv.participants?.find(p => p._id !== userId);

    // Admin restriction: only show chats with superadmins
    if (currentUser?.role === 'admin') {
      // Ensure the other participant is a superadmin or the conversation type is superadmin_admin
      const isSuperAdminChat = otherParticipant?.role === 'superadmin' || conv.type === 'superadmin_admin';
      if (!isSuperAdminChat) {
        return false;
      }
    }

    // Role-based filters for superadmin
    if (currentUser?.role === 'superadmin') {
      if (filter === 'only_admins' && otherParticipant?.role !== 'admin') return false;
      if (filter === 'only_users' && otherParticipant?.role !== 'user') return false;
    }

    const matchesFilter = filter === "all" || 
      (filter !== 'only_admins' && filter !== 'only_users' && conv.type === filter);
    
    const matchesSearch = !searchQuery || 
      otherParticipant?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase());

    return (matchesFilter || (currentUser?.role === 'superadmin' && (filter === 'only_admins' || filter === 'only_users'))) && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="!flex !items-center !justify-center !h-full !w-full !bg-white !rounded-[24px] !border !border-gray-200">
        <div className="!animate-spin !rounded-full !h-12 !w-12 !border-b-2 !border-[#1abc60]"></div>
      </div>
    );
  }

  return (
    <div className="!flex !h-full !w-full !bg-white !overflow-hidden !relative !rounded-[24px] !border !border-gray-200 !shadow-sm !flex-col md:!flex-row !font-sans">
      
      {/* ========================================== */}
      {/* LEFT SIDEBAR - Contacts List               */}
      {/* ========================================== */}
      <div className={`${showSidebar ? '!flex' : '!hidden'} md:!flex !flex-col !w-full md:!w-[340px] lg:!w-[380px] !border-r !border-gray-100 !bg-white !shrink-0 !h-full`}>
        
        {/* Sidebar Header */}
        <div className="!h-[76px] !px-5 !border-b !border-gray-100 !flex !items-center !justify-between !bg-white !shrink-0">
          <h2 className="!font-black !text-xl !text-gray-900 !m-0 !tracking-tight">Messages</h2>
          {(currentUser?.role === 'superadmin' || currentUser?.role === 'admin') && (
            <button 
              onClick={() => setShowAdminList(true)}
              className="!w-10 !h-10 !bg-[#1abc60] !text-white !rounded-xl !flex !items-center !justify-center hover:!bg-[#17a554] !transition-colors !border-none !cursor-pointer !shadow-sm"
              title={currentUser?.role === 'superadmin' ? "New Chat with Admin" : "New Chat with Super Admin"}
            >
              <Plus className="!w-5 !h-5 !block" />
            </button>
          )}
        </div>

        {/* Search & Filter */}
        <div className="!p-4 !space-y-3 !border-b !border-gray-100 !bg-gray-50/50 !shrink-0">
          <div className="!relative !group">
            <Search className="!absolute !left-3.5 !top-1/2 !-translate-y-1/2 !w-4 !h-4 !text-gray-400 group-focus-within:!text-[#1abc60] !transition-colors" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="!w-full !pl-10 !pr-4 !py-3 !bg-white !border !border-gray-200 !rounded-xl !text-sm !font-medium focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !outline-none !transition-all placeholder:!text-gray-400"
            />
          </div>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="!w-full !px-4 !py-3 !bg-white !border !border-gray-200 !rounded-xl !text-sm !font-bold !text-gray-700 focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !appearance-none !cursor-pointer !transition-all"
          >
            <option value="all">All Chats</option>
            {currentUser?.role === 'superadmin' && (
              <>
                <option value="only_admins">Only Admins</option>
                <option value="only_users">Only Users</option>
              </>
            )}
          </select>
        </div>

        {/* Conversation List */}
        <div className="!flex-1 !overflow-y-auto !custom-scrollbar">
          {filteredConversations.length === 0 && currentUser?.role === 'admin' ? (
            <div className="!p-8 !text-center !flex !flex-col !items-center !justify-center !h-full">
              <p className="!text-sm !font-bold !text-gray-400 !mb-4">No conversations found</p>
              <button
                onClick={() => startConversationWithSuperAdmin()}
                className="!w-full !py-3 !px-4 !bg-[#1abc60] !text-white !rounded-xl !text-sm !font-bold hover:!bg-[#17a554] !transition-colors !flex !items-center !justify-center !gap-2 !shadow-sm !border-none !cursor-pointer"
              >
                <MessageSquare className="!w-4 !h-4" />
                Chat with Super Admin
              </button>
            </div>
          ) : (
            <ConversationList
              conversations={filteredConversations}
              onSelect={setSelectedConversation}
              selectedId={selectedConversation?._id}
              currentUserId={userId}
              currentUserRole={currentUser?.role}
            />
          )}
        </div>
      </div>

      {/* ========================================== */}
      {/* RIGHT CHAT AREA                            */}
      {/* ========================================== */}
      <div className={`${!showSidebar ? '!flex' : '!hidden'} md:!flex !flex-col !flex-1 !min-w-0 !bg-[#efeae2] !relative`}>
        {selectedConversation ? (
          <>
            {/* Active Chat Header */}
            <div className="!h-[76px] !px-4 md:!px-6 !border-b !border-gray-200 !bg-white !flex !items-center !gap-3 md:!gap-4 !shadow-sm !shrink-0 !relative !z-10">
              <button 
                onClick={() => setShowSidebar(true)}
                className="md:!hidden !p-2 hover:!bg-gray-100 !rounded-full !text-gray-600 !transition-colors !border-none !bg-transparent !cursor-pointer"
              >
                <ChevronLeft className="!w-6 !h-6 !block" />
              </button>
              
              <div className="!w-11 !h-11 !rounded-full !bg-emerald-50 !flex !items-center !justify-center !text-[#1abc60] !font-bold !text-lg !shrink-0 !border !border-emerald-100">
                {selectedConversation.participants.find(p => p._id !== userId)?.name?.[0] || "C"}
              </div>
              
              <div className="!min-w-0 !flex-1">
                <h2 className="!text-base md:!text-lg !font-bold !text-gray-900 !truncate !m-0 !leading-tight">
                  {currentUser?.role === 'admin' && selectedConversation.type === 'superadmin_admin' 
                    ? "Backend Contact" 
                    : (selectedConversation.participants.find(p => p._id !== userId)?.name || "Chat")}
                </h2>
                <div className="!flex !items-center !gap-2 !mt-1">
                  {currentUser?.role === 'superadmin' && (
                    <span className="!text-[9px] !font-black !text-[#1abc60] !bg-emerald-50 !border !border-emerald-200 !px-1.5 !py-0.5 !rounded-md !uppercase !tracking-wider">
                      {selectedConversation.participants.find(p => p._id !== userId)?.role || "User"}
                    </span>
                  )}
                  <span className="!text-[10px] !font-semibold !text-gray-500 !bg-gray-100 !px-2 !py-0.5 !rounded-md !capitalize">
                    {selectedConversation.type === 'superadmin_admin' && currentUser?.role === 'admin' 
                      ? "System Support" 
                      : selectedConversation.type.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Messages Area */}
            <div className="!flex-1 !overflow-hidden !flex !flex-col">
              <MessageList
                messages={messages}
                currentUserId={userId}
              />
            </div>

            {/* Input Area */}
            <div className="!shrink-0">
              <MessageInput />
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="!flex-1 !flex !items-center !justify-center !text-center !p-8 !bg-[#f8fafc]">
            <div className="!max-w-sm !bg-white !p-10 !rounded-[32px] !shadow-sm !border !border-gray-200">
              <div className="!w-20 !h-20 !bg-emerald-50 !rounded-[24px] !flex !items-center !justify-center !mx-auto !mb-6 !border !border-emerald-100">
                <MessageSquare className="!w-10 !h-10 !text-[#1abc60]" />
              </div>
              <h3 className="!text-2xl !font-black !text-gray-900 !mb-2 !m-0 !tracking-tight">Your Messages</h3>
              <p className="!text-sm !font-medium !text-gray-500 !mb-8 !m-0 !leading-relaxed">Select a conversation from the sidebar to start chatting or create a new one.</p>
              
              {currentUser?.role === 'admin' && conversations.length === 0 && (
                <button 
                  onClick={() => startConversationWithSuperAdmin()}
                  className="!w-full !py-3.5 !px-6 !bg-[#1abc60] !text-white !rounded-xl !text-sm !font-bold hover:!bg-[#17a554] !transition-all !shadow-md !shadow-green-100 !flex !items-center !justify-center !gap-2 !border-none !cursor-pointer"
                >
                  <MessageSquare className="!w-4 !h-4" />
                  Chat with Super Admin
                </button>
              )}
              <button 
                onClick={() => setShowSidebar(true)}
                className="!mt-4 md:!hidden !w-full !py-3.5 !px-6 !bg-gray-900 !text-white !rounded-xl !text-sm !font-bold hover:!bg-gray-800 !transition-all !border-none !cursor-pointer"
              >
                View Conversations
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* MODAL - Select Admin                       */}
      {/* ========================================== */}
      {showAdminList && (
        <div className="!fixed !inset-0 !bg-gray-900/60 !backdrop-blur-sm !flex !items-center !justify-center !z-[9999] !p-4">
          <div className="!bg-white !rounded-[24px] !shadow-2xl !w-full !max-w-md !overflow-hidden !flex !flex-col !max-h-[80vh] !animate-in !fade-in !zoom-in-95 !duration-200">
            
            <div className="!px-6 !py-5 !border-b !border-gray-100 !flex !items-center !justify-between !bg-white !shrink-0">
              <h3 className="!text-xl !font-bold !text-gray-900 !m-0 !tracking-tight">
                {currentUser?.role === 'superadmin' ? "Select an Admin" : "Select Super Admin"}
              </h3>
              <button 
                onClick={() => setShowAdminList(false)} 
                className="!p-2 !bg-gray-50 hover:!bg-gray-100 !text-gray-400 hover:!text-gray-900 !rounded-full !transition-colors !border-none !cursor-pointer"
              >
                <X className="!w-5 !h-5 !block" />
              </button>
            </div>

            <div className="!flex-1 !overflow-y-auto !custom-scrollbar !p-4 !space-y-2 !bg-gray-50/30">
              {admins.length === 0 ? (
                <div className="!p-10 !text-center">
                  <p className="!text-sm !font-bold !text-gray-400 !m-0">No admins found</p>
                </div>
              ) : (
                admins.map(admin => (
                  <button
                    key={admin._id}
                    onClick={() => {
                      startConversationWithAdmin(admin._id);
                      setShowAdminList(false);
                    }}
                    className="!w-full !p-4 !flex !items-center !gap-4 !bg-white !border !border-gray-200 hover:!border-[#1abc60]/50 hover:!shadow-sm !rounded-xl !transition-all !text-left !cursor-pointer"
                  >
                    <div className="!w-12 !h-12 !rounded-full !bg-emerald-50 !flex !items-center !justify-center !font-bold !text-[#1abc60] !overflow-hidden !shrink-0 !border !border-emerald-100 !text-lg">
                      {admin.profilePhoto ? (
                        <img src={admin.profilePhoto} alt="" className="!w-full !h-full !object-cover" />
                      ) : (
                        admin.name?.[0]?.toUpperCase() || "?"
                      )}
                    </div>
                    <div className="!flex-1 !min-w-0">
                      <p className="!font-bold !text-gray-900 !text-base !m-0 !truncate">{admin.name || "Admin"}</p>
                      <p className="!text-[11px] !font-bold !text-[#1abc60] !uppercase !tracking-wider !mt-1 !m-0">{admin.role}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}