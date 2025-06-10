import express from "express";
import { cartController } from "../../controllers";
import { auth, student } from "../../middlewares/auth";

const router = express.Router();

router.post("/:courseId", auth, student, cartController.addToCart);

router.delete("/:courseId", auth, student, cartController.removeFromCart);

export default router;
