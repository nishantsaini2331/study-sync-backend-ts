import { Document, Types } from "mongoose";
import { IUser } from "./user.interface";
import { ICourse } from "./course.interface";
import { ILecture } from "./lecture.interface";
import { IFinalQuiz } from "./finalQuiz.model";
import { IQuizAttempt } from "./quizAttempt.interface";

export interface ILectureProgress {
  lecture: Types.ObjectId | ILecture;
  quizAttempts: ({ score: number } | Types.ObjectId)[];
  isUnlocked: boolean;
  isCompleted: boolean;
}
export interface ICourseProgress extends Document {
  student: Types.ObjectId | IUser;
  course: Types.ObjectId | ICourse;
  lectureProgress: ILectureProgress[];
  currentLecture: Types.ObjectId | ILecture;
  overallProgress: number;
  isCourseFinalQuizPassed: boolean;
  finalQuizAttempts: (Types.ObjectId | IFinalQuiz)[];
  finalQuizAttemptLeft: number;
  createdAt: Date;
  updatedAt: Date;

  updateLectureProgress(
    lectureId: Types.ObjectId,
    quizAttempt: IQuizAttempt
  ): Promise<void>;
}
