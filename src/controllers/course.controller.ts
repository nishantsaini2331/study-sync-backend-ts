import { NextFunction, Request, Response } from "express";

import Category from "../models/category.model";
import Course from "../models/course.model";
import CourseVerify from "../models/courseVerify.model";
import FinalQuiz from "../models/finalQuiz.model";
import Lecture from "../models/lecture.model";
import MCQ from "../models/mcq.model";
import ReviewAndRating from "../models/reviewAndRating.model";
import User from "../models/user.model";
import { JWTUser } from "../dto/user.dto";
import { UploadApiResponse } from "cloudinary";
import { CreateCourseDto, UpdateCourseDto } from "../dto/course.dto";
import { Types } from "mongoose";
import { ICourse } from "../interfaces/course.interface";
import { ICategory } from "../interfaces/category.interface";
import { IReviewAndRating } from "../interfaces/reviewRating.interface";
import { IFinalQuiz } from "../interfaces/finalQuiz.model";

import {
  uploadMedia,
  deleteMediaFromCloudinary,
  deleteVideoFromCloudinary,
} from "../utils/cloudinary";

import ShortUniqueId from "short-unique-id";

const { randomUUID } = new ShortUniqueId({ length: 6 });

function courseStats(courses: ICourse[]) {
  let stats = {
    totalStudents: 0,
    totalRevenue: 0,
    totalReviews: 0,
    averageRating: 0,
    totalRatings: 0,
  };

  for (let course of courses) {
    stats.totalStudents += course.enrolledStudents.length;
    stats.totalRevenue += course.price * course.enrolledStudents.length;
    const validReviews = course.reviewAndRating.filter(isPopulatedReview);
    stats.totalReviews += validReviews.length;
    stats.totalRatings += validReviews.reduce(
      (acc, curr) => acc + curr.rating,
      0
    );
  }

  if (stats.totalReviews > 0) {
    stats.averageRating = stats.totalRatings / stats.totalReviews;
  }

  return stats;
}

type CreateCourseRequest = Request<{}, any, CreateCourseDto, {}> & {
  user?: JWTUser;
  files?: {
    thumbnail?: Express.Multer.File[];
    previewVideo?: Express.Multer.File[];
  };
};

async function createCourse(
  req: CreateCourseRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user;
    const {
      title,
      description,
      price,
      minimumSkill,
      language,
      requiredCompletionPercentage,
      category,
      whatYouWillLearn,
      tags,
    } = req.body;

    const thumbnail = req?.files?.thumbnail?.[0];
    const previewVideo = req.files?.previewVideo?.[0];

    if (!thumbnail || !previewVideo) {
      res.status(400).json({
        success: false,
        message: "Thumbnail and preview video are required",
      });
      return;
    }

    const checkCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${category}$`, "i") },
    });

    if (!checkCategory) {
      res.status(400).json({
        message: "Please enter valid category",
        success: false,
      });
      return;
    }

    const { secure_url: thumbnailUrl, public_id: thumbnailId } =
      (await uploadMedia(
        `data:image/jpeg;base64,${thumbnail.buffer.toString("base64")}`
      )) as UploadApiResponse;

    const {
      secure_url: previewVideoUrl,
      public_id: previewVideoId,
      duration,
    } = (await uploadMedia(
      `data:video/mp4;base64,${previewVideo.buffer.toString("base64")}`
    )) as UploadApiResponse;

    const courseId =
      title.split(" ").join("-").toLowerCase() + "-" + randomUUID();

    const course = await Course.create({
      title,
      description,
      price,
      minimumSkill,
      instructor: user?.id,
      tags,
      thumbnail: thumbnailUrl,
      thumbnailId,
      previewVideo: previewVideoUrl,
      previewVideoId,
      language,
      courseId,
      requiredCompletionPercentage,
      category: checkCategory._id,
      whatYouWillLearn,
    });

    await Category.findByIdAndUpdate(checkCategory._id, {
      $push: { courses: course._id },
    });
    await User.findByIdAndUpdate(user?.id, {
      $push: { createdCourses: course._id },
      $inc: { "instructorProfile.totalCourses": 1 },
    });

    res.status(201).json({ success: true, message: "Course created" });
    return;
  } catch (error) {
    next(error);
  }
}

async function getCourses(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user;

    const courses = await Course.find({ instructor: user?.id });
    res.status(200).json({ success: true, courses });
    return;
  } catch (error) {
    next(error);
  }
}

async function getCourse(req: Request, res: Response, next: NextFunction) {
  try {
    const courseId = req.params.id;
    const course = await Course.findOne({ courseId })
      .populate("instructor lectures")
      .populate({
        path: "finalQuiz",
        populate: {
          path: "mcqs",
        },
      })
      .populate({
        path: "category",
        select: "name",
      });

    if (!course) {
      res.status(404).json({ success: false, message: "Course not found" });
      return;
    }
    res.status(200).json({ success: true, course });
    return;
  } catch (error) {
    next(error);
  }
}

type UpdateCourseRequest = Request<{ id: string }, any, UpdateCourseDto, {}> & {
  user?: JWTUser;
  files?: {
    thumbnail?: Express.Multer.File[];
    previewVideo?: Express.Multer.File[];
  };
};

async function updateCourse(
  req: UpdateCourseRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const courseId = req.params.id;
    const course = await Course.findOne({ courseId }).populate("category");
    const user = req.user;

    if (!course) {
      res.status(404).json({ success: false, message: "Course not found" });
      return;
    }

    const {
      title,
      description,
      price,
      minimumSkill,
      language,
      requiredCompletionPercentage,
      category,
      tags,
      whatYouWillLearn,
    } = req.body;

    const checkCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${category}$`, "i") },
    });

    if (!checkCategory) {
      res.status(400).json({
        message: "Please enter valid category",
        success: false,
      });
      return;
    }

    if (req?.files?.thumbnail) {
      await deleteMediaFromCloudinary(course.thumbnailId);
      const { secure_url: thumbnailUrl, public_id: thumbnailId } =
        (await uploadMedia(
          `data:image/jpeg;base64,${req.files.thumbnail[0].buffer.toString(
            "base64"
          )}`
        )) as UploadApiResponse;
      course.thumbnail = thumbnailUrl;
      course.thumbnailId = thumbnailId;
    }

    if (req?.files?.previewVideo) {
      await deleteVideoFromCloudinary(course.previewVideoId);
      const { secure_url: previewVideoUrl, public_id: previewVideoId } =
        (await uploadMedia(
          `data:video/mp4;base64,${req.files.previewVideo[0].buffer.toString(
            "base64"
          )}`
        )) as UploadApiResponse;
      course.previewVideo = previewVideoUrl;
      course.previewVideoId = previewVideoId;
    }

    let courseCategory = course.category as ICategory;

    if (
      checkCategory.name.toLowerCase() !== courseCategory.name.toLowerCase()
    ) {
      //   Promise.all([
      //     await Category.findOneAndUpdate(course.category._id, {
      //       $pull: { courses: course._id },
      //     }),
      //     await Category.findByIdAndUpdate(checkCategory._id, {
      //       $push: { courses: course._id },
      //     }),
      //   ]);

      await Category.findOneAndUpdate(courseCategory._id as Types.ObjectId, {
        $pull: { courses: course._id },
      });

      course.category = checkCategory._id as Types.ObjectId;

      await Category.findByIdAndUpdate(checkCategory._id, {
        $push: { courses: course._id },
      });
    }

    course.title = title!;
    course.description = description!;
    course.price = price!;
    course.minimumSkill = minimumSkill!;
    course.language = language!;
    course.tags = tags!;
    course.requiredCompletionPercentage = requiredCompletionPercentage!;
    course.whatYouWillLearn = whatYouWillLearn!;

    await course.save();

    res.status(200).json({ success: true, message: "Course updated" });
    return;
  } catch (error) {
    next(error);
  }
}

async function deleteCourse(req: Request, res: Response, next: NextFunction) {
  try {
    const courseId = req.params.id;
    const course = await Course.findOne({ courseId }).populate("finalQuiz");
    const user = req.user;

    if (!user) {
      res.status(400).json({ success: false, message: "User not found" });
      return;
    }

    if (!course) {
      res.status(404).json({ success: false, message: "Course not found" });
      return;
    }
    const deletedCourse = await Course.findByIdAndDelete(course._id);

    if (!deletedCourse) {
      res.status(404).json({
        success: false,
        message: "Course not found or already deleted",
      });
      return;
    }

    await deleteMediaFromCloudinary(deletedCourse.thumbnailId);
    await deleteVideoFromCloudinary(deletedCourse.previewVideoId);

    const lectures = await Lecture.find({ course: deletedCourse._id });
    for (let lecture of lectures) {
      await deleteVideoFromCloudinary(lecture.videoId);
      if (lecture.mcqs.length > 0) {
        await MCQ.deleteMany({ _id: { $in: lecture.mcqs } });
      }
      await Lecture.findByIdAndDelete(lecture._id);
    }

    const users = await User.find({ enrolledCourses: deletedCourse._id });

    for (let user of users) {
      await User.findByIdAndUpdate(user._id, {
        $pull: { enrolledCourses: deletedCourse._id },
      });
    }

    await User.findByIdAndUpdate(deletedCourse.instructor, {
      $pull: { createdCourses: deletedCourse._id },
    });

    await Category.findByIdAndUpdate(deletedCourse.category, {
      $pull: { courses: deletedCourse._id },
    });

    await CourseVerify.findByIdAndDelete(deletedCourse.courseVerification);

    for (let mcq of (course.finalQuiz as IFinalQuiz).mcqs) {
      await MCQ.findByIdAndDelete(mcq);
    }

    await FinalQuiz.findByIdAndDelete(course.finalQuiz._id);

    await ReviewAndRating.deleteMany({ course: deletedCourse._id });

    res.status(200).json({ success: true, message: "Course deleted" });
    return;
  } catch (error) {
    next(error);
  }
}

interface CourseSearchQuery {
  search?: string;
  language?: string;
  category?: string;
}

interface CourseQuery {
  status?: string;
  title?: { $regex: string; $options: string };
  language?: { $regex: string; $options: string };
  category?: Types.ObjectId;
}

function isPopulatedReview(
  review: Types.ObjectId | IReviewAndRating
): review is IReviewAndRating {
  return typeof review === "object" && "rating" in review;
}

async function getCoursesBySearchQuery(
  req: Request<{}, {}, {}, CourseSearchQuery>,
  res: Response,
  next: NextFunction
) {
  try {
    const { search: title, language, category } = req.query;

    let categoryId: Types.ObjectId | undefined;

    if (category) {
      const checkCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${category}$`, "i") },
      });

      if (!checkCategory) {
        res.status(404).json({
          success: false,
          message: "Category not found",
        });
        return;
      }

      categoryId = checkCategory._id as Types.ObjectId;
    }

    const query: CourseQuery = { status: "published" };

    if (title) {
      query.title = { $regex: title, $options: "i" };
    }

    if (language) {
      query.language = { $regex: language, $options: "i" };
    }

    if (categoryId) {
      query.category = categoryId;
    }

    const courses = await Course.find(query)
      .populate({
        path: "instructor",
        select: "name username -_id",
      })
      .populate({
        path: "category",
        select: "name -_id",
      })
      .populate({
        path: "reviewAndRating",
        select: "rating -_id",
      })
      .select(
        "title description price thumbnail language courseId enrolledStudents -_id"
      );

    const formattedCourses = courses.map((course) => {
      const courseObj = course.toObject() as ICourse & {
        reviewAndRating: { rating: number }[];
      };

      const validReviews = courseObj.reviewAndRating.filter(isPopulatedReview);

      const rating =
        validReviews.length > 0
          ? validReviews.reduce((acc, curr) => acc + curr.rating, 0) /
            validReviews.length
          : 0;

      return {
        ...courseObj,
        enrolledStudents: courseObj.enrolledStudents.length,
        rating,
        reviewAndRating: courseObj.reviewAndRating.length,
      };
    });

    res.status(200).json({
      success: true,
      results: courses.length,
      courses: formattedCourses,
    });
  } catch (error) {
    next(error);
  }
}

async function getCourseForStudent(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const courseId = req.params.id;
    const course = await Course.findOne({ courseId })
      .populate({
        path: "instructor",
        select: "name username photoUrl -_id",
      })
      .populate({
        path: "lectures",
        select: "title description duration -_id",
      })
      .populate({
        path: "reviewAndRating",
        populate: [
          {
            path: "student",
            select: "name photoUrl username -_id",
          },
          {
            path: "course",
            select: "title courseId -_id",
          },
        ],
        select: "rating review createdAt -_id",
      })
      .select(
        "title description price thumbnail language courseId previewVideo minimumSkill lectures language whatYouWillLearn -_id"
      );

    if (!course) {
      res.status(404).json({ success: false, message: "Course not found" });
      return;
    }

    let averageRating = 0;

    const validReviews = course.reviewAndRating.filter(isPopulatedReview);

    if (validReviews.length > 0) {
      let totalReviews = validReviews.length;
      let totalRatings = validReviews.reduce(
        (acc, curr) => acc + curr.rating,
        0
      );
      averageRating = totalRatings / totalReviews;
    }

    // const totalDuration = course.lectures.reduce((acc, curr) => {
    //   return acc + curr.duration;
    // }, 0);

    // const formattedCourse = {
    //   ...course.toObject(),
    //   lectures: course.lectures.length,
    // };

    res
      .status(200)
      .json({ success: true, course: { ...course.toObject(), averageRating } });
    return;
  } catch (error) {
    console.log(error);
    next(error);
  }
}

async function checkStudentEnrollment(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const courseId = req.params.id;
    const course = await Course.findOne({ courseId });
    const user = req.user;

    if (!user) {
      res.status(400).json({ success: false, message: "User not found" });
      return;
    }

    if (!course) {
      res.status(404).json({ success: false, message: "Course not found" });
      return;
    }

    const isEnrolled = course.enrolledStudents.includes(
      new Types.ObjectId(user?.id)
    );

    res.status(200).json({ success: true, isEnrolled });
    return;
  } catch (error) {
    next(error);
  }
}

async function checkInstructor(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = req.params.id;
    const instructor = req.user;
    if (!instructor) {
      res.status(400).json({ success: false, message: "User not found" });
      return;
    }

    const course = await Course.findOne({
      courseId: id,
      instructor: instructor.id,
    });

    if (course) {
      res.status(200).json({ success: true, isOwner: true });
      return;
    }

    const lecture = await Lecture.findOne({
      lectureId: id,
    })
      .select("course")
      .populate({
        path: "course",
        select: "instructor -_id",
      });

    if (
      (lecture?.course as ICourse).instructor?.toString() ===
      instructor?.id?.toString()
    ) {
      res.status(200).json({ success: true, isOwner: true });
      return;
    }
    res
      .status(403)
      .json({ success: true, isOwner: false, message: "Unauthorised access" });
    return;
  } catch (error) {
    next(error);
  }
}

export default {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  getCoursesBySearchQuery,
  getCourseForStudent,
  checkStudentEnrollment,
  checkInstructor,
};
