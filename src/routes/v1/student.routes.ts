const express = require("express");

const router = express.Router();

const { auth, student } = require("../middlewares/auth");
const {
  getStudentCourseById,
  unlockLecture,
  getCurrentLecture,
  submitFinalQuiz,
  getEnrolledCourses,
  getCartCourses,
  getCertificates,
  getPaymentDetails,
  getProgress,
} = require("../controllers/student.controller");

router.route("/:id/learn").get(auth, student, getStudentCourseById);

router
  .route("/:courseId/:lectureId/unlock-lecture")
  .patch(auth, student, unlockLecture);

router.get(
  "/current-lecture/:courseId/:lectureId",
  auth,
  student,
  getCurrentLecture
);

router.post("/:courseId/submit-final-quiz", auth, student, submitFinalQuiz);

router.get("/enrolled-course", auth, student, getEnrolledCourses);
router.get("/cart-courses", auth, student, getCartCourses);
router.get("/certificates", auth, student, getCertificates);
router.get("/payment-details", auth, student, getPaymentDetails);
router.get("/progress/:username", auth, student, getProgress);

export default router;