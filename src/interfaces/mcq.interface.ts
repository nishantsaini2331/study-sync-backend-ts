import { Types } from "mongoose";
import { Document } from "mongoose";

export interface IMcq extends Document {
  _id: Types.ObjectId;
  lecture: Types.ObjectId;
  course: Types.ObjectId;
  question: string;
  options: string[];
  correctOption: number;
  createdAt: Date;
  updatedAt: Date;
}
