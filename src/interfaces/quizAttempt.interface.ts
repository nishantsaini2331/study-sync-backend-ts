import { Document, Types } from "mongoose";

export interface IQuizAttempt extends Document {
  student: Types.ObjectId;
  lecture: Types.ObjectId;
  course: Types.ObjectId;
  mcqResponses: [
    {
      mcq: Types.ObjectId;
      selectedOption: {
        textIndex: number;
        isCorrect: boolean;
      };
    }
  ];
  score: number;
  totalQuestions: number;
  passingScore: number;
  isPassed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
