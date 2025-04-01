import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { sendGroupMessage, getGroupMessages } from "../controllers/groupMessage.controller.js";

const router = express.Router();

router.post("/send/:groupId", protectRoute, sendGroupMessage);
router.get("/:groupId", protectRoute, getGroupMessages);

export default router;
