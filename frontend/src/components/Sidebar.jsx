import { useEffect, useState, useRef, memo } from "react";
import { useChatStore } from "../store/useChatStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Search, Users } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useDebounce } from "use-debounce";

const Sidebar = () => {
  const allUsers = useChatStore((state) => state.allUsers);
  const filteredUsers = useChatStore((state) => state.filteredUsers);
  const setFilteredUsers = useChatStore((state) => state.setFilteredUsers);
  const setSelectedUser = useChatStore((state) => state.setSelectedUser);
  const isUsersLoading = useChatStore((state) => state.isUsersLoading);

  const onlineUsers = useAuthStore.getState().onlineUsers || [];

  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const searchInputRef = useRef(null);
  const selectedUser = useChatStore((state) => state.selectedUser);

  useEffect(() => {
    useChatStore.getState().getUsers();
  }, []);

  useEffect(() => {
    if (!debouncedSearchTerm.trim()) {
      setFilteredUsers(allUsers);
    } else {
      const filtered = allUsers.filter(user =>
        user.fullName.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [debouncedSearchTerm, allUsers, setFilteredUsers]);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const getFilteredUsers = () => {
    return showOnlineOnly
      ? filteredUsers.filter(user => onlineUsers.includes(user._id))
      : filteredUsers;
  };

  if (isUsersLoading) return <SidebarSkeleton />;

  const currentFilteredUsers = getFilteredUsers();

  return (
    <aside className="h-full w-full md:w-72 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-4">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium block">Contacts</span>
        </div>

        <div className="mt-3 flex flex-col items-start gap-4">
          <div className="relative flex justify-center items-center shadow-lg border h-10 px-4 py-1 w-full  rounded-full transition-all duration-200">
            <input
              ref={searchInputRef}
              placeholder="Search..."
              className="bg-transparent h-5 outline-none w-full"
              name="search"
              type="search"
              autoComplete="off"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="my-auto size-5 cursor-text" />
          </div>

          <div className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
            <span className="text-xs text-zinc-500">
              ({onlineUsers.length} online)
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {currentFilteredUsers.length > 0 ? (
          currentFilteredUsers.map((user) => (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`w-full p-3 flex items-center gap-3 transition-colors ${
                selectedUser?._id === user._id ? "bg-blue-500 rounded-lg ring-1 ring-base-300" : ""
              }`}
            >
              <div className="relative mx-0">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.name}
                  className="size-12 object-cover rounded-full border-2 border-black"
                />
                {onlineUsers.includes(user._id) && (
                  <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                )}
              </div>
              <div className="block text-left min-w-0">
                <div className="font-medium truncate">{user.fullName}</div>
                <div className="text-sm text-zinc-400">
                  {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="text-center text-zinc-500 py-4">
            {searchTerm
              ? "No users found"
              : showOnlineOnly
              ? "No online users"
              : "No users available"}
          </div>
        )}
      </div>
    </aside>
  );
};

export default memo(Sidebar);