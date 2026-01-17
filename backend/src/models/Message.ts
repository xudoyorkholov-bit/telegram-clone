import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  recipientId?: mongoose.Types.ObjectId;
  groupId?: mongoose.Types.ObjectId;
  content: {
    text?: string;
    mediaId?: mongoose.Types.ObjectId;
    mediaType?: 'image' | 'video' | 'audio' | 'document';
  };
  status: 'sent' | 'delivered' | 'read';
  isEdited: boolean;
  isDeleted: boolean;
  deletedFor: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
    },
    content: {
      text: { type: String, maxlength: 4096 },
      mediaId: { type: Schema.Types.ObjectId },
      mediaType: { type: String, enum: ['image', 'video', 'audio', 'document'] },
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent',
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedFor: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes
messageSchema.index({ senderId: 1, recipientId: 1, createdAt: -1 });
messageSchema.index({ groupId: 1, createdAt: -1 });
messageSchema.index({ 'content.text': 'text' });

export const Message = mongoose.model<IMessage>('Message', messageSchema);
