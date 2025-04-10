import express from 'express'
const router = express.Router()

import { getFixturesByDateRange } from '../../controllers/football.controller.js';
import { processFixtureResult } from '../../controllers/voting.controller.js';


router.get('/fixtures', getFixturesByDateRange)

router.post('/process-result/:fixtureId', processFixtureResult);


export default router  