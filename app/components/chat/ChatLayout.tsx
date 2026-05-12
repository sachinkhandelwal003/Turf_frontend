"use client";

import { useChat } from "@/app/context/ChatContext";
import ConversationList from "./ConversationList";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useState, useEffect } from "react";
import { Plus, Menu, ChevronLeft, MessageSquare, Search } from "lucide-react";
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
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1abc60]"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white overflow-hidden relative rounded-xl border border-gray-100 shadow-sm flex-col md:flex-row">
      <div className={`${showSidebar ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-80 border-r border-gray-100 bg-white shrink-0 h-full`}>
        <div className="h-[73px] px-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
          <h2 className="font-bold text-lg text-gray-800">Messages</h2>
          {(currentUser?.role === 'superadmin' || currentUser?.role === 'admin') && (
            <button 
              onClick={() => setShowAdminList(true)}
              className="p-2 hover:bg-gray-100 rounded-lg text-[#1abc60] transition-colors border border-gray-200"
              title={currentUser?.role === 'superadmin' ? "New Chat with Admin" : "New Chat with Super Admin"}
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="p-3 border-b space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-[#1abc60]/20 outline-none"
            />
          </div>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1abc60] bg-white font-medium text-gray-700"
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
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 && currentUser?.role === 'admin' ? (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-500 mb-4">No conversations found</p>
              <button
                onClick={() => startConversationWithSuperAdmin()}
                className="w-full py-2 px-4 bg-[#1abc60] text-white rounded-lg text-sm font-medium hover:bg-[#16a351] transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
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

      <div className={`${!showSidebar ? 'flex' : 'hidden'} md:flex flex-col flex-1 min-w-0 bg-gray-50/50`}>
        {selectedConversation ? (
          <>
            <div className="h-[73px] px-4 border-b border-gray-100 bg-white flex items-center gap-3 shadow-sm shrink-0">
              <button 
                onClick={() => setShowSidebar(true)}
                className="md:hidden p-1 hover:bg-gray-100 rounded-lg text-gray-600"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <div className="w-10 h-10 rounded-full bg-[#1abc60]/10 flex items-center justify-center text-[#1abc60] font-bold shrink-0">
                {selectedConversation.participants.find(p => p._id !== userId)?.name?.[0] || "C"}
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-gray-900 truncate">
                  {currentUser?.role === 'admin' && selectedConversation.type === 'superadmin_admin' 
                    ? "Backend Contact" 
                    : (selectedConversation.participants.find(p => p._id !== userId)?.name || "Chat")}
                </h2>
                <p className="text-[10px] text-gray-500 capitalize flex items-center gap-1">
                  {currentUser?.role === 'superadmin' && (
                    <span className="font-bold text-[#1abc60] border border-[#1abc60]/20 px-1 rounded bg-[#1abc60]/5">
                      {selectedConversation.participants.find(p => p._id !== userId)?.role || "User"}
                    </span>
                  )}
                  <span>
                    {selectedConversation.type === 'superadmin_admin' && currentUser?.role === 'admin' 
                      ? "System Support" 
                      : selectedConversation.type.replace(/_/g, " ")}
                  </span>
                </p>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden flex flex-col">
              <MessageList
                messages={messages}
                currentUserId={userId}
              />
            </div>

            <div className="shrink-0">
              <MessageInput />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 p-8 text-center">
            <div className="max-w-xs">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-900">Your Messages</p>
              <p className="text-sm text-gray-500 mt-1">Select a conversation from the list to start chatting.</p>
              {currentUser?.role === 'admin' && conversations.length === 0 && (
                <button 
                  onClick={() => startConversationWithSuperAdmin()}
                  className="mt-6 px-6 py-2 bg-[#1abc60] text-white rounded-lg font-medium hover:bg-[#16a351] transition-colors"
                >
                  Chat with Super Admin
                </button>
              )}
              <button 
                onClick={() => setShowSidebar(true)}
                className="mt-6 md:hidden px-6 py-2 bg-[#1abc60] text-white rounded-lg font-medium"
              >
                View Conversations
              </button>
            </div>
          </div>
        )}
      </div>

      {showAdminList && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b flex items-center justify-between bg-[#1abc60] text-white">
              <h3 className="font-bold">
                {currentUser?.role === 'superadmin' ? "Select an Admin" : "Select a Super Admin"}
              </h3>
              <button onClick={() => setShowAdminList(false)} className="hover:bg-white/10 p-1 rounded-full">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {admins.length === 0 ? (
                <p className="p-8 text-center text-gray-500">No admins found</p>
              ) : (
                admins.map(admin => (
                  <button
                    key={admin._id}
                    onClick={() => {
                      startConversationWithAdmin(admin._id);
                      setShowAdminList(false);
                    }}
                    className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 overflow-hidden flex-shrink-0">
                      {admin.profilePhoto ? (
                        <img src={admin.profilePhoto} alt="" className="w-full h-full object-cover" />
                      ) : (
                        admin.name?.[0] || "?"
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{admin.name || "Admin"}</p>
                      <p className="text-xs text-gray-500 capitalize">{admin.role}</p>
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
