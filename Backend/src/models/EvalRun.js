import mongoose from 'mongoose';

const { Schema } = mongoose;

const evalRunSchema = new Schema(
  {
    runAt: { type: Date, default: Date.now },
    nLabeled: { type: Number, required: true },
    categoryAgreement: { type: Number, required: true },
    priorityAgreement: { type: Number, required: true },
    needsHumanAgreement: { type: Number, required: true },
    overallAgreement: { type: Number, required: true },
    avgLatencyMs: { type: Number, default: 0 },
    avgCostUsd: { type: Number, default: 0 },
    notes: { type: String },
    disagreements: [
      {
        messageId: { type: String },
        rawText: { type: String },
        predictedCategory: { type: String },
        actualCategory: { type: String },
        predictedPriority: { type: String },
        actualPriority: { type: String },
        predictedNeedsHuman: { type: Boolean },
        actualNeedsHuman: { type: Boolean },
      },
    ],
  },
  { timestamps: true }
);

export const EvalRun = mongoose.model('EvalRun', evalRunSchema);
