import express from 'express'
const router = express.Router()

import { getFixturesByDateRange } from '../../controllers/football.controller.js';


router
    .route("/fixtures")
    .get(getFixturesByDateRange)

export default router  