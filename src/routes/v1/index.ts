import express from "express";
import userRoutes from "./user.routes";
import adminRoutes from "./admin.routes";
import courseRoutes from "./course.routes";
import cartRoutes from "./cart.routes";
import categoryRoutes from "./category.routes";
import certificateRoutes from "./certificate.routes";
import commentRoutes from "./comment.routes";
import courseVerifyRoutes from "./courseVerify.routes";
import finalQuizRoutes from "./finalQuiz.routes";
import homePageRoutes from "./homePage.routes";
import instructorRoutes from "./instructor.routes";
import studentRoutes from "./student.routes";
import lectureRoutes from "./lecture.routes";

const router = express.Router();

router.use("/user", userRoutes);
router.use("/admin", adminRoutes);
router.use("/course", courseRoutes);
router.use("/cart", cartRoutes);
router.use("/category", categoryRoutes);
router.use("/certificate", certificateRoutes);
router.use("/comment", commentRoutes);
router.use("/course-verify", courseVerifyRoutes);
router.use("/final-quiz", finalQuizRoutes);
router.use("/home-page", homePageRoutes);
router.use("/instructor", instructorRoutes);
router.use("/student", studentRoutes);
router.use("/lecture", lectureRoutes);

export default router;
