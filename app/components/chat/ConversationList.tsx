import { Conversation } from "@/app/types/chat.types";

interface Props {
  conversations: Conversation[];
  onSelect: (conversation: Conversation) => void;
  selectedId?: string;
  currentUserId?: string;
  currentUserRole?: string;
}

export default function ConversationList({
  conversations,
  onSelect,
  selectedId,
  currentUserId,
  currentUserRole,
}: Props) {
  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p className="text-sm">No conversations found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-gray-50">
      {conversations.map((conversation) => {
        const otherParticipant = conversation.participants?.find(p => p._id !== currentUserId) || conversation.participants?.[0];
        const isActive = selectedId === conversation._id;
        
        return (
          <div
            key={conversation._id}
            onClick={() => onSelect(conversation)}
            className={`p-3 md:p-4 cursor-pointer transition-all hover:bg-gray-50 flex items-center gap-2 md:gap-3 border-l-4 ${
              isActive ? "bg-[#1abc60]/5 border-l-[#1abc60]" : "border-l-transparent"
            }`}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-50 flex-shrink-0 flex items-center justify-center font-bold text-gray-400 overflow-hidden ring-1 ring-gray-100">
              {otherParticipant?.profilePhoto ? (
                <img src={otherParticipant.profilePhoto} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#1abc60]/70 text-sm md:text-base">{otherParticipant?.name?.[0] || "?"}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-semibold text-[13px] md:text-sm truncate ${isActive ? "text-[#1abc60]" : "text-gray-900"}`}>
                      {currentUserRole === 'admin' && conversation.type === 'superadmin_admin' 
                        ? "Backend Contact" 
                        : (otherParticipant?.name || "Support Chat")}
                    </h3>
                    <span className="font-bold text-[8px] md:text-[9px] uppercase px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 shrink-0">
                      {otherParticipant?.role || "User"}
                    </span>
                  </div>
                  <p className="text-[11px] md:text-xs text-gray-500 truncate w-full">
                    {conversation.lastMessage || "No messages yet"}
                  </p>
                </div>
                <div className="flex flex-col items-end shrink-0 gap-1 mt-0.5">
                  <span className="text-[9px] md:text-[10px] text-gray-400 whitespace-nowrap font-medium">
                    {conversation.updatedAt ? new Date(conversation.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {conversation.unreadCount && conversation.unreadCount > 0 ? (
                      <span className="bg-[#1abc60] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {conversation.unreadCount}
                      </span>
                    ) : null}
                    <span className="text-[8px] md:text-[9px] text-gray-400 whitespace-nowrap">
                      {conversation.updatedAt ? new Date(conversation.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
/////wupefghweuilfgwlequfgwipugiupgb
//siaptjhgrew9hohwreiwrgenhwrgioenhoh