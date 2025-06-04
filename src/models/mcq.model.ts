import mongoose from "mongoose";
import { IMcq } from "../interfaces/mcq.interface";

const mcqSchema = new mongoose.Schema<IMcq>(
  {
    lecture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
      default: null,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },
    question: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      required: true,
    },
    correctOption: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const MCQ = mongoose.model<IMcq>("MCQ", mcqSchema);

export default MCQ;
