import test from 'node:test';
import assert from 'node:assert/strict';
import { TriageDecisionSchema } from '../src/services/schema.js';

test('Schema: Validates correct structured triage object', () => {
  const validObj = {
    category: 'billing',
    priority: 'P1',
    summary: 'Duplicate subscription charge.',
    suggestedAction: 'Issue refund.',
    needsHuman: true,
    confidence: 0.95,
    flagReason: null,
  };

  const parsed = TriageDecisionSchema.safeParse(validObj);
  assert.equal(parsed.success, true);
});

test('Schema: Rejects invalid enum values (e.g. priority P5 or category unknown)', () => {
  const invalidObj = {
    category: 'invalid_category_name',
    priority: 'P5',
    summary: 'Test',
    suggestedAction: 'Test',
    needsHuman: false,
    confidence: 0.8,
  };

  const parsed = TriageDecisionSchema.safeParse(invalidObj);
  assert.equal(parsed.success, false);
});
