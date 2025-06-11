import express from "express";
import upload from "../../utils/multer";
import { auth, instructor } from "../../middlewares/auth";
import { lectureController } from "../../controllers";
import { validateReqBody } from "../../middlewares/validate";
import {
  CreateLectureSchema,
  UpdateLectureSchema,
} from "../../dto/lecture.dto";
import { preprocessLectureBody } from "../../middlewares/preprocessLectureBody";
const router = express.Router();

router.post(
  "/:id",
  auth,
  instructor,
  upload.single("video"),
  preprocessLectureBody,
  validateReqBody(CreateLectureSchema),
  lectureController.createLecture
);

router.get("/:id", auth, instructor, lectureController.getLecture);

router.patch(
  "/:id",
  auth,
  instructor,
  upload.single("video"),
  validateReqBody(UpdateLectureSchema),
  lectureController.updateLecture
);

router.delete("/:id", auth, instructor, lectureController.deleteLecture);

export default router;
