import express from 'express'
const router = express.Router()


import { getAllUsers, getSingleUser } from '../../controllers/user.controller.js';


router
    .route("/")
    .get(getAllUsers)


router
    .route("/:id")
    .get(getSingleUser)


export default router  