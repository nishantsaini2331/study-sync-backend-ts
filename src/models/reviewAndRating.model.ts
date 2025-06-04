import mongoose from "mongoose";
import { IReviewAndRating } from "../interfaces/reviewRating.interface";

const reviewAndRatingSchema = new mongoose.Schema<IReviewAndRating>(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);
const ReviewAndRating = mongoose.model<IReviewAndRating>(
  "ReviewAndRating",
  reviewAndRatingSchema
);
export default ReviewAndRating;
