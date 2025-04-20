import { Server, Socket } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
    },
});

app.set('io', io);

export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

// Used to store online users
const userSocketMap = {};

io.on("connection", (socket) => {
    console.log("A user connected: ", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId) userSocketMap[userId] = socket.id;

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("joinGroup", (groupId) => {
        socket.join(groupId);
    });    

    socket.on("disconnect", () => {
        console.log("A user disconnected: ", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    })

    socket.on("typing", ({ receiverId, groupId }) => {
        if (receiverId) {
            const receiverSocketId = userSocketMap[receiverId];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("typing", { senderId: userId });
            }
        } else if (groupId) {
            socket.to(groupId).emit("typing", { senderId: userId });
        }
    });
    
    socket.on("stopTyping", ({ receiverId, groupId }) => {
        if (receiverId) {
            const receiverSocketId = userSocketMap[receiverId];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("stopTyping", { senderId: userId });
            }
        } else if (groupId) {
            socket.to(groupId).emit("stopTyping", { senderId: userId });
        }
    });    
})

export { io, app, server };