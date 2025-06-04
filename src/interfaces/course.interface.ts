import { Document, Types } from "mongoose";
import { IUser } from "./user.interface";

export interface ICourse extends Document {
  title: string;
  description: string;
  courseId: string;
  minimumSkill: "beginner" | "intermediate" | "advanced";
  instructor: IUser | Types.ObjectId;
  enrolledStudents: Types.ObjectId[];
  price: number;
  thumbnail: string;
  thumbnailId: string;
  previewVideo: string;
  previewVideoId: string;
  tags: string[];
  language: string;
  totalDuration?: number;
  totalLectures?: number;
  lectures: Types.ObjectId[];
  finalQuiz: Types.ObjectId;
  requiredCompletionPercentage: number;
  status: "draft" | "published" | "under review" | "rejected";
  courseVerification: Types.ObjectId | null;
  category: Types.ObjectId;

  whatYouWillLearn: string[];
  reviewAndRating: Types.ObjectId[];
  courseStats: {
    totalStudents: number;
    totalRevenue: number;
  };
  createdAt: Date;
  updatedAt: Date;

  canGetCertificate(userId: Types.ObjectId): Promise<boolean>;
}
