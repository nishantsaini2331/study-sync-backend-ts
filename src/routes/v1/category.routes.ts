import express from "express";
import { admin, auth } from "../../middlewares/auth";
import { categoryController } from "../../controllers";
import { validateReqBody } from "../../middlewares/validate";
import {
  CreateCategorySchema,
  UpdateCategorySchema,
} from "../../dto/category.dto";

const router = express.Router();

router
  .route("/")
  .post(
    auth,
    admin,
    validateReqBody(CreateCategorySchema),
    categoryController.createCategory
  )
  .get(auth, categoryController.showAllCategoriesName);

router.get("/all", auth, admin, categoryController.showAllCategories);

router
  .route("/:id")
  .put(
    auth,
    admin,
    validateReqBody(UpdateCategorySchema),
    categoryController.updateCategory
  )
  .delete(auth, admin, categoryController.deleteCategory);


export default router;
