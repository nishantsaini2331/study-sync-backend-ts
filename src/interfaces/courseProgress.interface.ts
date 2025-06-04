import { Document, Types } from "mongoose";

export interface ILectureProgress {
  lecture: Types.ObjectId;
  quizAttempts: Types.ObjectId[];
  isUnlocked: boolean;
  isCompleted: boolean;
}
export interface ICourseProgress extends Document {
  student: Types.ObjectId;
  course: Types.ObjectId;
  lectureProgress: ILectureProgress[];
  currentLecture: Types.ObjectId;
  overallProgress: number;
  isCourseFinalQuizPassed: boolean;
  finalQuizAttempts: Types.ObjectId[];
  finalQuizAttemptLeft: number;
  createdAt: Date;
  updatedAt: Date;
}
