import { Conversation } from "@/app/types/chat.types";

interface Props {
  conversations: Conversation[];
  onSelect: (conversation: Conversation) => void;
  selectedId?: string;
  currentUserId?: string;
}

export default function ConversationList({
  conversations,
  onSelect,
  selectedId,
  currentUserId,
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
            className={`p-4 cursor-pointer transition-all hover:bg-gray-50 flex items-center gap-3 border-l-4 ${
              isActive ? "bg-[#1abc60]/5 border-l-[#1abc60]" : "border-l-transparent"
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-gray-50 flex-shrink-0 flex items-center justify-center font-bold text-gray-400 overflow-hidden ring-1 ring-gray-100">
              {otherParticipant?.profilePhoto ? (
                <img src={otherParticipant.profilePhoto} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#1abc60]/70">{otherParticipant?.name?.[0] || "?"}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-0.5">
                <h3 className={`font-semibold text-sm truncate ${isActive ? "text-[#1abc60]" : "text-gray-900"}`}>
                  {otherParticipant?.name || "Support Chat"}
                </h3>
                <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                  {conversation.updatedAt ? new Date(conversation.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate">
                {conversation.lastMessage || "No messages yet"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
