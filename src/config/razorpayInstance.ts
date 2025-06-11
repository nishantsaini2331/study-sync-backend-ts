import Razorpay from "razorpay";
import { serverConfig } from "./serverConfig";

const razorpayInstance = new Razorpay({
  key_id: serverConfig.RAZORPAY_KEY_ID,
  key_secret: serverConfig.RAZORPAY_SECRET,
});

export default razorpayInstance;
