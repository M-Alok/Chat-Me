import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime, formatMessageDate } from "../lib/utils";
import { useGroupStore } from "../store/useGroupStore";

const ChatContainer = () => {
  const messages = useChatStore((state) => state.messages);
  const getMessages = useChatStore((state) => state.getMessages);
  const isMessagesLoading = useChatStore((state) => state.isMessagesLoading);
  const selectedUser = useChatStore((state) => state.selectedUser);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const subscribeToMessages = useChatStore((state) => state.subscribeToMessages);
  const unsubscribeToMessages = useChatStore((state) => state.unsubscribeToMessages);

  const selectedGroup = useGroupStore((state) => state.selectedGroup);
  const groupMessages = useGroupStore((state) => state.groupMessages);
  const fetchGroupMessages = useGroupStore((state) => state.fetchGroupMessages);
  const isGroupMessagesLoading = useGroupStore((state) => state.isGroupMessagesLoading);
  const sendGroupMessage = useGroupStore((state) => state.sendGroupMessage);
  const subscribeToGroupMessages = useGroupStore((state) => state.subscribeToGroupMessages);
  const unsubscribeToGroupMessages = useGroupStore((state) => state.unsubscribeToGroupMessages);

  const authUser = useAuthStore((state) => state.authUser);
  const socket = useAuthStore((state) => state.socket);
  const scrollMessagesRef = useRef(null);

  const isGroupChat = selectedGroup ? true : false;
  const currentMessages = isGroupChat ? groupMessages : messages;
  
  useEffect(() => {
    if (isGroupChat && selectedGroup?._id) {
        fetchGroupMessages(selectedGroup._id);
        subscribeToGroupMessages();
    } else if (!isGroupChat && selectedUser?._id) {
        getMessages(selectedUser._id);
        subscribeToMessages();
    }

    return () => {
        if (isGroupChat) {
            unsubscribeToGroupMessages();
        } else {
            unsubscribeToMessages();
        }
    };
  }, [selectedUser?._id, selectedGroup?._id, isGroupChat]);

  useEffect(() => {
    if (socket && selectedGroup?._id) {
        socket.emit("joinGroup", selectedGroup._id);
    }
  }, [socket, selectedGroup]);


  useEffect(() => {
    if (scrollMessagesRef.current && currentMessages.length > 0) {
      scrollMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentMessages]);

  if ((isMessagesLoading && !isGroupChat) || (isGroupMessagesLoading && isGroupChat)) {
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
        {currentMessages.length > 0 ? (
          currentMessages.map((message) => {
            const messageDate = formatMessageDate(message.createdAt);
            const showDate = messageDate !== lastDisplayedDate;
            lastDisplayedDate = messageDate;

            const sender = message.senderId._id === authUser._id 
              ? authUser 
              : isGroupChat
                ? { 
                  profilePic: message.senderId?.profilePic || "/avatar.png",
                  fullName: message.senderId?.fullName || "Unknown" 
                }
                : selectedUser;

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
                  className={`chat ${message.senderId._id === authUser._id ? 'chat-end' : 'chat-start'} px-2`}
                  ref={scrollMessagesRef}
                >
                  {/* Chat avatar */}
                  <div className="chat-image avatar">
                    <div className="size-10 rounded-full border">
                      <img
                        src={sender.profilePic || "/avatar.png"}
                        alt="profile pic"
                      />
                    </div>
                  </div>
                  
                  <div className="chat-header mb-1">
                    {isGroupChat && message.senderId._id !== authUser._id && (
                      <span className="font-medium mr-2 text-sm">
                        {sender.fullName}
                      </span>
                    )}
                    <time className="text-xs opacity-50">
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