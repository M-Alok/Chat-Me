import cloudinary from "../lib/cloudinary.js";
import Group from "../models/groupChat.model.js";
import GroupMessage from "../models/groupMessage.model.js";

export const sendGroupMessage = async (req, res) => {
    try {
        const { groupId, senderId, text } = req.body;
        let { image } = req.body;

        if (!groupId || !senderId || (!text && !image)) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        let imageUrl = null;
        if (image) {
            try {
                const uploadResponse = await cloudinary.uploader.upload(image, {
                    folder: 'group-messages',
                    resource_type: 'auto'
                });
                imageUrl = uploadResponse.secure_url;
            } catch (uploadError) {
                console.error('Cloudinary upload error:', uploadError);
                return res.status(400).json({ message: "Failed to upload image" });
            }
        }

        const message = new GroupMessage({ 
            groupId, 
            senderId, 
            text, 
            image: imageUrl 
        });
        
        await message.save();

        const populatedMessage = await GroupMessage.findById(message._id).populate('senderId', 'fullName profilePic');

        if (req.app.get('io')) {
            req.app.get('io').to(groupId).emit('newGroupMessage', populatedMessage);
        }        

        res.status(201).json({ 
            success: true,
            message: populatedMessage
        });
        
    } catch (error) {
        console.error('Error in sendGroupMessage:', error);
        res.status(500).json({ 
            message: "Server error", 
            error: error.message 
        });
    }
};

export const getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;

        if (!groupId) {
            return res.status(400).json({ message: "Group ID is required" });
        }

        const messages = await GroupMessage.find({ groupId }).populate("senderId", "fullName profilePic");

        res.status(200).json({ messages });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
