import express from "express";
import { homePageController } from "../../controllers";
const router = express.Router();

// router.post("/", createHomePage);

router.get("/", homePageController.getHomePage);
router.post("/categories/:categoryId", homePageController.addHomePageCategory);
router.delete(
  "/categories/:categoryId",
  homePageController.removeHomePageCategory
);

router.post(
  "/featured-courses/:courseId",
  homePageController.addHomePageCourse
);
router.delete(
  "/featured-courses/:courseId",
  homePageController.removeHomePageCourse
);

// router.put("/", updateHomePage);

export default router;
