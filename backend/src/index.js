import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import colors from 'colors';

import { connectDB } from './lib/bd.js'
import authRoutes from './routes/auth.route.js'
import messageRoutes from './routes/message.route.js'
import groupRoutes from './routes/groupChat.route.js'
import groupMessageRoutes from './routes/groupMessage.route.js'
import userRoutes from './routes/user.route.js'
import { app, server } from './lib/socket.js';

dotenv.config()

const port = process.env.PORT;
const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/group", groupRoutes);
app.use("/api/groupMessage", groupMessageRoutes);
app.use("/api/user", userRoutes);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    })
}

server.listen(port, () => {
    console.log(`Server is running at port ${port}...`.yellow.bold);
    connectDB()
})