import { z } from "zod";

export const CreateCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
});

export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>;

export const UpdateCategorySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

export type UpdateCategoryDto = z.infer<typeof UpdateCategorySchema>;
