import mongoose, { Document, Schema } from 'mongoose';

export interface IImage extends Document {
  name: string;
  originalName: string;
  path: string;
  mimetype: string;
  size: number;
  userId: mongoose.Types.ObjectId;
  metadata?: {
    width?: number;
    height?: number;
    processingStatus: 'pending' | 'processed' | 'failed';
    processingDetails?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ImageSchema = new Schema<IImage>(
  {
    name: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    metadata: {
      width: Number,
      height: Number,
      processingStatus: {
        type: String,
        enum: ['pending', 'processed', 'failed'],
        default: 'pending'
      },
      processingDetails: String
    }
  },
  { timestamps: true }
);

export default mongoose.model<IImage>('Image', ImageSchema); 