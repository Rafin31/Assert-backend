import express from 'express'
const router = express.Router()

import {
    getNonce,
    verify
} from '../../controllers/auth.controller.js';

router
    .route("/nonce")
    .post(getNonce)

router
    .route("/verify")
    .post(verify)

export default router  