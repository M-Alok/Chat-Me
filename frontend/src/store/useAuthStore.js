import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,
    activeTab: 'private',
    typingUsers: [],

    setTypingUsers: (users) => set({ typingUsers: users }),
    
    setActiveTab: (tab) => set({ activeTab: tab }),

    checkAuth: async () => {
        set({ isCheckingAuth: true });
        try {
            const res = await axiosInstance.get('/auth/check');
            set({authUser: res.data});
            get().connectSocket();
        } catch (error) {
            console.log('Error in checkAuth: ', error);
            set({authUser: null});
        } finally {
            set({isCheckingAuth: false});
        }
    },

    signup: async (formData) => {
        set({isSigningUp: true});
        try {
            const res = await axiosInstance.post('/auth/signup', formData);
            set({authUser: res.data});
            toast.success('Account created successfully');
            get().connectSocket();
        } catch (error) {
            console.log('Error in signup: ', error);
            toast.error(error.response.data.message);
        } finally {
            set({isSigningUp: false});
        }
    },

    login: async (formData) => {
        set({isLoggingIn: true});
        try {
            const res = await axiosInstance.post('/auth/login', formData);
            set({authUser: res.data});
            toast.success('Logged in successfully');
            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
            console.log('Error in login: ', error);
        } finally {
            set({isLoggingIn: false});
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post('/auth/logout');
            set({authUser: null});
            toast.success('Logged out successfully');
            get().disconnectSocket();
        } catch (error) {
            console.log('Error in logout: ', error);
            toast.error(error.response.data.message);
        }
    },

    updateProfile: async (data) => {
        set({isUpdatingProfile: true});
        try {
            const res = await axiosInstance.put('/auth/update-profile', data);
            set({authUser: res.data});
            toast.success('Profile updated successfully');
        } catch (error) {
            console.log('Error in updateProfile: ', error);
            toast.error(error.response?.data?.message || "Can't uploaded image");
        } finally {
            set({isUpdatingProfile: false});
        }
    },

    updateUserInfo: async (data) => {
        set({isUpdatingProfile: true});
        try {
            const res = await axiosInstance.put('/auth/update-user-info', data);
            set({authUser: res.data});
            toast.success('Profile information updated successfully');
        } catch (error) {
            console.log('Error in updateUserInfo: ', error);
            toast.error(error.response?.data?.message || "Couldn't update information");
        } finally {
            set({isUpdatingProfile: false});
        }
    },

    connectSocket: () => {
        const { authUser } = get();
        if (!authUser || get().socket?.connected) return;

        const socket = io(BASE_URL, {
            query: {
                userId: authUser._id,
            },
        });
        socket.connect();

        set({ socket: socket });

        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds });
        })

        socket.on("typing", ({ senderId }) => {
            const current = get().typingUsers;
            if (!current.includes(senderId)) {
                set({ typingUsers: [...current, senderId] });
            }
        });
        
        socket.on("stopTyping", ({ senderId }) => {
            set({
                typingUsers: get().typingUsers.filter(id => id !== senderId)
            });
        });        
    },

    disconnectSocket: () => {
        if (get().socket?.connected) get().socket?.disconnect();
    },
}))