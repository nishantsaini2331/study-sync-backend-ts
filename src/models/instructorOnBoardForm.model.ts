import mongoose from "mongoose";
import { IInstructorOnBoardForm } from "../interfaces/instructorOnBoardFromSchema.interface";

const instructorOnBoardFormSchema = new mongoose.Schema<IInstructorOnBoardForm>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questions: [
      {
        questionText: { type: String, required: true },
        selectedOption: { type: String, required: true },
        options: { type: [String], required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const InstructorOnBoardForm = mongoose.model<IInstructorOnBoardForm>(
  "InstructorOnBoardForm",
  instructorOnBoardFormSchema
);
export default InstructorOnBoardForm;
