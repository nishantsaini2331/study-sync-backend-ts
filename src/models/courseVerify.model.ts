import mongoose from "mongoose";
import { ICourseVerify } from "../interfaces/courseVerify.model";

const courseVerifySchema = new mongoose.Schema<ICourseVerify>(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comment: {
      type: String,
      maxlength: 500,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const CourseVerify = mongoose.model<ICourseVerify>(
  "courseVerify",
  courseVerifySchema
);
export default CourseVerify;
