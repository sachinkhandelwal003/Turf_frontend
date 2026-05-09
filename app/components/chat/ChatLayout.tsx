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
    isLoading
  } = useChat();

  const [filter, setFilter] = useState<string>("all");
  const [showAdminList, setShowAdminList] = useState(false);
  const [admins, setAdmins] = useState<User[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Auto-hide sidebar on small screens when a conversation is selected
  useEffect(() => {
    if (selectedConversation && typeof window !== 'undefined' && window.innerWidth < 768) {
      setShowSidebar(false);
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (currentUser?.role === 'superadmin' && showAdminList) {
      const fetchAdmins = async () => {
        const data = await getAllAdmins();
        setAdmins(data.admins || []);
      };
      fetchAdmins();
    }
  }, [currentUser, showAdminList]);

  const filteredConversations = conversations.filter(conv => {
    const matchesFilter = filter === "all" || conv.type === filter;
    
    const otherParticipant = conv.participants?.find(p => p._id !== userId);
    const matchesSearch = !searchQuery || 
      otherParticipant?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white overflow-hidden relative rounded-xl border border-gray-100 shadow-sm flex-col md:flex-row">
      {/* Sidebar - Conversations */}
      <div className={`${showSidebar ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-80 border-r border-gray-100 bg-white shrink-0 h-full`}>
        <div className="h-[73px] px-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
          <h2 className="font-bold text-lg text-gray-800">Messages</h2>
          {currentUser?.role === 'superadmin' && (
            <button 
              onClick={() => setShowAdminList(true)}
              className="p-2 !bg-transparent hover:!bg-gray-100 rounded-lg !text-primary transition-colors border border-gray-200 !shadow-none"
              title="New Chat with Admin"
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
              className="w-full pl-9 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
          >
            <option value="all">All Chats</option>
            <option value="user_support">User Support</option>
            <option value="user_superadmin">User to SuperAdmin</option>
            <option value="admin_internal">Internal Admin</option>
            <option value="superadmin_admin">SuperAdmin to Admin</option>
          </select>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ConversationList
            conversations={filteredConversations}
            onSelect={setSelectedConversation}
            selectedId={selectedConversation?._id}
            currentUserId={userId}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`${!showSidebar ? 'flex' : 'hidden'} md:flex flex-col flex-1 min-w-0 bg-gray-50/50`}>
        {selectedConversation ? (
          <>
            <div className="h-[73px] px-4 border-b border-gray-100 bg-white flex items-center gap-3 shadow-sm shrink-0">
              <button 
                onClick={() => setShowSidebar(true)}
                className="md:hidden p-1 !bg-transparent hover:!bg-gray-100 rounded-lg !text-gray-600 !shadow-none"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                {selectedConversation.participants.find(p => p._id !== userId)?.name?.[0] || "C"}
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-gray-900 truncate">
                  {selectedConversation.participants.find(p => p._id !== userId)?.name || "Chat"}
                </h2>
                <p className="text-[10px] text-gray-500 capitalize">
                  {selectedConversation.type.replace(/_/g, " ")}
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
              <p className="text-sm text-gray-500 mt-1">Select a conversation from the list to start chatting with users or other admins.</p>
              <button 
                onClick={() => setShowSidebar(true)}
                className="mt-6 md:hidden px-6 py-2 bg-primary text-white rounded-lg font-medium"
              >
                View Conversations
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Admin List Modal */}
      {showAdminList && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b flex items-center justify-between bg-primary text-white">
              <h3 className="font-bold">Select an Admin</h3>
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
                      <p className="font-semibold text-sm">{admin.name}</p>
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
