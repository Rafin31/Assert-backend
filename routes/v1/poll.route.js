import express from "express";
import { submitForm, showPoll, voteOnPoll, showParticipatedPolls, showAdminApprovalPoll, showAdminUpdateStatusPoll } from "../../controllers/poll.controller.js";

const router = express.Router();

router.post("/submit", submitForm);

router.get("/poll", showPoll);

router.put("/:pollId/vote", voteOnPoll);

router.get("/participatedPolls", showParticipatedPolls); // to get user polls

router.get("/adminApprovalPoll", showAdminApprovalPoll); // Admin approval for poll

router.put('/updateStatus/:id', showAdminUpdateStatusPoll);

export default router;
