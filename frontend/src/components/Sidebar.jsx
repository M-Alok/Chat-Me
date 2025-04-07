import { useEffect, useState, useRef, memo, useMemo } from "react";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Search, Users, X, MessagesSquare } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useDebounce } from "use-debounce";
import CreateGroup from "./CreateGroup";

const Sidebar = () => {
  const allUsers = useChatStore((state) => state.allUsers);
  const filteredUsers = useChatStore((state) => state.filteredUsers);
  const setFilteredUsers = useChatStore((state) => state.setFilteredUsers);
  const selectedUser = useChatStore((state) => state.selectedUser);
  const setSelectedUser = useChatStore((state) => state.setSelectedUser);
  const isUsersLoading = useChatStore((state) => state.isUsersLoading);

  const myGroups = useGroupStore((state) => state.myGroups);
  const fetchUserGroups = useGroupStore((state) => state.fetchUserGroups);
  const isGroupsLoading = useGroupStore((state) => state.isGroupsLoading);
  const selectedGroup = useGroupStore((state) => state.selectedGroup);
  const setSelectedGroup = useGroupStore((state) => state.setSelectedGroup);
  const fetchGroupMessages = useGroupStore((state) => state.fetchGroupMessages);

  const onlineUsers = useAuthStore.getState().onlineUsers || [];
  const activeTab = useAuthStore((state) => state.activeTab);
  const setActiveTab = useAuthStore((state) => state.setActiveTab);

  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const searchInputRef = useRef(null);

  useEffect(() => {
    fetchUserGroups();
  }, []);

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

  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) {
      return myGroups;
    }
    return myGroups.filter(group => 
      group.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [myGroups, searchTerm]);

  if (isUsersLoading || isGroupsLoading) return <SidebarSkeleton />;

  const currentFilteredUsers = getFilteredUsers();

  return (
    <aside className="h-full w-full md:w-80 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-4">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <Users className="size-6" />
            <span className="font-medium block">Contacts</span>
          </div>
          <CreateGroup />
        </div>

        <div className="tabs tabs-boxed bg-base-200 mt-3">
          <button
            className={`tab flex-1 ${activeTab === 'private' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('private')}
          >
            <Users className="size-4 mr-1" />
            Private
          </button>
          <button
            className={`tab flex-1 ${activeTab === 'groups' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('groups')}
          >
            <MessagesSquare className="size-4 mr-1" />
            Groups
          </button>
        </div>

        <div className="mt-3 flex flex-col items-start gap-4">
          <div className="input input-bordered border-2 relative flex justify-center items-center h-10 w-full rounded-xl">
            <input
              ref={searchInputRef}
              placeholder={`Search ${activeTab === 'private' ? 'users' : 'groups'}...`}
              className="bg-transparent h-5 outline-none w-full"
              type="search"
              autoComplete="off"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            { searchTerm ? <X className="my-auto size-5 cursor-pointer" onClick={() => setSearchTerm("")} /> : <Search className="my-auto size-5 cursor-text" /> }
          </div>

          {activeTab === 'private' && (
            <div className="cursor-pointer flex items-center gap-2">
              <input
                id="onlineOnly"
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="checkbox checkbox-sm"
              />
              <label htmlFor="onlineOnly" className="text-sm">Show online only</label>
              <span className="text-xs text-zinc-500 cursor-text">
                ({onlineUsers.length -1} online)
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {activeTab === 'groups' ? (
          <div>
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => (
                <button
                  key={group._id}
                  onClick={() => {
                    setSelectedUser(null);
                    setSelectedGroup(group);
                  }}
                  className={`w-full p-3 flex items-center gap-3 transition-colors hover:bg-base-300 ${
                    selectedGroup?._id === group._id ? "bg-base-300" : ""
                  }`}
                >
                  <div className="relative mx-0">
                    <img
                      src={group.profilePic || "/avatar.png"}
                      alt={group.name}
                      className="size-12 object-cover rounded-full"
                    />
                  </div>
                  <div className="block text-left min-w-0">
                    <div className="font-medium truncate">{group.name}</div>
                    <div className="text-sm text-zinc-400">
                      Group • {group.members.length} members
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center text-zinc-500 py-4">
                {searchTerm
                  ? "No groups found"
                  : <span className="gap-2 leading-relaxed text-lg">
                      <div>No groups available.</div>
                      <div>Create one to get started!</div>
                    </span>
                }
              </div>
            )}
          </div>
        ) : (
          <div>
            {currentFilteredUsers.length > 0 ? (
              currentFilteredUsers.map((user) => (
                <button
                  key={user._id}
                  onClick={() => {
                    setSelectedGroup(null);
                    setSelectedUser(user);
                  }}
                  className={`w-full p-3 flex items-center gap-3 transition-colors hover:bg-base-300 ${
                    selectedUser?._id === user._id ? "bg-base-300" : ""
                  }`}
                >
                  <div className="relative mx-0">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.name}
                      className="size-12 object-cover rounded-full"
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
                  : "No users available"
                }
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

export default memo(Sidebar);