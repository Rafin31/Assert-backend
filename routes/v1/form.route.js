import express from 'express';
import Form from '../../model/form.model.js';
import { submitForm, getData, addReply, addLike, showAdminApproval, showAdminUpdateStatus, showParticipatedPosts } from "../../controllers/form.controller.js";

const router = express.Router();

router.post("/submit", submitForm);

router.get("/userPosts", getData);

router.put('/:id/reply', addReply);

router.put('/:id/like', addLike);

router.get("/adminApproval", showAdminApproval); // Admin approval for prediction

router.put('/updateStatus/:id', showAdminUpdateStatus);

router.get("/participatedPosts", showParticipatedPosts); // to get user predictions

export default router;





