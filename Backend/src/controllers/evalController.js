import { runEvaluation } from '../services/evaluator.js';
import { EvalRun } from '../models/EvalRun.js';

export async function executeEvalRun(req, res) {
  try {
    const { evalRunDoc, summary } = await runEvaluation();
    res.json({
      success: true,
      evalRun: evalRunDoc,
      summary,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getLatestEvalRun(req, res) {
  try {
    const latest = await EvalRun.findOne().sort({ runAt: -1 });
    if (!latest) {
      return res.status(404).json({ success: false, message: 'No evaluation runs recorded yet.' });
    }
    res.json({
      success: true,
      evalRun: latest,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
