const express = require('express');
const router = express.Router()


const userController = require('../../controllers/user.controller');


router
    .route("/")
    .get(userController.getAllUsers)
    .post()

router
    .route("/:id")
    .get(userController.getSingleUser)
    .post()


module.exports = router  