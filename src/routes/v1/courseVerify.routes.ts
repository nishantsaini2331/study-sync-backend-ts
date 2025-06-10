import express from "express";
import { admin, auth, instructor } from "../../middlewares/auth";
import { courseVerifyController } from "../../controllers";
const router = express.Router();

router.post("/", auth, instructor, courseVerifyController.createCourseVerify);
router.get("/", auth, admin, courseVerifyController.getCourseVerifications);
router.patch(
  "/:courseId/:status",
  auth,
  admin,
  courseVerifyController.updateCourseVerification
);

export default router;
