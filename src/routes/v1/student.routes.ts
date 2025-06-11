import express from "express";
import { auth, student } from "../../middlewares/auth";
import { studentController } from "../../controllers";

const router = express.Router();

router
  .route("/:id/learn")
  .get(auth, student, studentController.getStudentCourseById);

router
  .route("/:courseId/:lectureId/unlock-lecture")
  .patch(auth, student, studentController.unlockLecture);

router.get(
  "/current-lecture/:courseId/:lectureId",
  auth,
  student,
  studentController.getCurrentLecture
);

router.post(
  "/:courseId/submit-final-quiz",
  auth,
  student,
  studentController.submitFinalQuiz
);

router.get(
  "/enrolled-course",
  auth,
  student,
  studentController.getEnrolledCourses
);
router.get("/cart-courses", auth, student, studentController.getCartCourses);
router.get("/certificates", auth, student, studentController.getCertificates);
router.get(
  "/payment-details",
  auth,
  student,
  studentController.getPaymentDetails
);
router.get("/progress/:username", auth, student, studentController.getProgress);

export default router;
