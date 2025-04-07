import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggrdInUser = req.user._id;
        const filteredUsers = await User.find({_id: {$ne: loggrdInUser}}).select('-password').sort({createdAt: -1});

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.log(`Error in getUsersForSidebar: ${error.message}`);
        res.status(500).json({ error: 'Internal server errror' });
    }
}

export const getMessages = async (req, res) => {
    try {
        const { id:userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                {senderId: myId, reciverId: userToChatId},
                {senderId: userToChatId, reciverId: myId},
            ],
        }).populate("senderId", "fullName profilePic");

        res.status(200).json(messages);
    } catch (error) {
        console.log(`Error in getMessages controller: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: reciverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId: senderId,
            reciverId: reciverId,
            text: text,
            image: image,
        });

        await newMessage.save();

        const populatedMessage = await Message.findById(newMessage._id)
            .populate({ path: 'senderId', select: 'fullName profilePic' })
            .populate({ path: 'reciverId', select: 'fullName profilePic' });

        const reciverSocketId = getReceiverSocketId(reciverId);
        if (reciverSocketId) {
            io.to(reciverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(populatedMessage);
    } catch (error) {
        console.log(`Error in sendMessage controller: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
}