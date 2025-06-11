import express from "express";
import { auth, student } from "../../middlewares/auth";
import { paymentController } from "../../controllers";
import { validateReqBody } from "../../middlewares/validate";
import { CreateOrderSchema, VerifyPaymentSchema } from "../../dto/payment.dto";
const router = express.Router();

router.post(
  "/create-order",
  auth,
  student,
  validateReqBody(CreateOrderSchema),
  paymentController.createOrder
);
router.post(
  "/verify-payment",
  auth,
  student,
  validateReqBody(VerifyPaymentSchema),
  paymentController.verifyPayment
);

export default router;
