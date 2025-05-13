import express from "express";
const router = express.Router();

import { castVote, getUserVotes, getPredictionCount } from "../../controllers/voting.controller.js";

router.route("/vote/user/:userId").get(getUserVotes);
router.route("/vote/castVote").post(castVote);
router.route("/getPredictionCount/:userId").get(getPredictionCount);


export default router;
