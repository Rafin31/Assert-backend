import express from 'express'
const router = express.Router()



import { castVote } from '../../controllers/votingController.js';


router
    .route("/vote/castVote")
    .post(castVote)



export default router  