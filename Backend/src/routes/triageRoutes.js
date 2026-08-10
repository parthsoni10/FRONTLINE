import express from 'express';
import { runBatchTriage, triageSingleMessage } from '../controllers/triageController.js';

const router = express.Router();

router.post('/batch', runBatchTriage);
router.post('/single', triageSingleMessage);

export default router;
