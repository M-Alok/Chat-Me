import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
    addUserToGroup,
    createGroup,
    deleteGroup,
    getAllGroups,
    getUserGroups,
    leaveGroup,
    removeUserFromGroup,
    renameGroup,
    updateDescription,
    updateGroupProfile
} from '../controllers/groupChat.controller.js';

const router = express.Router();

router.get("/myGroups", protectRoute, getUserGroups);
router.get("/allGroups", protectRoute, getAllGroups);

router.post("/createGroup", protectRoute, createGroup);
router.put("/renameGroup", protectRoute, renameGroup);
router.put("/updateDescription", protectRoute, updateDescription);
router.put("/updateProfile", protectRoute, updateGroupProfile);
router.put("/addUser", protectRoute, addUserToGroup);
router.put("/removeUser", protectRoute, removeUserFromGroup);
router.put("/leaveGroup", protectRoute, leaveGroup);
router.delete("/deleteGroup/:groupId", protectRoute, deleteGroup);

export default router;
