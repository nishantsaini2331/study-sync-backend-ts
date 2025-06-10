import { Document, Model, Types } from "mongoose";
import { IUser } from "./user.interface";
import { ICourse } from "./course.interface";
import { IQuizAttempt } from "./quizAttempt.interface";
import { JWTUser } from "../dto/user.dto";

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

export interface ICertificateModel extends Model<ICertificate> {
  generateCertificate(
    student: JWTUser,
    course: ICourse,
    quizAttempt: IQuizAttempt
  ): Promise<{
    success: boolean;
    message: string;
    certificateId?: string;
    certificate?: ICertificate;
  }>;
}
