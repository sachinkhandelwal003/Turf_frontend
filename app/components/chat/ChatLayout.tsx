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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1abc60]"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white overflow-hidden relative rounded-2xl border border-gray-100 shadow-xl flex-col md:flex-row">
      <div className={`${showSidebar ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-[340px] border-r border-gray-100 bg-white shrink-0 h-full`}>
        <div className="h-[73px] px-6 border-b border-gray-100 flex items-center justify-between bg-white">
          <h2 className="font-extrabold text-xl text-gray-900 tracking-tight">Messages</h2>
          {currentUser?.role === 'superadmin' && (
            <button 
              onClick={() => setShowAdminList(true)}
              className="p-2.5 bg-[#1abc60]/10 hover:bg-[#1abc60] text-[#1abc60] hover:text-white rounded-xl transition-all duration-300 border border-[#1abc60]/10"
              title="New Chat"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="p-4 border-b bg-gray-50/30 space-y-3">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1abc60] transition-colors" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-[#1abc60]/5 focus:border-[#1abc60]/30 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="flex-1 p-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 focus:outline-none focus:ring-4 focus:ring-[#1abc60]/5 focus:border-[#1abc60]/30 bg-white transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Channels</option>
              <option value="user_support">Support</option>
              <option value="user_superadmin">SuperAdmin</option>
              <option value="admin_internal">Internal</option>
              <option value="superadmin_admin">Management</option>
            </select>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <ConversationList
            conversations={filteredConversations}
            onSelect={setSelectedConversation}
            selectedId={selectedConversation?._id}
            currentUserId={userId}
          />
        </div>
      </div>

      <div className={`${!showSidebar ? 'flex' : 'hidden'} md:flex flex-col flex-1 min-w-0 bg-white`}>
        {selectedConversation ? (
          <>
            <div className="h-[73px] px-6 border-b border-gray-100 bg-white flex items-center justify-between shadow-sm shrink-0 z-10">
              <div className="flex items-center gap-3 min-w-0">
                <button 
                  onClick={() => setShowSidebar(true)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1abc60] to-[#16a34a] flex items-center justify-center text-white font-black shadow-lg shadow-[#1abc60]/20">
                    {selectedConversation.participants.find(p => p._id !== userId)?.name?.[0] || "C"}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-gray-900 truncate tracking-tight">
                    {selectedConversation.participants.find(p => p._id !== userId)?.name || "Chat"}
                  </h2>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {selectedConversation.type.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-400 transition-all">
                  <Search className="w-5 h-5" />
                </button>
                <button className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-400 transition-all">
                  <Menu className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden flex flex-col bg-gray-50/30">
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
          <div className="flex-1 flex items-center justify-center text-gray-500 p-8 text-center bg-gray-50/30">
            <div className="max-w-sm">
              <div className="w-24 h-24 bg-white rounded-[32px] shadow-xl border border-gray-100 flex items-center justify-center mx-auto mb-6 transform rotate-6 hover:rotate-0 transition-transform duration-500">
                <MessageSquare className="w-10 h-10 text-[#1abc60]" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Welcome to Chat</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">Select a conversation from the sidebar to start collaborating with your team or users.</p>
              <button 
                onClick={() => setShowSidebar(true)}
                className="mt-8 md:hidden px-8 py-3 bg-[#1abc60] text-white rounded-2xl font-bold shadow-lg shadow-[#1abc60]/20 hover:bg-[#16a34a] transition-all"
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
