import { Message } from '../models/Message.js';
import { TriageResult } from '../models/TriageResult.js';
import { AuditLog } from '../models/AuditLog.js';
import { classifyMessage } from '../services/classifier.js';
import { ingestMessages, computeHash } from '../services/loader.js';
import { config } from '../config/env.js';

export async function runBatchTriage(req, res) {
  try {
    const messages = await ingestMessages();
    const results = [];

    for (const msg of messages) {
      const outcome = await classifyMessage(msg.rawText);

      // Append-only TriageResult creation
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

      // Write AuditLogs if any security or validation events occurred
      if (outcome.auditLogs && outcome.auditLogs.length > 0) {
        for (const log of outcome.auditLogs) {
          await AuditLog.create({
            messageId: msg._id,
            eventType: log.eventType,
            detail: log.detail,
          });
        }
      }

      results.push(triageDoc);
    }

    res.json({
      success: true,
      processedCount: results.length,
      results,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function triageSingleMessage(req, res) {
  try {
    const { rawText, externalId } = req.body;
    if (!rawText || !rawText.trim()) {
      return res.status(400).json({ success: false, error: 'rawText is required' });
    }

    const hash = computeHash(rawText);
    let msg = await Message.findOne({ contentHash: hash });
    if (!msg) {
      msg = await Message.create({
        rawText,
        source: 'api',
        externalId: externalId || `API-${Date.now().toString().slice(-6)}`,
        contentHash: hash,
      });
    }

    const outcome = await classifyMessage(rawText);

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
      }
    }

    res.json({
      success: true,
      triageResult: triageDoc,
      auditLogs: outcome.auditLogs,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
