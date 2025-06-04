import { Document, Types } from "mongoose";

export interface IComment extends Document {
  comment: string;
  lecture: Types.ObjectId;
  course: Types.ObjectId;
  student: Types.ObjectId;
  likes: Types.ObjectId[];
  replies: Types.ObjectId[];
  parentComment: Types.ObjectId;
  isPinned: boolean;
  isInstructor: boolean;
  createdAt: Date;
  updatedAt: Date;
}
