import { z } from "zod";

export const mcqSchema = z.object({
  question: z.string().trim().min(1, { message: "Question cannot be empty" }),
  options: z
    .array(z.string().trim().min(1, "Option cannot be empty"))
    .min(2, "At least two options are required"),
  correctOption: z
    .number({ invalid_type_error: "Correct option index must be a number" })
    .int()
    .nonnegative({ message: "Correct option must be >= 0" }),
});

export const CreateQuizSchema = z.object({
  quiz: z
    .array(mcqSchema)
    .min(5, "Minimum 5 MCQs required")
    .max(20, "Maximum 20 MCQs allowed"),
});

export type CreateQuizDto = z.infer<typeof CreateQuizSchema>;

export const updateMcqSchema = z.object({
  _id: z.string().optional(), // for existing MCQs
  question: z.string().trim().min(1, "Question cannot be empty"),
  options: z
    .array(z.string().trim().min(1, "Option cannot be empty"))
    .min(2, "At least two options are required"),
  correctOption: z
    .number({ invalid_type_error: "Correct option index must be a number" })
    .int()
    .nonnegative("Correct option must be >= 0"),
});

export const UpdateQuizSchema = z.object({
  quiz: z
    .array(updateMcqSchema)
    .min(5, "Minimum 5 MCQs required")
    .max(20, "Maximum 20 MCQs allowed"),
});

export type UpdateQuizDto = z.infer<typeof UpdateQuizSchema>;
