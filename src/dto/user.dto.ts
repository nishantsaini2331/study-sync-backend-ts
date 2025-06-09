import { z } from "zod";

export const RegisterUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Email is invalid"),
  password: z.string().min(6, "Password must be 6 characters long"),
  qualification: z.string().optional(),
  isAdmin: z.boolean().optional().default(false),
});

export type RegisterUserDTO = z.infer<typeof RegisterUserSchema>;

export const LoginUserSchema = z.object({
  email: z.string().email("Email is invalid"),
  password: z.string(),
});

export type LoginUserDTO = z.infer<typeof LoginUserSchema>;

export const UpdateUserSchema = z.object({
  name: z.string().optional(),
  username: z
    .string()
    .regex(/^[a-zA-Z0-9_]{3,20}$/)
    .optional(),
  photoUrl: z.string().url().optional(),
  bio: z.string().optional(),
  headline: z.string().optional(),
  qualification: z.string().optional(),
  socials: z.string().optional(),
});

export type UpdateUserDTO = z.infer<typeof UpdateUserSchema>;

export type JWTUser = {
  id: string;
  roles: string[];
  name?: string;
  username?: string;
};

export const QuestionSchema = z.object({
  questionText: z.string({ required_error: "Question text is required" }),
  selectedOption: z.string({ required_error: "Selected option is required" }),
  options: z
    .array(z.string({ required_error: "Option must be a string" }))
    .min(1, { message: "At least one option is required" }),
});

export const OnboardFormSchema = z.object({
  questions: z
    .array(QuestionSchema, { required_error: "Questions are required" })
    .min(1, { message: "At least one question is required" }),
});

export type OnboardFormDTO = z.infer<typeof OnboardFormSchema>;

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z
      .string()
      .min(6, "Confirm Password must be at least 6 characters long"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
  });

export type ResetPasswordDTO = z.infer<typeof ResetPasswordSchema>;

export const FetchProfileSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().min(1, { message: "Email is required" }),
});

export const VerifyResetTokenSchema = z.object({
  token: z.string().min(1, { message: "Token is required" }),
});
