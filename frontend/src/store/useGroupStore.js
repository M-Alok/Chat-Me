import { create } from 'zustand';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '../lib/axios';
import { useAuthStore } from './useAuthStore';
import { useChatStore } from './useChatStore'

export const useGroupStore = create((set, get) => ({
    myGroups: [],
    groupMessages: [],
    selectedGroup: null,
    isCreatingGroup: false,
    isGroupsLoading: false,
    isUpdatingProfile: false,
    isGroupMessagesLoading: false,

    setSelectedGroup: (group) => {
        set({ selectedGroup: group });
    },

    fetchUserGroups: async () => {
        set({ isGroupsLoading: true });
        try {
            const res = await axiosInstance.get("/group/myGroups");
            // console.log("Fetched User Groups:", res.data.groups);
            set({ myGroups: res.data.groups });
        } catch (error) {
            console.log("Error in fetchMyGroups:", error);
            toast.error(error.response?.data?.message || "Unable to fetch your groups");
        } finally {
            set({ isGroupsLoading: false });
        }
    },

    createGroup: async (groupData, closeDialog) => {
        set({isCreatingGroup: true});
        try {
            const res = await axiosInstance.post("/group/createGroup", groupData);
        
            set({ 
                myGroups: [...get().myGroups, res.data.group],
                selectedGroup: res.data.group
            });
            
            toast.success("Group created successfully!");
            if (closeDialog) closeDialog();
        } catch (error) {
            console.log("Error in createGroup: ", error);
            toast.error(error.response?.data?.message || "Unable to create group");
        } finally {
            set({isCreatingGroup: false});
        }
    },

    fetchGroupMessages: async (groupId) => {
        set({ isGroupMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/groupMessage/${groupId}`);
            // console.log("Fetched Group Messages:", res.data.messages);
            set({ groupMessages: res.data.messages });
        } catch (error) {
            console.log("Error in fetchGroupMessages: ", error);
            toast.error(error.response?.data?.message || "Unable to fetch group messages");
        } finally {
            set({ isGroupMessagesLoading: false });
        }
    },

    sendGroupMessage: async (messageData) => {
        const { groupMessages } = get();
        try {
            const res = await axiosInstance.post(`/groupMessage/send/${messageData.groupId}`, messageData);
            // console.log("Message Sent Successfully:", res.data.message);
            set({ groupMessages: [...groupMessages, res.data.message] });
        } catch (error) {
            console.log("Error in sendGroupMessage: ", error);
            toast.error(error.response?.data?.message || "Unable to send message");
        }
    },

    updateGroupName: async ({ groupId, name }) => {
        try {
            const res = await axiosInstance.put("/group/renameGroup", { groupId, newName: name });
            set((state) => ({
                myGroups: state.myGroups.map(group => 
                    group._id === groupId ? { ...group, name } : group
                ),
                selectedGroup: state.selectedGroup?._id === groupId 
                    ? { ...state.selectedGroup, name } 
                    : state.selectedGroup
            }));
            toast.success("Group name updated successfully");
        } catch (error) {
            console.log("Error in updateGroupName:", error);
            toast.error(error.response?.data?.message || "Failed to update group name");
        }
    },

    updateDescription: async ({ groupId, description }) => {
        try {
            const res = await axiosInstance.put("/group/updateDescription", { 
                groupId, 
                newDescription: description 
            });
            set((state) => ({
                myGroups: state.myGroups.map(group => 
                    group._id === groupId ? { ...group, description } : group
                ),
                selectedGroup: state.selectedGroup?._id === groupId 
                    ? { ...state.selectedGroup, description } 
                    : state.selectedGroup
            }));
            toast.success("Description updated successfully");
        } catch (error) {
            console.log("Error in updateDescription:", error);
            toast.error(error.response?.data?.message || "Failed to update description");
        }
    },

    updateGroupProfile: async ({ profilePic }) => {
        set({ isUpdatingProfile: true });
        try {
            const { selectedGroup } = get();
            const res = await axiosInstance.put("/group/updateProfile", {
                groupId: selectedGroup._id,
                profilePic
            });
            
            set((state) => ({
                myGroups: state.myGroups.map(group => 
                    group._id === selectedGroup._id 
                        ? { ...group, profilePic: res.data.group.profilePic } 
                        : group
                ),
                selectedGroup: { ...state.selectedGroup, profilePic: res.data.group.profilePic }
            }));
            toast.success("Profile picture updated successfully");
        } catch (error) {
            console.log("Error in updateGroupProfile:", error);
            toast.error(error.response?.data?.message || "Failed to update profile picture");
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    addMember: async (groupId, userId) => {
        try {
          const res = await axiosInstance.put("/group/addUser", { groupId, userId });
          const allUsers = useChatStore.getState().allUsers;
          
          // Get the newly added user's full details
          const addedUser = allUsers.find(u => u._id === userId) || { _id: userId, fullName: 'New User', profilePic: '/avatar.png' };
          
          // Update state with the complete user object
          set((state) => ({
            myGroups: state.myGroups.map(group => 
              group._id === groupId 
                ? { 
                    ...group, 
                    members: [...group.members, addedUser] 
                  } 
                : group
            ),
            selectedGroup: state.selectedGroup?._id === groupId 
              ? { 
                  ...state.selectedGroup, 
                  members: [...state.selectedGroup.members, addedUser] 
                } 
              : state.selectedGroup
          }));
          
          toast.success("User added to group successfully");
        } catch (error) {
          console.log("Error in addMember:", error);
          toast.error(error.response?.data?.message || "Failed to add user to group");
        }
    },

    removeMember: async (groupId, userId) => {
        try {      
            const res = await axiosInstance.put("/group/removeUser", { 
                groupId: groupId, 
                userId: userId
            });
            
            set((state) => ({
                myGroups: state.myGroups.map(group => 
                group._id === groupId 
                    ? { 
                        ...group, 
                        members: group.members.filter(m => m._id !== userId) 
                    } 
                    : group
                ),
                selectedGroup: state.selectedGroup?._id === groupId 
                ? { 
                    ...state.selectedGroup, 
                    members: state.selectedGroup.members.filter(m => m._id !== userId) 
                    } 
                : state.selectedGroup
            }));
            
            toast.success("User removed from group successfully");
        } catch (error) {
            console.log("Error in removeMember:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to remove user");
        }
    },

    leaveGroup: async () => {
        try {
            const { selectedGroup } = get();
            await axiosInstance.put("/group/leaveGroup", { groupId: selectedGroup._id });
            
            set((state) => ({
                myGroups: state.myGroups.filter(group => group._id !== selectedGroup._id),
                selectedGroup: null
            }));
            
            toast.success("You have left the group");
            document.getElementById("my_modal_3").close();
        } catch (error) {
            console.log("Error in leaveGroup:", error);
            toast.error(error.response?.data?.message || "Failed to leave group");
        }
    },

    deleteGroup: async () => {
        try {
            const { selectedGroup } = get();
            await axiosInstance.delete(`/group/deleteGroup/${selectedGroup._id}`);
            
            set((state) => ({
                myGroups: state.myGroups.filter(group => group._id !== selectedGroup._id),
                selectedGroup: null
            }));
            
            toast.success("Group deleted successfully");
            document.getElementById("my_modal_3").close();
        } catch (error) {
            console.log("Error in deleteGroup:", error);
            toast.error(error.response?.data?.message || "Failed to delete group");
        }
    },

    subscribeToGroupMessages: () => {
        const { selectedGroup, myGroups } = get();
        const socket = useAuthStore.getState().socket;
        
        if (!selectedGroup) return;

        const groupIds = myGroups.map(group => group._id);
        socket.emit("joinGroups", groupIds);

        const messageListener = (newGroupMessage) => {
            if (selectedGroup && newGroupMessage.groupId !== selectedGroup._id) return;
            set((state) => ({ groupMessages: [...state.groupMessages, newGroupMessage] }));
        }
    
        socket.on("newGroupMessage", messageListener);

        return () => {
            socket.off("newGroupMessage", messageListener);
        }
    },
    
    unsubscribeToGroupMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newGroupMessage");
    },    
}));
