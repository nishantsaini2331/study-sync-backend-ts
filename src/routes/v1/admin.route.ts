import express from "express";

import { auth, admin } from "../../middlewares/auth";
import { adminController, userController } from "../../controllers";

const router = express.Router();

router.get("/dashboard", auth, admin, adminController.adminDashboard);
router.get("/users", auth, admin, adminController.searchForStudentOrInstructor);
router.get("/user/:username", auth, admin, adminController.getUserData);
router.patch(
  "/user/:username/toggle-verification",
  auth,
  admin,
  adminController.userVerification
);

router.post("/users", auth, admin, userController.register);

router.get("/all-courses", auth, admin, adminController.getAllCourses);
router.get("/all-categories", auth, admin, adminController.getAllCategories);
router.get(
  "/all-testimonials",
  auth,
  admin,
  adminController.getAllTestimonials
);

module.exports = router;
