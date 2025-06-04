import { Document, Types } from "mongoose";

export interface ICertificate extends Document {
  user: Types.ObjectId;
  course: Types.ObjectId;
  learnerName: string;
  courseName: string;
  instructorName: string;
  certificateId: string;
  issueDate: Date;
  finalQuizScore: number;
  courseCompletionDate: Date;
  status: "issued" | "revoked";
  createdAt: Date;
  updatedAt: Date;
}
