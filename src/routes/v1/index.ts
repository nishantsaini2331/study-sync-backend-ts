import express from "express";
import userRoutes from "./user.routes";
import adminRoutes from "./admin.routes";
import courseRoutes from "./course.routes";
import cartRoutes from "./cart.routes";
import categoryRoutes from "./category.routes";
const router = express.Router();

router.use("/user", userRoutes);
router.use("/admin", adminRoutes);
router.use("/course", courseRoutes);
router.use("/cart", cartRoutes);
router.use("/category", categoryRoutes);

export default router;
