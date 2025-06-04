import mongoose from "mongoose";
import { IQuizAttempt } from "../interfaces/quizAttempt.interface";


const quizAttemptSchema = new mongoose.Schema<IQuizAttempt>(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lecture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    mcqResponses: [
      {
        mcq: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MCQ",
          required: true,
        },
        selectedOption: {
          textIndex: {
            type: Number,
            required: true,
          },
          isCorrect: {
            type: Boolean,
            required: true,
          },
        },
      },
    ],
    score: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    passingScore: {
      type: Number,
      default: 60,
    },
    isPassed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
const QuizAttempt = mongoose.model<IQuizAttempt>("QuizAttempt", quizAttemptSchema);

export default QuizAttempt
