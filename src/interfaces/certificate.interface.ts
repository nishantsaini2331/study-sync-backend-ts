import { Document, Types } from "mongoose";
import { IUser } from "./user.interface";
import { ICourse } from "./course.interface";

export interface ICertificate extends Document {
  user: Types.ObjectId | IUser;
  course: Types.ObjectId | ICourse;
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
