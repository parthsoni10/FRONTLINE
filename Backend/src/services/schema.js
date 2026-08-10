import { z } from 'zod';

export const CategoryEnum = z.enum([
  'billing',
  'bug',
  'complaint',
  'question',
  'account',
  'abuse_or_injection',
  'spam',
  'out_of_scope',
  'other',
]);

export const PriorityEnum = z.enum(['P0', 'P1', 'P2', 'P3']);

export const TriageDecisionSchema = z.object({
  category: CategoryEnum,
  priority: PriorityEnum,
  summary: z.string().min(1, 'Summary must not be empty'),
  suggestedAction: z.string().min(1, 'Suggested action must not be empty'),
  needsHuman: z.boolean(),
  confidence: z.number().min(0).max(1),
  flagReason: z.string().nullable().optional(),
});

/**
 * Convert Zod schema to OpenAPI / Gemini JSON Schema definition
 */
export const triageGeminiSchema = {
  type: 'OBJECT',
  properties: {
    category: {
      type: 'STRING',
      enum: [
        'billing',
        'bug',
        'complaint',
        'question',
        'account',
        'abuse_or_injection',
        'spam',
        'out_of_scope',
        'other',
      ],
      description: 'The primary classification category for the customer message.',
    },
    priority: {
      type: 'STRING',
      enum: ['P0', 'P1', 'P2', 'P3'],
      description: 'P0=Urgent Outage/Security, P1=High Financial/Bug, P2=Medium Account/Usability, P3=Low Inquiry/Spam.',
    },
    summary: {
      type: 'STRING',
      description: 'A 1-2 sentence factual summary of the message without inventing details.',
    },
    suggestedAction: {
      type: 'STRING',
      description: 'Recommended next action for customer support or automated workflows.',
    },
    needsHuman: {
      type: 'BOOLEAN',
      description: 'True if human intervention or authorization is required, false if automated response is sufficient.',
    },
    confidence: {
      type: 'NUMBER',
      description: 'Model confidence score between 0.00 and 1.00.',
    },
    flagReason: {
      type: 'STRING',
      description: 'Reason for flagging human review or null if clean.',
    },
  },
  required: ['category', 'priority', 'summary', 'suggestedAction', 'needsHuman', 'confidence'],
};
