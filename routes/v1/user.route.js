import express from 'express'
const router = express.Router()



import { getAllUsers, getSingleUser, claimDailyReward, createUser, addWalletAddress } from '../../controllers/user.controller.js';


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
    .post(claimDailyReward)


router
    .route("/:id")
    .get(getSingleUser)


export default router  