import express from "express";
const router = express.Router();

import { castVote, getUserVotes } from "../../controllers/votingController.js";

router.route("/vote/user/:userId").get(getUserVotes);
router.route("/vote/castVote").post(castVote);

export default router;
