import { Message } from '../models/Message.js';
import { GroundTruth } from '../models/GroundTruth.js';
import { TriageResult } from '../models/TriageResult.js';
import { EvalRun } from '../models/EvalRun.js';

export async function runEvaluation() {
  const groundTruths = await GroundTruth.find().populate('messageId');
  if (groundTruths.length === 0) {
    throw new Error('No GroundTruth records found in database. Seed ground truth first.');
  }

  let categoryMatches = 0;
  let priorityMatches = 0;
  let needsHumanMatches = 0;
  let overallMatches = 0;
  let totalLatency = 0;
  let totalCost = 0;

  const disagreements = [];

  for (const gt of groundTruths) {
    // Get latest TriageResult for this message
    const latestResult = await TriageResult.findOne({ messageId: gt.messageId._id || gt.messageId })
      .sort({ createdAt: -1 });

    if (!latestResult) continue;

    const catMatch = latestResult.category === gt.category;
    const prioMatch = latestResult.priority === gt.priority;
    const humanMatch = latestResult.needsHuman === gt.needsHuman;

    if (catMatch) categoryMatches++;
    if (prioMatch) priorityMatches++;
    if (humanMatch) needsHumanMatches++;

    const isFullyCorrect = catMatch && prioMatch && humanMatch;
    if (isFullyCorrect) {
      overallMatches++;
    } else {
      disagreements.push({
        messageId: gt.externalId || gt.messageId._id.toString(),
        rawText: latestResult.rawTextSnapshot,
        predictedCategory: latestResult.category,
        actualCategory: gt.category,
        predictedPriority: latestResult.priority,
        actualPriority: gt.priority,
        predictedNeedsHuman: latestResult.needsHuman,
        actualNeedsHuman: gt.needsHuman,
      });
    }

    totalLatency += latestResult.latencyMs || 0;
    totalCost += latestResult.estCostUsd || 0;
  }

  const n = groundTruths.length;
  const evalSummary = {
    nLabeled: n,
    categoryAgreement: Number((categoryMatches / n).toFixed(4)),
    priorityAgreement: Number((priorityMatches / n).toFixed(4)),
    needsHumanAgreement: Number((needsHumanMatches / n).toFixed(4)),
    overallAgreement: Number((overallMatches / n).toFixed(4)),
    avgLatencyMs: Math.round(totalLatency / n),
    avgCostUsd: Number((totalCost / n).toFixed(6)),
    disagreements,
  };

  const evalRunDoc = await EvalRun.create({
    nLabeled: evalSummary.nLabeled,
    categoryAgreement: evalSummary.categoryAgreement,
    priorityAgreement: evalSummary.priorityAgreement,
    needsHumanAgreement: evalSummary.needsHumanAgreement,
    overallAgreement: evalSummary.overallAgreement,
    avgLatencyMs: evalSummary.avgLatencyMs,
    avgCostUsd: evalSummary.avgCostUsd,
    notes: `Evaluated ${n} labeled messages against Ground Truth dataset.`,
    disagreements: evalSummary.disagreements,
  });

  return { evalRunDoc, summary: evalSummary };
}
