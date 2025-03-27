import express from "express";
const router = express.Router();

import {
  getNonce,
  verify,
  signup,
  login,
} from "../../controllers/auth.controller.js";

router.route("/signup").post(signup);

router.route("/login").post(login);

router.route("/nonce").post(getNonce);

router.route("/verify").post(verify);

export default router;
