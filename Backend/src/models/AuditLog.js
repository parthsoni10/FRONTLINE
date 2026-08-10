import mongoose from 'mongoose';

const { Schema } = mongoose;

const auditLogSchema = new Schema(
  {
    messageId: { type: Schema.Types.ObjectId, ref: 'Message' },
    eventType: {
      type: String,
      required: true,
      index: true,
      enum: [
        'injection_attempt',
        'invalid_json',
        'empty_input',
        'non_english',
        'retry',
        'fallback_used',
        'low_confidence_flag',
      ],
    },
    detail: { type: String },
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
