import express from "express";
import { auth, student } from "../../middlewares/auth";
import { reviewAndRatingController } from "../../controllers";
import { validateParams, validateReqBody } from "../../middlewares/validate";
import {
  CourseIdVerifySchema,
  CreateReviewAndRatingSchema,
  UpdateReviewAndRatingSchema,
} from "../../dto/reviewAndRating.dto";

const router = express.Router();

router.get(
  "/:courseId",
  auth,
  student,
  validateParams(CourseIdVerifySchema),
  reviewAndRatingController.getReviewAndRating
);
router.post(
  "/:courseId",
  auth,
  student,
  validateParams(CourseIdVerifySchema),
  validateReqBody(CreateReviewAndRatingSchema),
  reviewAndRatingController.addReviewAndRating
);
router.put(
  "/:courseId",
  auth,
  student,
  validateParams(CourseIdVerifySchema),
  validateReqBody(UpdateReviewAndRatingSchema),
  reviewAndRatingController.updateReviewAndRating
);
router.delete(
  "/:courseId",
  auth,
  student,
  validateParams(CourseIdVerifySchema),
  reviewAndRatingController.deleteReviewAndRating
);

export default router;
