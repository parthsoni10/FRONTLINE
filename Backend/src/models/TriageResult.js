import mongoose from 'mongoose';

const { Schema } = mongoose;

const triageResultSchema = new Schema(
  {
    messageId: { type: Schema.Types.ObjectId, ref: 'Message', required: true, index: true },
    rawTextSnapshot: { type: String, default: '' },
    category: {
      type: String,
      required: true,
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
    },
    priority: { type: String, required: true, enum: ['P0', 'P1', 'P2', 'P3'] },
    summary: { type: String, required: true },
    suggestedAction: { type: String, required: true },
    needsHuman: { type: Boolean, required: true },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    flagReason: { type: String, default: null },
    modelUsed: { type: String, required: true },
    promptVersion: { type: String, required: true },
    inputTokens: { type: Number, default: 0 },
    outputTokens: { type: Number, default: 0 },
    latencyMs: { type: Number, default: 0 },
    estCostUsd: { type: Number, default: 0 },
    rawModelResponse: { type: Schema.Types.Mixed },
    schemaValid: { type: Boolean, default: true },
    retryCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Append-only audit architecture - index messageId and createdAt
triageResultSchema.index({ messageId: 1, createdAt: -1 });

export const TriageResult = mongoose.model('TriageResult', triageResultSchema);
