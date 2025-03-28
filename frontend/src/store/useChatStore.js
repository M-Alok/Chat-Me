import { create } from 'zustand';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '../lib/axios';
import { useAuthStore } from './useAuthStore';

export const useChatStore = create((set, get) => ({
    messages: [],
    allUsers: [],
    filteredUsers: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get('/messages/users');
            const sortedUsers = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            set({ allUsers: sortedUsers, filteredUsers: sortedUsers });
        } catch (error) {
            console.log('Error in getUsers: ', error);
            toast.error(error.response?.data?.message || "Unable to get users");
        } finally {
            set({ isUsersLoading: false });
        }
    },

    setFilteredUsers: (filteredUsers) => {
        set({ filteredUsers });
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            console.log('Error in getMessages: ', error);
            toast.error(error.response?.data?.message || "Unable to get messages");
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({ messages: [...messages, res.data] });
        } catch (error) {
            console.log('Error in sendMessage: ', error);
            toast.error(error.response?.data?.message || "Unable to send message");
        }
    },

    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;
        
        const socket = useAuthStore.getState().socket;

        socket.on("newMessage", (newMessage) => {
            if (newMessage.senderId !== selectedUser._id) return;
            
            set({ messages: [...get().messages, newMessage] });
        });
    },

    unsubscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },

    setSelectedUser: (selectedUser) => {
        set({ selectedUser });
    },
}));
