import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime, formatMessageDate } from "../lib/utils";

const ChatContainer = () => {
  const messages = useChatStore((state) => state.messages);
  const getMessages = useChatStore((state) => state.getMessages);
  const isMessagesLoading = useChatStore((state) => state.isMessagesLoading);
  const selectedUser = useChatStore((state) => state.selectedUser);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const subscribeToMessages = useChatStore((state) => state.subscribeToMessages);
  const unsubscribeToMessages = useChatStore((state) => state.unsubscribeToMessages);

  const authUser = useAuthStore((state) => state.authUser);
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
  
  let lastDisplayedDate = null;

  return (
    <div className="flex-1 flex flex-col overflow-auto relative">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.length > 0 ? (
          messages.map((message, index) => {
            const messageDate = formatMessageDate(message.createdAt);
            const showDate = messageDate !== lastDisplayedDate;
            lastDisplayedDate = messageDate;

            return (
              <div key={message._id}>
                {showDate && (
                  <div className="w-full text-center my-2">
                    <span className="badge badge-soft badge-neutral px-2 py-1 text-xs rounded">
                      {messageDate}
                    </span>
                  </div>
                )}

                <div
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
              </div>
            );
          })
        ) : (
          <p className="flex items-center justify-center h-full py-4">
            <span className="text-xl font-medium">No messages yet...</span>
          </p>
        )}
      </div>
      
      <MessageInput />
    </div>
  );
};

export default ChatContainer;