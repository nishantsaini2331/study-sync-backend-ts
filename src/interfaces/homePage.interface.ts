import { Document, Types } from "mongoose";

export interface IHomePage extends Document {
  courseCategories: Types.ObjectId[];
  featuredCourses: Types.ObjectId[];
  testimonials: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
