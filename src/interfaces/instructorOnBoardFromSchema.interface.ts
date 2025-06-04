import { Document, Types } from "mongoose";

export interface IInstructorOnBoardForm extends Document {
  userId: Types.ObjectId;
  questions: [
    {
      questionText: string;
      selectedOption: string;
      options: String[];
    }
  ];
  createdAt: Date;
  updatedAt: Date;
}
