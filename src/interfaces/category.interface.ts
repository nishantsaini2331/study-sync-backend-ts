import { Document, Types } from "mongoose";

export interface ICategory extends Document {
  name: string;
  description: string;
  courses: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
