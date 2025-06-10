import { NextFunction, Request, Response } from "express";

import Category from "../models/category.model";
import Course from "../models/course.model";
import { CreateCategoryDto, UpdateCategoryDto } from "../dto/category.dto";
import { serverConfig } from "../config/serverConfig";

async function createCategory(
  req: Request<{}, {}, CreateCategoryDto>,
  res: Response,
  next: NextFunction
) {
  try {
    const { name, description } = req.body;

    const category = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (category) {
      res
        .status(400)
        .json({ success: false, message: "Category already exists" });
      return;
    }

    const CategorysDetails = await Category.create({
      name,
      description,
    });

    res.status(200).json({
      success: true,
      message: "Category Created Successfully",
      category: CategorysDetails,
    });
    return;
  } catch (error) {
    next(error);
  }
}

async function showAllCategories(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const allCategories = await Category.find({});
    res.status(200).json({
      success: true,
      categories: allCategories,
    });
    return;
  } catch (error) {
    next(error);
  }
}

async function showAllCategoriesName(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const allCategories = await Category.find({});

    let cate = allCategories.map((c) => c.name);
    res.status(200).json({
      success: true,
      categories: cate,
    });
    return;
  } catch (error) {
    next(error);
  }
}

async function updateCategory(
  req: Request<{ id: string }, {}, UpdateCategoryDto>,
  res: Response,
  next: NextFunction
) {
  try {
    const { name, description } = req.body;
    const categoryId = req.params.id;
    const category = await Category.findById(categoryId);
    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }
    category.name = name || category.name;
    category.description = description || category.description;
    await category.save();
    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
    return;
  } catch (error) {
    next(error);
  }
}

async function deleteCategory(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const categoryId = req.params.id;

    const category = await Category.findByIdAndDelete(categoryId);

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }

    await Course.updateMany(
      { category: categoryId },
      { $set: { category: serverConfig.DEFAULT_CATEGORY_ID } }
    );

    await Category.findByIdAndUpdate(serverConfig.DEFAULT_CATEGORY_ID, {
      $push: { courses: category.courses },
    });

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
    return;
  } catch (error) {
    next(error);
  }
}

export default {
  createCategory,
  showAllCategories,
  updateCategory,
  deleteCategory,
  showAllCategoriesName,
};
