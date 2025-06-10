import express from "express";
import { auth, instructor } from "../../middlewares/auth";
import { finalQuizController } from "../../controllers";
import { validateReqBody } from "../../middlewares/validate";
import { CreateQuizSchema, UpdateQuizSchema } from "../../dto/finalQuiz.dto";

const router = express.Router();

router.post(
  "/:courseId",
  auth,
  instructor,
  validateReqBody(CreateQuizSchema),
  finalQuizController.createFinalQuiz
);
router.get("/:courseId", auth, instructor, finalQuizController.getFinalQuiz);
router.put(
  "/:courseId",
  auth,
  instructor,
  validateReqBody(UpdateQuizSchema),
  finalQuizController.updateFinalQuiz
);

export default router;
