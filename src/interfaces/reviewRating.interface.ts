import { Document, Types } from "mongoose";

export interface IReviewAndRating extends Document {
  student: Types.ObjectId;
  course: Types.ObjectId;
  rating: number;
  review: string;
  createdAt: Date;
  updatedAt: Date;
}
