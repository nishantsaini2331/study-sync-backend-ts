import { Document, Types } from "mongoose";
import { ICourse } from "./course.interface";

export interface ILecture extends Document {
  title: string;
  description: string;
  lectureId: string;
  videoUrl: string;
  videoId: string;
  course: Types.ObjectId | ICourse;
  mcqs: Types.ObjectId[];
  requiredPassPercentage: number;
  duration: number;
  order: number;
  comments: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
