import { Document, Types } from "mongoose";

export interface IFinalQuiz extends Document {
  course: Types.ObjectId;
  mcqs: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
