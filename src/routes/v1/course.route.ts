import express from "express";
import { courseController } from "../../controllers";
import upload from "../../utils/multer";
import {
  auth,
  instructor,
  admin,
  isInstructorOrAdmin,
} from "../../middlewares/auth";
import { validateReqBody } from "../../middlewares/validate";
import { CreateCourseSchema, UpdateCourseSchema } from "../../dto/course.dto";

const router = express.Router();

router.post(
  "/",
  auth,
  instructor,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "previewVideo", maxCount: 1 },
  ]),
  validateReqBody(CreateCourseSchema),
  courseController.createCourse
);

router.get("/search", courseController.getCoursesBySearchQuery);

router.get(
  "/check-enrolled/:id",
  auth,
  courseController.checkStudentEnrollment
);

router.get(
  "/check-instructor/:id",
  auth,
  instructor,
  courseController.checkInstructor
);

router.get("/", auth, instructor, courseController.getCourses);

router.get("/:id", auth, isInstructorOrAdmin, courseController.getCourse); // this is for instructor
router.get("/public/:id", courseController.getCourseForStudent); // this is for student

router.patch(
  "/:id",
  auth,
  instructor,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "previewVideo", maxCount: 1 },
  ]),
  validateReqBody(UpdateCourseSchema),
  courseController.updateCourse
);

router.delete("/:id", auth, instructor, courseController.deleteCourse);

module.exports = router;
