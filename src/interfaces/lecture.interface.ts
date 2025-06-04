import { Document, Types } from "mongoose";

export interface ILecture extends Document {
  title: string;
  description: string;
  lectureId: string;
  videoUrl: string;
  videoId: string;
  course: Types.ObjectId;
  mcqs: Types.ObjectId[];
  requiredPassPercentage: number;
  duration: number;
  order: number;
  comments: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
