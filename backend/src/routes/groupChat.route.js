import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { addUserToGroup, createGroup, getAllGroups, getMyGroups, removeUserFromGroup, renameGroup, updateGroupProfile } from '../controllers/groupChat.controller.js';

const router = express.Router();

router.get("/myGroups", protectRoute, getMyGroups);
router.get("/allGroups", protectRoute, getAllGroups);

router.post("/createGroup", protectRoute, createGroup);
router.put("/renameGroup", protectRoute, renameGroup);
router.put("/updateProfile", protectRoute, updateGroupProfile);
router.put("/addUser", protectRoute, addUserToGroup);
router.put("/removeUser", protectRoute, removeUserFromGroup);

export default router;
