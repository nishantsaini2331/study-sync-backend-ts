import { Document, Types } from "mongoose";
import { IMcq } from "./mcq.interface";
import { ICourse } from "./course.interface";

export interface IFinalQuiz extends Document {
  course: ICourse | Types.ObjectId;
  mcqs: (IMcq | Types.ObjectId)[];
  createdAt: Date;
  updatedAt: Date;
}
