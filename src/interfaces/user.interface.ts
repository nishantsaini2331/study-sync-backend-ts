import { Document, Types } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  username: string;
  roles: ("instructor" | "student" | "admin")[];
  purchasedCourses: Types.ObjectId[];
  createdCourses: Types.ObjectId[];
  photoUrl: string;
  photoUrlId: string | null;
  socials: {
    youtube: string;
    twitter: string;
    linkedin: string;
    github: string;
    website: string;
  };
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
  cart: Types.ObjectId[];
  paymentHistory: Types.ObjectId[];
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
