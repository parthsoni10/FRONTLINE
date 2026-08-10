import mongoose from 'mongoose';

const { Schema } = mongoose;

const groundTruthSchema = new Schema(
  {
    messageId: { type: Schema.Types.ObjectId, ref: 'Message', required: true, unique: true },
    externalId: { type: String },
    category: { type: String, required: true },
    priority: { type: String, required: true },
    needsHuman: { type: Boolean, required: true },
    labeledBy: { type: String, default: 'human' },
    notes: { type: String },
  },
  { timestamps: true }
);

export const GroundTruth = mongoose.model('GroundTruth', groundTruthSchema);
