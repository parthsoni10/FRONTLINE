import express from 'express';
import { executeEvalRun, getLatestEvalRun } from '../controllers/evalController.js';

const router = express.Router();

router.post('/run', executeEvalRun);
router.get('/latest', getLatestEvalRun);

export default router;
