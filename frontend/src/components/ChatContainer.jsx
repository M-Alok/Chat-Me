import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { X } from "lucide-react"; // Close icon

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeToMessages,
    setSelectedUser,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const scrollMessagesRef = useRef(null);
  
  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeToMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeToMessages]);
  
  useEffect(() => {
    if (scrollMessagesRef.current && messages) {
      scrollMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }
  
  return (
    <div className="flex-1 flex flex-col overflow-auto relative">
      {/* Close button for mobile */}
      <button 
        className="absolute top-3 left-3 bg-red-500 text-white p-2 rounded-full lg:hidden"
        onClick={() => setSelectedUser(null)}
        >
        <X size={20} />
      </button>

      <ChatHeader />

      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? 'chat-end' : 'chat-start'}`}
            ref={scrollMessagesRef}
            >
            {/* Chat avatar */}
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={message.senderId === authUser._id ? authUser.profilePic || "/avatar.png" : selectedUser.profilePic || "/avatar.png"}
                  alt="profile pic"
                  />
              </div>
            </div>

            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>

            {/* Chat or image */}
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment" 
                  className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
      </div>
      
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
