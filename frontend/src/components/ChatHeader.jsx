import { ArrowLeft } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import UpdateGroup from "./UpdateGroup";

const ChatHeader = () => {
  // Separate states for user and group
  const { selectedUser, setSelectedUser } = useChatStore();
  const { selectedGroup, setSelectedGroup } = useGroupStore();
  const { onlineUsers } = useAuthStore();

  // Determine if we're showing a user or group chat
  const isGroupChat = !!selectedGroup;
  const currentChat = isGroupChat ? selectedGroup : selectedUser;

  const handleCloseChat = () => {
    if (isGroupChat) {
      setSelectedGroup(null);
    } else {
      setSelectedUser(null);
    }
  };

  if (!currentChat) return null;

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Back button */}
          <button
            onClick={handleCloseChat} 
            className="btn btn-sm btn-circle btn-ghost"
          >
            <ArrowLeft />
          </button>

          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={currentChat.profilePic || "/avatar.png"}
                alt={currentChat.fullName || currentChat.name}
              />
            </div>
            {!isGroupChat && onlineUsers.includes(currentChat._id) && (
              <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
            )}
          </div>

          {/* User/Group info */}
          <div>
            <h3 className="font-medium text-lg">{currentChat?.fullName ?? currentChat?.name}</h3>
            <p className="text-sm text-base-content/70">
              {selectedGroup 
                ? `${selectedGroup.members?.length || 0} members` 
                : onlineUsers.includes(selectedUser?._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Close button */}
        {
          isGroupChat && (
            <UpdateGroup />
          )
        }
      </div>
    </div>
  );
};

export default ChatHeader;