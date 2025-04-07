import mongoose from "mongoose";
import Group from "../models/groupChat.model.js";
import cloudinary from '../lib/cloudinary.js';

// Get all groups where the logged-in user is a member
export const getUserGroups = async (req, res) => {
    try {
        const userId = req.user._id;

        const groups = await Group.find({ members: userId }).populate("admin", "fullName profilePic").populate("members", "fullName profilePic");

        res.status(200).json({ groups });
    } catch (error) {
        console.error("Error in getUserGroups controller:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

// Get all groups
export const getAllGroups = async (req, res) => {
    try {
        const groups = await Group.find().populate("admin", "fullName profilePic").populate("members", "fullName profilePic");

        res.status(200).json({ groups });
    } catch (error) {
        console.error("Error fetching groups:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

// Create a new group
export const createGroup = async (req, res) => {
    try {
        const { name, members, admin, description, profilePic } = req.body;

        // Validate required fields
        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Group Name is required" });
        }

        if (!members || members.length < 1) {
            return res.status(400).json({ message: "Add at least 1 user to the group" });
        }

        let profilePicUrl = "";
        if (profilePic) {
            try {
                const uploadResponse = await cloudinary.uploader.upload(profilePic, {
                    folder: "group-profile-pics",
                    resource_type: "auto",
                });
                profilePicUrl = uploadResponse.secure_url;
            } catch (uploadError) {
                return res.status(500).json({ message: "Error uploading profile picture" });
            }
        }

        // Ensure members array is formatted correctly
        const allMembers = [...new Set([admin, ...(Array.isArray(members) ? members : JSON.parse(members))])];

        const group = new Group({
            name,
            description: description || "",
            members: allMembers,
            admin,
            profilePic: profilePicUrl,
        });

        await group.save();

        // Populate the members and admin fields before returning
        const populatedGroup = await Group.findById(group._id).populate("members", "fullName profilePic").populate("admin", "fullName profilePic");

        return res.status(201).json({
            message: "Group created successfully",
            group: {
                ...populatedGroup._doc,
                isGroup: true,
            },
        });
    } catch (error) {
        console.error("Error in createGroup controller:", error);

        // Prevent multiple responses
        if (!res.headersSent) {
            return res.status(500).json({ message: "Server error", error: error.message });
        }
    }
};

// Rename Group
export const renameGroup = async (req, res) => {
    try {
        const { groupId, newName } = req.body;

        if (!groupId) {
            return res.status(400).json({ message: "Group ID required" });
        }

        if (!newName) {
            return res.status(400).json({ message: "Group name required" });
        }

        const group = await Group.findByIdAndUpdate(groupId, { name: newName }, { new: true });

        if (!group) return res.status(404).json({ message: "Group not found" });

        res.status(200).json({ message: "Group name updated successfully", group });
    } catch (error) {
        console.error("Error in renameGroup controller:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

// Update Group Descreption
export const updateDescription = async (req, res) => {
    try {
        const {groupId, newDescription} = req.body;

        if (!groupId) {
            return res.status(400).json({ message: "Group ID required" });
        }

        const group = await Group.findByIdAndUpdate(groupId, {description: newDescription}, {new: true});

        if (!group) return res.status(404).json({ message: "Group not found" });

        res.status(200).json({ message: "Group description updated successfully", group });
    } catch (error) {
        console.log("Error in updateDescription controller:", error);
        res.status(500).json({ message: "Server error", error });
    }
}

// Update Group Profile
export const updateGroupProfile = async (req, res) => {
    try {
        const { groupId, profilePic } = req.body;

        if (!groupId) {
            return res.status(400).json({ message: "Group ID is required" });
        }

        let profilePicUrl = "";
        if (profilePic) {
            const uploadResponse = await cloudinary.uploader.upload(profilePic);
            profilePicUrl = uploadResponse.secure_url;
        }

        const group = await Group.findByIdAndUpdate(
            groupId, 
            { profilePic: profilePicUrl }, 
            { new: true }
        );

        if (!group) return res.status(404).json({ message: "Group not found" });

        res.status(200).json({ 
            message: "Group profile updated successfully", 
            group 
        });
    } catch (error) {
        console.error("Error in updateGroupProfile controller:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

// Add User to Group
export const addUserToGroup = async (req, res) => {
    try {
        const { groupId, userId } = req.body;

        if (!groupId || !userId) {
            return res.status(400).json({ message: "Group ID and user ID are required" });
        }

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: "Group not found" });

        if (group.members.some(member => member.toString() === userId)) {
            return res.status(400).json({ message: "User is already in the group" });
        }

        group.members.push(new mongoose.Types.ObjectId(userId));
        await group.save();

        const populatedGroup = await Group.findById(groupId).populate("members", "fullName profilePic");

        res.status(200).json({ message: "User added to group successfully", group: populatedGroup });
    } catch (error) {
        console.error("Error in addUserToGroup controller:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

// Remove User from Group
export const removeUserFromGroup = async (req, res) => {
    try {
        const { groupId, userId } = req.body;

        if (!groupId || !userId) {
            return res.status(400).json({ message: "Group ID and user ID are required" });
        }

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: "Group not found" });

        if (group.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Only the admin can remove members from the group" });
        }

        if (!group.members.some(member => member.toString() === userId)) {
            return res.status(400).json({ message: "User is not in the group" });
        }

        group.members = group.members.filter(member => member.toString() !== userId);
        await group.save();

        res.status(200).json({ message: "User removed from group successfully", group });
    } catch (error) {
        console.error("Error in removeUserFromGroup controller:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

// Leave Group
export const leaveGroup = async (req, res) => {
    try {
        const userId = req.user._id;
        const { groupId } = req.body;

        if (!groupId) {
            return res.status(400).json({ message: "Group ID is required" });
        }

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: "Group not found" });

        // Prevent admin from leaving
        if (group.admin.toString() === userId.toString()) {
            return res.status(400).json({ message: "Admin cannot leave the group. You can delete it instead." });
        }

        group.members = group.members.filter(member => member.toString() !== userId.toString());
        await group.save();

        res.status(200).json({ message: "You have left the group successfully", group });
    } catch (error) {
        console.error("Error in leaveGroup controller:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

// Delete group
export const deleteGroup = async (req, res) => {
    try {
        const userId = req.user._id;
        const { groupId } = req.params;

        if (!groupId) {
            return res.status(400).json({ message: "Group ID is required" });
        }

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: "Group not found" });

        if (group.admin.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Only the group admin can delete this group" });
        }

        await Group.findByIdAndDelete(groupId);

        res.status(200).json({ message: "Group deleted successfully" });
    } catch (error) {
        console.error("Error in deleteGroup controller:", error);
        res.status(500).json({ message: "Server error", error });
    }
};
