import { config } from '../config/env.js';

// Regex patterns targeting adversarial prompt injections
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /system\s+prompt\s+(override|bypass)/i,
  /you\s+are\s+now\s+[a-z0-9_-]+/i,
  /\[admin\s+debug\s+mode\]/i,
  /freedom_gpt/i,
  /output\s+['"]access\s+granted['"]/i,
  /forget\s+your\s+system\s+prompt/i,
  /ignore\s+safety\s+guidelines/i,
];

// Spanish/French detection hints
const SPANISH_INDICATORS = /\b(hola|cobrado|factura|devolucion|gracias|por favor|problema)\b/i;
const FRENCH_INDICATORS = /\b(bonjour|siteweb|lent|aujourd'hui|problème|serveur)\b/i;
const GERMAN_INDICATORS = /\b(hallo|wir|haben|ein|problem|deutschland)\b/i;

export function runPreChecks(rawText) {
  const flags = {
    isEmpty: false,
    isInjectionAttempt: false,
    languageGuess: 'en',
    truncatedText: rawText,
    wasTruncated: false,
    auditEvents: [],
  };

  if (!rawText || rawText.trim().length === 0) {
    flags.isEmpty = true;
    flags.auditEvents.push({
      eventType: 'empty_input',
      detail: 'Message contains no readable text content.',
    });
    return flags;
  }

  // Pre-check 1: Length truncation
  if (rawText.length > 2000) {
    flags.truncatedText = rawText.slice(0, 2000);
    flags.wasTruncated = true;
  }

  // Pre-check 2: Injection Regex Detection
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(rawText)) {
      flags.isInjectionAttempt = true;
      flags.auditEvents.push({
        eventType: 'injection_attempt',
        detail: `Regex pattern matched adversarial prompt injection phrase: "${pattern.source}"`,
      });
      break;
    }
  }

  // Pre-check 3: Non-English guessing
  if (SPANISH_INDICATORS.test(rawText)) {
    flags.languageGuess = 'es';
    flags.auditEvents.push({
      eventType: 'non_english',
      detail: 'Detected Spanish language keywords.',
    });
  } else if (FRENCH_INDICATORS.test(rawText)) {
    flags.languageGuess = 'fr';
    flags.auditEvents.push({
      eventType: 'non_english',
      detail: 'Detected French language keywords.',
    });
  } else if (GERMAN_INDICATORS.test(rawText)) {
    flags.languageGuess = 'de';
    flags.auditEvents.push({
      eventType: 'non_english',
      detail: 'Detected German language keywords.',
    });
  }

  return flags;
}

export function enforcePostChecks(decision, preCheckFlags) {
  const result = { ...decision };

  // Rule 1: Pre-check injection override
  if (preCheckFlags.isInjectionAttempt) {
    result.category = 'abuse_or_injection';
    result.priority = 'P0';
    result.needsHuman = true;
    result.confidence = 1.0;
    result.flagReason = 'Security Guardrail: Prompt injection detected by pre-check regex.';
  }

  // Rule 2: Server-side confidence threshold enforcement
  if (result.confidence < config.confidenceThreshold) {
    result.needsHuman = true;
    if (!result.flagReason) {
      result.flagReason = `Low confidence score (${result.confidence.toFixed(2)} < threshold ${config.confidenceThreshold.toFixed(2)}). Escalated for human review.`;
    }
  }

  // Rule 3: Empty input handling
  if (preCheckFlags.isEmpty) {
    result.category = 'other';
    result.priority = 'P3';
    result.summary = 'Empty message received.';
    result.suggestedAction = 'Ignore or request user to provide message content.';
    result.needsHuman = false;
    result.confidence = 0.0;
    result.flagReason = 'Empty payload pre-check.';
  }

  return result;
}
