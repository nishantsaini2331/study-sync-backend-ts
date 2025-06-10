import { NextFunction, Request, Response } from "express";
import Course from "../models/course.model";
import HomePage from "../models/homePage.model";
import { Types } from "mongoose";

async function getHomePage(req: Request, res: Response, next: NextFunction) {
  try {
    const homePage = await HomePage.findOne()
      .populate({
        path: "courseCategories",
        select: "name description",
      })
      .populate({
        path: "featuredCourses",
        select: "title description thumbnail price courseId",
        populate: {
          path: "instructor",
          select: "name username photoUrl",
        },
      })
      .populate({
        path: "testimonials",
        // select: "name role content rating",
      });

    let data: {
      courseCategories: Types.ObjectId[];
      featuredCourses: Types.ObjectId[];
      testimonials: Types.ObjectId[];
    } = {
      courseCategories: [],
      featuredCourses: [],
      testimonials: [],
    };
    if (homePage) {
      data.courseCategories = homePage.courseCategories;
      data.featuredCourses = homePage.featuredCourses;
      data.testimonials = homePage.testimonials;
    }
    res.status(200).json({
      success: true,
      message: "Home page data fetched successfully",
      data: data,
    });
  } catch (error) {
    next(error);
  }
}

// async function addHomePageCategory(params) {
//   try {
//     const category = new Category(params);
//     await category.save();
//     return category;
//   } catch (error) {
//     console.error(error);
//     throw new Error("Failed to add category");
//   }
// }

async function updateHomePage(req: Request, res: Response, next: NextFunction) {
  try {
    const { courseCategories, featuredCourses, testimonials } = req.body;
    const homePage = await HomePage.findOneAndUpdate(
      {},
      { courseCategories, featuredCourses, testimonials },
      { new: true }
    );
    if (!homePage) {
      res.status(404).json({ message: "Home page not found" });
      return;
    }
    res.status(200).json(homePage);
    return;
  } catch (error) {
    next(error);
  }
}

async function addHomePageCategory(
  req: Request<{ categoryId: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { categoryId } = req.params;
    const homePage = await HomePage.findOne();
    if (homePage) {
      homePage.courseCategories.push(new Types.ObjectId(categoryId));
      await homePage.save();
    } else {
      const newHomePage = new HomePage({
        courseCategories: [categoryId],
      });
      await newHomePage.save();
    }
    res.status(200).json({
      success: true,
      message: "Category added to home page successfully",
      data: homePage,
    });
    return;
  } catch (error) {
    next(error);
  }
}

async function removeHomePageCategory(
  req: Request<{ categoryId: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { categoryId } = req.params;
    const homePage = await HomePage.findOne();
    if (homePage) {
      homePage.courseCategories = homePage.courseCategories.filter(
        (id) => id.toString() !== categoryId
      );
      await homePage.save();
    }
    res.status(200).json({
      success: true,
      message: "Category removed from home page successfully",
      data: homePage,
    });
    return;
  } catch (error) {
    next(error);
  }
}

async function addHomePageCourse(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { courseId } = req.params;
    const homePage = await HomePage.findOne();
    const course = await Course.findOne({ courseId });
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }
    if (homePage && course) {
      homePage.featuredCourses.push(course._id as Types.ObjectId);
      await homePage.save();
    } else {
      const newHomePage = new HomePage({
        featuredCourses: [course._id],
      });
      await newHomePage.save();
    }
    res.status(200).json({
      success: true,
      message: "Course added to home page successfully",
      data: homePage,
    });
    return;
  } catch (error) {
    next(error);
  }
}
async function removeHomePageCourse(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { courseId } = req.params;
    const course = await Course.findOne({ courseId });
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }
    const homePage = await HomePage.findOne();
    if (homePage && course) {
      homePage.featuredCourses = homePage.featuredCourses.filter(
        (id) => id.toString() !== (course._id as Types.ObjectId).toString()
      );
      await homePage.save();
    }
    res.status(200).json({
      success: true,
      message: "Course removed from home page successfully",
      data: homePage,
    });
    return;
  } catch (error) {
    next(error);
  }
}

export default {
  getHomePage,
  addHomePageCategory,
  removeHomePageCategory,
  addHomePageCourse,
  removeHomePageCourse,
  // createHomePage,
  // updateHomePage,
};
