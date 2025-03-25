import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getSearchedUsers } from '../controllers/user.controller.js';

const router = express.Router();

router.get('/', protectRoute, getSearchedUsers);

export default router;