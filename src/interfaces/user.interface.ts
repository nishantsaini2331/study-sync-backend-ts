import { Document, Types } from "mongoose";
import { ICourse } from "./course.interface";
import { IPayment } from "./payment.interface";

export interface SocialInterFace {
  youtube?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  username: string;
  roles: ("instructor" | "student" | "admin")[];
  purchasedCourses: (Types.ObjectId | ICourse)[];
  createdCourses: (Types.ObjectId | ICourse)[];
  photoUrl: string;
  photoUrlId: string | null;
  socials: SocialInterFace;
  bio: string;
  headline: string;
  qualification:
    | "Secondary (10th Pass)"
    | "Higher Secondary (12th Pass)"
    | "Bachelors"
    | "Masters"
    | "PhD"
    | "Other";
  isVerified: boolean;
  googleAuth: boolean;
  courseCreateLimit: number;
  instructorOnBoardFrom: Types.ObjectId | null;
  cart: (Types.ObjectId | ICourse)[];
  paymentHistory: (Types.ObjectId | IPayment)[];
  resetPasswordToken: string | null;
  resetPasswordExpires: Date | null;
  lastPasswordChange: Date | null;
  instructorProfile: {
    totalStudents: number;
    totalCourses: number;
    totalEarnings: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
