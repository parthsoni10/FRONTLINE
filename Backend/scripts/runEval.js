import { connectDB } from '../src/config/db.js';
import { runEvaluation } from '../src/services/evaluator.js';

async function main() {
  console.log('====================================================');
  console.log('    FRONTLINE TRIAGE AI — GROUND TRUTH EVALUATOR    ');
  console.log('====================================================\n');

  await connectDB();

  console.log('Executing evaluation against 10 hand-labeled gold standard rows...\n');

  const { summary } = await runEvaluation();

  console.log('====================================================');
  console.log('             EVALUATION SCORECARD RESULTS           ');
  console.log('====================================================');
  console.log(`Labeled Dataset Size:   ${summary.nLabeled}`);
  console.log(`Overall Agreement:     ${(summary.overallAgreement * 100).toFixed(1)}%`);
  console.log(`Category Agreement:    ${(summary.categoryAgreement * 100).toFixed(1)}%`);
  console.log(`Priority Agreement:    ${(summary.priorityAgreement * 100).toFixed(1)}%`);
  console.log(`Needs Human Agreement: ${(summary.needsHumanAgreement * 100).toFixed(1)}%`);
  console.log(`Average Latency:       ${summary.avgLatencyMs} ms`);
  console.log(`Average Cost / Msg:    $${summary.avgCostUsd.toFixed(6)} USD`);
  console.log('----------------------------------------------------\n');

  if (summary.disagreements.length > 0) {
    console.log('--- DETAILED DISAGREEMENT BREAKDOWN ---');
    summary.disagreements.forEach((d, idx) => {
      console.log(`\nDisagreement #${idx + 1} [${d.messageId}]:`);
      console.log(`Message: "${d.rawText}"`);
      console.log(`Category:  Predicted=${d.predictedCategory}  vs  Actual=${d.actualCategory}`);
      console.log(`Priority:  Predicted=${d.predictedPriority}  vs  Actual=${d.actualPriority}`);
      console.log(`NeedsHuman: Predicted=${d.predictedNeedsHuman}  vs  Actual=${d.actualNeedsHuman}`);
    });
  } else {
    console.log('✓ PERFECT 100% MATCH across all ground truth cases!');
  }

  console.log('\n====================================================\n');
  process.exit(0);
}

main().catch((err) => {
  console.error('Evaluation failed:', err);
  process.exit(1);
});
