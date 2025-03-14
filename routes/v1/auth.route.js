import express from 'express'
const router = express.Router()

import {
    getNonce,
    verify,
    signup
} from '../../controllers/auth.controller.js';

router
    .route("/signup")
    .post(signup)

router
    .route("/nonce")
    .post(getNonce)

router
    .route("/verify")
    .post(verify)

export default router  