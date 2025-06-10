import { Document, Types } from "mongoose";
import { IUser } from "./user.interface";
import { IReviewAndRating } from "./reviewRating.interface";
import { IFinalQuiz } from "./finalQuiz.model";
import { ICategory } from "./category.interface";
import { ILecture } from "./lecture.interface";

export interface ICourse extends Document {
  title: string;
  description: string;
  courseId: string;
  minimumSkill: "beginner" | "intermediate" | "advanced";
  instructor: IUser | Types.ObjectId;
  enrolledStudents: (Types.ObjectId | IUser)[];
  price: number;
  thumbnail: string;
  thumbnailId: string;
  previewVideo: string;
  previewVideoId: string;
  tags: string[];
  language: string;
  totalDuration?: number;
  totalLectures?: number;
  lectures: (Types.ObjectId | ILecture)[];
  finalQuiz: Types.ObjectId | IFinalQuiz;
  requiredCompletionPercentage: number;
  status: "draft" | "published" | "under review" | "rejected";
  courseVerification: Types.ObjectId | null;
  category: Types.ObjectId | ICategory;

  whatYouWillLearn: string[];
  reviewAndRating: (Types.ObjectId | IReviewAndRating)[];
  courseStats: {
    totalStudents: number;
    totalRevenue: number;
  };
  createdAt: Date;
  updatedAt: Date;

  canGetCertificate(userId: Types.ObjectId): Promise<boolean>;
}
