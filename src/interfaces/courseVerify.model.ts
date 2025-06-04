import { Document, Types } from "mongoose";

export interface ICourseVerify extends Document {
  course: Types.ObjectId;
  instructor: Types.ObjectId;
  comment: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: Date;
  approvedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
