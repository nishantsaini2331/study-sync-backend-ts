import { z } from "zod";

export const CreateReviewAndRatingSchema = z.object({
  rating: z
    .number()
    .min(1, { message: "Rating must be at least 1" })
    .max(5, { message: "Rating must be at most 5" }),
  review: z.string().trim().optional(),
});

export type CreateReviewAndRatingDto = z.infer<
  typeof CreateReviewAndRatingSchema
>;

export const CourseIdVerifySchema = z.object({
  courseId: z.string().min(1, { message: "course id is required" }),
});

export const UpdateReviewAndRatingSchema = z.object({
  rating: z
    .number()
    .min(1, { message: "Rating must be at least 1" })
    .max(5, { message: "Rating must be at most 5" })
    .optional(),
  review: z.string().trim().optional(),
});

export type UpdateReviewAndRatingDto = z.infer<
  typeof UpdateReviewAndRatingSchema
>;
