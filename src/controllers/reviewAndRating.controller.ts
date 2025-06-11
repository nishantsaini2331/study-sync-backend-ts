import { NextFunction, Request, Response } from "express";
import Course from "../models/course.model";
import ReviewAndRating from "../models/reviewAndRating.model";
import { Types } from "mongoose";
import {
  CreateReviewAndRatingDto,
  UpdateReviewAndRatingDto,
} from "../dto/reviewAndRating.dto";
import { JWTUser } from "../dto/user.dto";

async function getReviewAndRating(
  req: Request<{ courseId: string }> & { user?: JWTUser },
  res: Response,
  next: NextFunction
) {
  try {
    const { courseId } = req.params;

    const course = await Course.findOne({ courseId });

    if (!course) {
      res.status(404).json({
        status: "error",
        message: "Course not found",
      });
      return;
    }

    const reviewAndRating = await ReviewAndRating.findOne({
      student: req.user?.id,
      course: course._id,
    })
      .populate({
        path: "student",
        select: "name photoUrl username -_id",
      })
      .populate({
        path: "course",
        select: "title courseId -_id",
      })
      .select("rating review createdAt -_id");

    if (reviewAndRating) {
      res.status(200).json({
        success: true,
        data: reviewAndRating,
      });
      return;
    }
    res.status(200).json({
      success: false,
      data: null,
    });
    return;
  } catch (error) {
    next(error);
  }
}

async function addReviewAndRating(
  req: Request<{ courseId: string }, {}, CreateReviewAndRatingDto> & {
    user?: JWTUser;
  },
  res: Response,
  next: NextFunction
) {
  try {
    const { courseId } = req.params;
    const { rating, review } = req.body;

    const course = await Course.findOne({ courseId });

    if (!course) {
      res.status(404).json({
        status: "error",
        message: "Course not found",
      });
      return;
    }

    const reviewAndRating = await ReviewAndRating.findOne({
      student: req.user?.id,
      course: course._id,
    });

    if (reviewAndRating) {
      res.status(400).json({
        status: "error",
        message: "You have already reviewed this course",
      });
      return;
    }
    const newReviewAndRating = await ReviewAndRating.create({
      student: req.user?.id,
      course: course._id,
      rating,
      review,
    });

    await newReviewAndRating.populate("student", "name photoUrl username -_id");
    await newReviewAndRating.populate("course", "title courseId -_id");

    course.reviewAndRating.push(newReviewAndRating._id as Types.ObjectId);
    await course.save();

    res.status(201).json({
      success: true,
      data: newReviewAndRating,
    });
    return;
  } catch (error) {
    next(error);
  }
}

async function updateReviewAndRating(
  req: Request<{ courseId: string }, {}, UpdateReviewAndRatingDto> & {
    user?: JWTUser;
  },
  res: Response,
  next: NextFunction
) {
  try {
    const { courseId } = req.params;
    const { rating, review } = req.body;

    const course = await Course.findOne({ courseId });

    if (!course) {
      res.status(404).json({
        status: "error",
        message: "Course not found",
      });
      return;
    }

    const reviewAndRating = await ReviewAndRating.findOne({
      student: req.user?.id,
      course: course._id,
    });

    if (!reviewAndRating) {
      res.status(404).json({
        status: "error",
        message: "Review and rating not found",
      });
      return;
    }

    await reviewAndRating.populate("student", "name photoUrl username -_id");
    await reviewAndRating.populate("course", "title courseId -_id");

    if (!reviewAndRating) {
      res.status(404).json({
        status: "error",
        message: "Review not found",
      });
      return;
    }

    reviewAndRating.rating = rating || reviewAndRating.rating;
    reviewAndRating.review = review || reviewAndRating.review;
    await reviewAndRating.save();

    res.status(200).json({
      success: true,
      data: reviewAndRating,
    });
    return;
  } catch (error) {
    next(error);
  }
}

async function deleteReviewAndRating(
  req: Request<{ courseId: string }> & { user?: JWTUser },
  res: Response,
  next: NextFunction
) {
  try {
    const { courseId } = req.params;

    const course = await Course.findOne({ courseId });

    if (!course) {
      res.status(404).json({
        status: "error",
        message: "Course not found",
      });
      return;
    }

    const reviewAndRating = await ReviewAndRating.findOne({
      student: req.user?.id,
      course: course._id,
    });

    if (!reviewAndRating) {
      res.status(404).json({
        status: "error",
        message: "Review not found",
      });
      return;
    }

    course.reviewAndRating = course.reviewAndRating.filter(
      (id) =>
        id.toString() !== (reviewAndRating._id as Types.ObjectId).toString()
    );
    await course.save();

    await ReviewAndRating.findByIdAndDelete(reviewAndRating._id);

    res.status(200).json({
      success: true,
      data: null,
    });
    return;
  } catch (error) {
    next(error);
  }
}

export default {
  getReviewAndRating,
  addReviewAndRating,
  updateReviewAndRating,
  deleteReviewAndRating,
};
