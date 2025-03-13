import express from 'express'
const router = express.Router()



import { getAllUsers, getSingleUser, claimDailyReward, createUser, addWalletAddress, deductTokens } from '../../controllers/user.controller.js';


router
    .route("/getAllUsers")
    .get(getAllUsers)

router
    .route("/addNewUser")
    .post(createUser)

router
    .route("/add-wallet")
    .put(addWalletAddress)


router
    .route("/token/claimDailyReward")
    .put(claimDailyReward)

router
    .route("/token/deductTokens")
    .put(deductTokens)


router
    .route("/:id")
    .get(getSingleUser)


export default router  