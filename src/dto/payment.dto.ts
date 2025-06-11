import { z } from "zod";

export const VerifyPaymentSchema = z.object({
  razorpay_payment_id: z.string().min(1, "Payment ID is required"),
  razorpay_order_id: z.string().min(1, "Order ID is required"),
  razorpay_signature: z.string().min(1, "Signature is required"),
  courseId: z.string().min(1, "Course ID is required"),
});

export type VerifyPaymentDto = z.infer<typeof VerifyPaymentSchema>;

export const CreateOrderSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  amount: z.number().min(1, "Amount must be greater than 0"),
});

export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;
