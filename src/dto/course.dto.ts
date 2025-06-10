import { z } from "zod";

export const CreateCourseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().min(0, "Price must be a non-negative number"),
  minimumSkill: z.enum(["beginner", "intermediate", "advanced"], {
    message: "Minimum skill required",
  }),
  language: z.string().min(1, "Language is required"),
  requiredCompletionPercentage: z.coerce
    .number()
    .min(0, "Required completion percentage must be at least 0")
    .max(100, "Required completion percentage cannot exceed 100"),
  category: z.string().min(1, "Category is required"),
  whatYouWillLearn: z
    .string()
    .min(1, "What you will learn is required")
    .transform((str, ctx) => {
      try {
        const parsed = JSON.parse(str);
        if (!Array.isArray(parsed)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "What you will learn must be an array",
          });
          return z.NEVER;
        }
        return parsed;
      } catch (e) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid JSON format for what you will learn",
        });
        return z.NEVER;
      }
    })
    .pipe(
      z
        .array(z.string().min(1, "Each learning point must not be empty"))
        .min(1, "What you will learn must have at least one item")
        .max(7, "What you will learn should not have more than 7 items")
    ),
  tags: z
    .string()
    .min(1, "Tags are required")
    .transform((str, ctx) => {
      try {
        const parsed = JSON.parse(str);
        if (!Array.isArray(parsed)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Tags must be an array",
          });
          return z.NEVER;
        }
        return parsed;
      } catch (e) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid JSON format for tags",
        });
        return z.NEVER;
      }
    })
    .pipe(
      z
        .array(z.string().min(1, "Each tag must not be empty"))
        .min(1, "At least one tag is required")
    ),
});

export type CreateCourseDto = z.infer<typeof CreateCourseSchema>;

export const UpdateCourseSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  price: z.coerce
    .number()
    .min(0, "Price must be a non-negative number")
    .optional(),
  minimumSkill: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  language: z.string().min(1, "Language is required").optional(),
  requiredCompletionPercentage: z.coerce
    .number()
    .min(0, "Required completion percentage must be at least 0")
    .max(100, "Required completion percentage cannot exceed 100")
    .optional(),
  category: z.string().min(1, "Category is required").optional(),
  whatYouWillLearn: z
    .string()
    .transform((str, ctx) => {
      try {
        const parsed = JSON.parse(str);
        if (!Array.isArray(parsed)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "What you will learn must be an array",
          });
          return z.NEVER;
        }
        return parsed;
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid JSON format for what you will learn",
        });
        return z.NEVER;
      }
    })
    .pipe(
      z
        .array(z.string().min(1, "Each learning point must not be empty"))
        .min(1, "What you will learn must have at least one item")
        .max(7, "What you will learn should not have more than 7 items")
    )
    .optional(),
  tags: z
    .string()
    .transform((str, ctx) => {
      try {
        const parsed = JSON.parse(str);
        if (!Array.isArray(parsed)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Tags must be an array",
          });
          return z.NEVER;
        }
        return parsed;
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid JSON format for tags",
        });
        return z.NEVER;
      }
    })
    .pipe(
      z
        .array(z.string().min(1, "Each tag must not be empty"))
        .min(1, "At least one tag is required")
    )
    .optional(),
});

export type UpdateCourseDto = z.infer<typeof UpdateCourseSchema>;
