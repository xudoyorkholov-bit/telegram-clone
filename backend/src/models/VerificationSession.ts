import mongoose, { Document, Schema } from 'mongoose';

export interface IVerificationSession extends Document {
  _id: mongoose.Types.ObjectId;
  phoneNumber: string;
  code: string;
  expiresAt: Date;
  attempts: number;
  isVerified: boolean;
  createdAt: Date;
}

const verificationSessionSchema = new Schema<IVerificationSession>(
  {
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      length: 6,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-delete expired sessions
verificationSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const VerificationSession = mongoose.model<IVerificationSession>(
  'VerificationSession',
  verificationSessionSchema
);
