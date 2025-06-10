import express from "express";
import { auth, instructor, isInstructorOrAdmin } from "../../middlewares/auth";
import { instructorController } from "../../controllers";
const router = express.Router();

router.get(
  "/dashboard/:username",
  auth,
  isInstructorOrAdmin,
  instructorController.instructorDashboard
);
router.get(
  "/courses",
  auth,
  instructor,
  instructorController.instructorCourses
);
router.get(
  "/students-details",
  auth,
  instructor,
  instructorController.studentsDetails
);
router.get(
  "/course-detail-stats/:id",
  auth,
  instructor,
  instructorController.courseDetailStats
);
router.get(
  "/lectures/:courseId",
  auth,
  instructor,
  instructorController.getLectures
);
router.get(
  "/lecture-comments/:lectureId",
  auth,
  instructor,
  instructorController.getLectureComments
);

router.get(
  "/can-instructor-create-course",
  auth,
  instructor,
  instructorController.canInstructorCreateCourse
);

router.get(
  "/detail-course-stats/:courseId",
  auth,
  instructor,
  instructorController.courseDetailStats
);

export default router;
