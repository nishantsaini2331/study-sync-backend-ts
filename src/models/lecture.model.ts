import mongoose from "mongoose";
import { ILecture } from "../interfaces/lecture.interface";

const lectureSchema = new mongoose.Schema<ILecture>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    lectureId: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    videoId: {
      type: String,
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    mcqs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MCQ",
      },
    ],
    requiredPassPercentage: {
      type: Number,
      default: 60,
      min: 0,
      max: 100,
    },

    duration: {
      type: Number, // duration in minutes
      required: true,
    },
    order: {
      type: Number,
      //   required: true,
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  { timestamps: true }
);

const Lecture = mongoose.model<ILecture>("Lecture", lectureSchema);
export default Lecture;
