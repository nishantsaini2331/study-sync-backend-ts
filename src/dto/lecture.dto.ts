import { z } from "zod";

export const mcqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  options: z.array(z.string().min(1)).length(4),
  correctOption: z.number().min(0).max(3),
});

export const CreateLectureSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  requiredPassPercentage: z
    .number()
    .min(0, "Must be at least 0")
    .max(100, "Cannot exceed 100"),
  mcqs: z.array(mcqSchema),
});

export type CreateLectureDto = z.infer<typeof CreateLectureSchema>;

export const UpdateMcqSchema = z.object({
  _id: z.string().optional(),
  question: z.string().min(1),
  options: z.array(z.string().min(1)).min(2),
  correctOption: z.number().min(0),
});

export const UpdateLectureSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  requiredPassPercentage: z.number().min(0).max(100).optional(),
  mcqs: z.string().optional(),
});

export type UpdateLectureDto = z.infer<typeof UpdateLectureSchema>;
export type UpdateMcqDTO = z.infer<typeof UpdateMcqSchema>;
