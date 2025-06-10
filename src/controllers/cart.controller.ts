import { NextFunction, Request, Response } from "express";
import Course from "../models/course.model";
import User from "../models/user.model";
import { Types } from "mongoose";

async function addToCart(req: Request, res: Response, next: NextFunction) {
  try {
    const { courseId } = req.params;

    const student = await User.findById(req.user?.id);
    if (!student) {
      res.status(404).json({ success: false, message: "Student not found" });
      return;
    }

    const course = await Course.findOne({ courseId });

    if (!course) {
      res.status(404).json({ success: false, message: "Course not found" });
      return;
    }

    student.cart.push(course._id as Types.ObjectId);

    await student.save();

    res.status(200).json({ success: true, message: "Course added to cart" });
    return;
  } catch (error) {
    next(error);
  }
}

async function removeFromCart(req: Request, res: Response, next: NextFunction) {
  try {
    const { courseId } = req.params;

    const student = await User.findById(req.user?.id);
    if (!student) {
      res.status(404).json({ success: false, message: "Student not found" });
      return;
    }

    const course = await Course.findOne({ courseId });

    if (!course) {
      res.status(404).json({ success: false, message: "Course not found" });
      return;
    }

    student.cart = student.cart.filter(
      (courseId) =>
        courseId.toString() !== (course._id as Types.ObjectId).toString()
    );

    await student.save();

    res
      .status(200)
      .json({ success: true, message: "Course removed from cart" });
    return;
  } catch (error) {
    next(error);
  }
}

export default { addToCart, removeFromCart };
