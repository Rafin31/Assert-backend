import express from "express";
import { submitForm, showPoll, voteOnPoll } from "../../controllers/poll.controller.js";

const router = express.Router();

router.post("/submit", submitForm);

router.get("/poll", showPoll);

router.put("/:pollId/vote", voteOnPoll);

export default router;
