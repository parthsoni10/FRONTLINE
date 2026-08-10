import { connectDB } from '../src/config/db.js';
import { Message } from '../src/models/Message.js';
import { TriageResult } from '../src/models/TriageResult.js';
import { AuditLog } from '../src/models/AuditLog.js';
import { classifyMessage } from '../src/services/classifier.js';
import { ingestMessages } from '../src/services/loader.js';
import { config } from '../src/config/env.js';

async function main() {
  console.log('====================================================');
  console.log('   FRONTLINE TRIAGE AI — CLI BATCH PROCESSOR       ');
  console.log('====================================================\n');

  await connectDB();

  console.log('Fetching raw customer messages dataset...');
  const messages = await ingestMessages();
  console.log(`Loaded ${messages.length} messages for classification.\n`);

  const summaryTable = [];
  let totalLatency = 0;
  let totalCost = 0;
  let injectionCount = 0;

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    process.stdout.write(`[${i + 1}/${messages.length}] Triaging ${msg.externalId || msg._id}... `);

    const outcome = await classifyMessage(msg.rawText);

    // Persist result (append-only)
    const triageDoc = await TriageResult.create({
      messageId: msg._id,
      rawTextSnapshot: msg.rawText,
      category: outcome.decision.category,
      priority: outcome.decision.priority,
      summary: outcome.decision.summary,
      suggestedAction: outcome.decision.suggestedAction,
      needsHuman: outcome.decision.needsHuman,
      confidence: outcome.decision.confidence,
      flagReason: outcome.decision.flagReason || null,
      modelUsed: outcome.modelUsed,
      promptVersion: config.promptVersion,
      inputTokens: outcome.inputTokens,
      outputTokens: outcome.outputTokens,
      latencyMs: outcome.latencyMs,
      estCostUsd: outcome.estCostUsd,
      rawModelResponse: outcome.rawModelResponse,
      schemaValid: outcome.schemaValid,
      retryCount: outcome.retryCount,
    });

    if (outcome.auditLogs && outcome.auditLogs.length > 0) {
      for (const log of outcome.auditLogs) {
        await AuditLog.create({
          messageId: msg._id,
          eventType: log.eventType,
          detail: log.detail,
        });
        if (log.eventType === 'injection_attempt') injectionCount++;
      }
    }

    totalLatency += outcome.latencyMs;
    totalCost += outcome.estCostUsd;

    summaryTable.push({
      ID: msg.externalId || `MSG-${i + 1}`,
      Category: outcome.decision.category,
      Priority: outcome.decision.priority,
      'Needs Human': outcome.decision.needsHuman ? 'YES ⚠️' : 'No',
      Conf: `${(outcome.decision.confidence * 100).toFixed(0)}%`,
      Latency: `${outcome.latencyMs}ms`,
      Message: msg.rawText.length > 45 ? `${msg.rawText.slice(0, 42)}...` : msg.rawText,
    });

    console.log(`[OK] (${outcome.decision.category} / ${outcome.decision.priority})`);
  }

  console.log('\n====================================================');
  console.log('              TRIAGE BATCH RESULTS TABLE            ');
  console.log('====================================================');
  console.table(summaryTable);

  console.log('\n--- BATCH RUN SUMMARY STATS ---');
  console.log(`Total Messages Processed: ${messages.length}`);
  console.log(`Average Latency: ${Math.round(totalLatency / messages.length)} ms`);
  console.log(`Total Estimated Cost: $${totalCost.toFixed(6)} USD`);
  console.log(`Prompt Injections Caught: ${injectionCount}`);
  console.log(`Needs Human Intervention: ${summaryTable.filter((r) => r['Needs Human'].includes('YES')).length}/${messages.length}`);
  console.log('--------------------------------\n');

  process.exit(0);
}

main().catch((err) => {
  console.error('Batch execution failed:', err);
  process.exit(1);
});
