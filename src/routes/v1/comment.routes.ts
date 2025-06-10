import express from "express";
import {
  auth,
  instructor,
  isInstructorOrStudent,
  student,
} from "../../middlewares/auth";
import { commentController } from "../../controllers";
const router = express.Router();

router.post(
  "/:lectureId",
  auth,
  isInstructorOrStudent,
  commentController.addComment
);
router.delete(
  "/:id",
  auth,
  isInstructorOrStudent,
  commentController.deleteComment
);
router.put("/:id", auth, student, commentController.editComment);
router.patch("/:id", auth, student, commentController.likeDislikeComment);
router.post(
  "/reply/:id",
  auth,
  isInstructorOrStudent,
  commentController.addNestedComment
);
router.patch("/pin/:id", auth, instructor, commentController.pinComment);

export default router;
