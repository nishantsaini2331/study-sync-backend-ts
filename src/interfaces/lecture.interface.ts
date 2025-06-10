import { Document, Types } from "mongoose";
import { ICourse } from "./course.interface";
import { IComment } from "./comment.interface";
import { IMcq } from "./mcq.interface";

export interface ILecture extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  lectureId: string;
  videoUrl: string;
  videoId: string;
  course: Types.ObjectId | ICourse;
  mcqs: (IMcq | Types.ObjectId)[];
  requiredPassPercentage: number;
  duration: number;
  order: number;
  comments: (IComment | Types.ObjectId)[];
  createdAt: Date;
  updatedAt: Date;
}
