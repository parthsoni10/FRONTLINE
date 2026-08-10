import express from 'express';
import { getTriageResults, getResultDetail } from '../controllers/resultsController.js';

const router = express.Router();

router.get('/', getTriageResults);
router.get('/:id', getResultDetail);

export default router;
