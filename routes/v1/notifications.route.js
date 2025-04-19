import express from "express";
const router = express.Router();

import { createNotification, list, markAllRead } from "../../controllers/notifications.controller.js";


router.post("/", createNotification);
router.post("/getUserNotification", list);
router.patch("/read", markAllRead);

export default router;
