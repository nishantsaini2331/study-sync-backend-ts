import mongoose from "mongoose";
import { IFinalQuiz } from "../interfaces/finalQuiz.model";

const finalQuizSchema = new mongoose.Schema<IFinalQuiz>(
  {
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
  },
  { timestamps: true }
);

const FinalQuiz = mongoose.model<IFinalQuiz>("FinalQuiz", finalQuizSchema);

export default FinalQuiz;
