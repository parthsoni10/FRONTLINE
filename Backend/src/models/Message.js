import mongoose from 'mongoose';

const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    externalId: { type: String },
    rawText: { type: String, default: '' },
    source: { type: String, default: 'dataset', enum: ['dataset', 'api', 'manual'] },
    languageGuess: { type: String, default: 'en' },
    contentHash: { type: String, required: true, unique: true, index: true },
    receivedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Message = mongoose.model('Message', messageSchema);
