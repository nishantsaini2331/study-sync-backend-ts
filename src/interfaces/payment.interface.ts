import { Document, Types } from "mongoose";

export interface IPayment extends Document {
  user: Types.ObjectId;
  course: Types.ObjectId;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  amount: number;
  status: "pending" | "successful" | "failed";
  currency: string;
  paymentMethod: "card" | "netbanking" | "wallet" | "upi";
  discount: number;
  createdAt: Date;
  updatedAt: Date;
}
