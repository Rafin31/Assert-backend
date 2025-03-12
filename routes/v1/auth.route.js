const express = require('express');
const router = express.Router()

const authController = require('../../controllers/auth.controller');

router
    .route("/nonce")
    .post(authController.getNonce)



router
    .route("/verify")
    .post(authController.verify)


module.exports = router  