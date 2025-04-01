import mongoose from "mongoose";
import Group from "../models/groupChat.model.js";
import cloudinary from '../lib/cloudinary.js';

// Get all groups where the logged-in user is a member
export const getMyGroups = async (req, res) => {
    try {
        const userId = req.user._id;

        const groups = await Group.find({ members: userId });

        res.status(200).json({ groups });
    } catch (error) {
        console.error("Error in getMyGroups controller:", error);
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
      const { name, members, admin, description } = req.body;
      
      let profilePicUrl = "";
      // Handle file upload if exists
      if (req.file) {
        const uploadResponse = await cloudinary.uploader.upload(req.file.path, {
          folder: 'group-profile-pics',
          resource_type: 'auto'
        });
        profilePicUrl = uploadResponse.secure_url;
      }

      // Handle base64 image if sent directly
      if (req.body.profilePic && !req.file) {
        const uploadResponse = await cloudinary.uploader.upload(req.body.profilePic, {
          folder: 'group-profile-pics',
          resource_type: 'auto'
        });
        profilePicUrl = uploadResponse.secure_url;
      }
  
      const allMembers = [...new Set([admin, ...(Array.isArray(members) ? members : JSON.parse(members))])];
  
      const group = new Group({
        name,
        description: description || "",
        members: allMembers,
        admin,
        profilePic: profilePicUrl
      });
  
      await group.save();
  
      res.status(201).json({
        message: "Group created successfully",
        group: {
          ...group._doc,
          isGroup: true
        }
      });
    } catch (error) {
      console.error("Error in createGroup controller:", error);
      res.status(500).json({ 
        message: "Server error", 
        error: error.message 
      });
    }
};

// Rename Group
export const renameGroup = async (req, res) => {
    try {
        const { groupId, newName } = req.body;

        if (!groupId || !newName) {
            return res.status(400).json({ message: "Group ID and new name are required" });
        }

        const group = await Group.findByIdAndUpdate(groupId, { name: newName }, { new: true });

        if (!group) return res.status(404).json({ message: "Group not found" });

        res.status(200).json({ message: "Group name updated successfully", group });
    } catch (error) {
        console.error("Error in renameGroup controller:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

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

        res.status(200).json({ message: "User added to group successfully", group });
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
