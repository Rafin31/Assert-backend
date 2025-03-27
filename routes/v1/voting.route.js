import express from 'express'
const router = express.Router()



import { castVote, getUserVotes } from '../../controllers/votingController.js';


router
    .route("/vote/castVote")
    .post(castVote)


router
    .route("/vote/:id")
    .get(getUserVotes)



export default router  