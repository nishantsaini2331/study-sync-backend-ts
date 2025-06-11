import { NextFunction, Request, Response } from "express";
import Category from "../models/category.model";
import Course from "../models/course.model";
import CourseVerify from "../models/courseVerify.model";
import FinalQuiz from "../models/finalQuiz.model";
import Lecture from "../models/lecture.model";
import MCQ from "../models/mcq.model";
import {
  Request as RequestModel,
  RequestType,
  RequestStatus,
} from "../models/request.model";
import ReviewAndRating from "../models/reviewAndRating.model";
import User from "../models/user.model";
import {
  deleteMediaFromCloudinary,
  deleteVideoFromCloudinary,
} from "../utils/cloudinary";
import { JWTUser } from "../dto/user.dto";
import { Types } from "mongoose";
import { IRequest } from "../interfaces/request.interface";
import { IFinalQuiz } from "../interfaces/finalQuiz.model";

async function createRequest(
  req: Request & { user?: JWTUser },
  res: Response,
  next: NextFunction
) {
  try {
    const {
      title,
      description,
      requestType,
      relatedEntities,
      attachments = [],
      requestedChanges = {},
      newLimit = null,
    } = req.body;

    const { id: userId, roles } = req.user as JWTUser;

    if (
      !title ||
      !description ||
      !requestType ||
      !relatedEntities ||
      !relatedEntities.entityType
    ) {
      res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
      return;
    }

    const instructorRequestTypes = Object.values(RequestType.instructorRequest);
    const studentRequestTypes = Object.values(RequestType.studentRequest);

    if (
      !instructorRequestTypes.includes(requestType) &&
      !studentRequestTypes.includes(requestType)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid request type",
      });
      return;
    }

    let result;

    if (relatedEntities.entityType === "Course") {
      result = await Course.findOne({
        courseId: relatedEntities.entityId,
      });
    }
    if (relatedEntities.entityType === "Lecture") {
      result = await Lecture.findOne({
        lectureId: relatedEntities.entityId,
      });
    }

    if (relatedEntities.entityType === "User") {
      result = await User.findById(userId);
    }

    if (!result) {
      res.status(400).json({
        success: false,
        message: "Invalid related entity",
      });
      return;
    }

    const existingRequest = await RequestModel.findOne({
      title,
      requestType,
      "relatedEntities.entityId": result._id,
    });

    if (existingRequest) {
      res.status(400).json({
        success: false,
        message: "Request already exists",
      });
      return;
    }

    if (instructorRequestTypes.includes(requestType)) {
      if (!roles.includes("instructor")) {
        res.status(403).json({
          success: false,
          message: "You are not authorized to make instructor requests",
        });
        return;
      }
      await handleInstructorRequest(req, res, next);
      return;
    }

    if (studentRequestTypes.includes(requestType)) {
      if (!roles.includes("student")) {
        res.status(403).json({
          success: false,
          message: "You are not authorized to make student requests",
        });
        return;
      }

      await handleStudentRequest(req, res, next);
      return;
    }
  } catch (error) {
    next(error);
  }
}

async function handleInstructorRequest(
  req: Request & { user?: JWTUser },
  res: Response,
  next: NextFunction
) {
  try {
    const {
      title,
      description,
      requestType,
      relatedEntities,
      attachments = [],
      requestedChanges = {},
      newLimit = null,
    } = req.body;

    const { id: userId, name, roles } = req.user as JWTUser;

    let result;

    if (relatedEntities.entityType === "Course") {
      result = await Course.findOne({
        courseId: relatedEntities.entityId,
      });
      if (!result || result.instructor.toString() !== userId.toString()) {
        res.status(403).json({
          success: false,
          message: "You don't have permission for this course",
        });
        return;
      }
    }

    if (relatedEntities.entityType === "Lecture") {
      result = await Lecture.findOne({
        lectureId: relatedEntities.entityId,
      });

      result = await Course.findOne({
        courseId: result?.course?.toString(),
      });

      if (!result || result.instructor.toString() !== userId.toString()) {
        res.status(403).json({
          success: false,
          message: "You don't have permission for this lecture",
        });
        return;
      }
    }

    if (relatedEntities.entityType === "User") {
      result = await User.findById(userId);
      if (!result) {
        res.status(403).json({
          success: false,
          message: "You don't have permission for this user",
        });
        return;
      }
    }

    if (!result) {
      res.status(400).json({
        success: false,
        message: "Invalid related entity",
      });
      return;
    }

    const newRequest = new RequestModel({
      title,
      description,
      requestType,
      status: RequestStatus.PENDING,
      requestedBy: userId,
      requesterRole: "instructor",
      relatedEntities: {
        entityType: relatedEntities.entityType,
        entityId: result._id,
      },
      attachments,
      requestedChanges: { newLimit, ...requestedChanges },
    });

    await newRequest.save();

    res.status(201).json({
      success: true,
      message: "Instructor request created successfully",
      data: newRequest,
    });
    return;
  } catch (error) {
    next(error);
  }
}

async function handleStudentRequest(
  req: Request & { user?: JWTUser },
  res: Response,
  next: NextFunction
) {
  try {
    const {
      title,
      description,
      requestType,
      relatedEntities,
      attachments = [],
      requestedChanges = {},
    } = req.body;

    const { id: userId, name, roles } = req.user as JWTUser;

    // Student-specific validation
    // For example, validating if the student is enrolled in the course
    if (requestType === RequestType.studentRequest.RESET_QUIZ_ATTEMPTS) {
      // Validate that the student has attempted the quiz
      // const quiz = await Quiz.findById(relatedEntities.entityId);
      // const attempts = await QuizAttempt.find({
      //   quizId: relatedEntities.entityId,
      //   studentId: userId
      // });
      // if (!attempts || attempts.length === 0) {
      //   return res.status(400).json({
      //     success: false,
      //     message: "No quiz attempts found to reset",
      //   });
      // }
    }

    const newRequest = new RequestModel({
      title,
      description,
      requestType,
      status: RequestStatus.PENDING,
      requestedBy: userId,
      requesterRole: "student",
      relatedEntities,
      attachments,
      requestedChanges,
    });

    await newRequest.save();

    res.status(201).json({
      success: true,
      message: "Student request created successfully",
      data: newRequest,
    });
    return;
  } catch (error) {
    next(error);
  }
}

async function addComment(
  req: Request & { user?: JWTUser },
  res: Response,
  next: NextFunction
) {
  try {
    const { comment } = req.body;
    const { id: userId, name, roles } = req.user as JWTUser;
    const { requestId } = req.params;

    if (!comment) {
      res.status(400).json({
        success: false,
        message: "Comment is required",
      });
      return;
    }

    const request = await RequestModel.findOne({ requestId });

    if (!request) {
      res.status(404).json({
        success: false,
        message: "Request not found",
      });
      return;
    }

    if (
      request.requestedBy.toString() !== userId &&
      request.assignedTo?.toString() !== userId
    ) {
      res.status(403).json({
        success: false,
        message: "You are not authorized to comment on this request",
      });
      return;
    }

    request.comments.push({
      comment,
      commentedBy: new Types.ObjectId(userId),
      commenterRole: roles.includes("admin") ? "admin" : "instructor",
    });

    await request.save();

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: request.comments,
    });
    return;
  } catch (error) {
    next(error);
  }
}

async function getMyRequests(
  req: Request & { user?: JWTUser },
  res: Response,
  next: NextFunction
) {
  try {
    const instructor = req.user;

    const requests = await RequestModel.find({
      requestedBy: instructor?.id,
      requesterRole: "instructor",
    })
      .select(
        "title description requestedChanges adminNote requestId status createdAt updatedAt comments -_id"
      )
      .populate("comments.commentedBy", "name email username -_id")
      .populate("requestedBy", "name email username -_id")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      requests,
    });
    return;
  } catch (error) {
    next(error);
  }
}

async function getStudentRequests(
  req: Request & { user?: JWTUser },
  res: Response,
  next: NextFunction
) {
  try {
    const instructor = req.user;

    const requests = await RequestModel.find({
      assignedTo: instructor?.id,
      requesterRole: "student",
    })
      .select(
        "title description requestId status createdAt updatedAt comments -_id"
      )
      .populate("comments.commentedBy", "name email username -_id")
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      requests,
    });
    return;
  } catch (error) {
    next(error);
  }
}

async function getRequests(
  req: Request & { user?: JWTUser },
  res: Response,
  next: NextFunction
) {
  try {
    const requests = await RequestModel.find({ assignedTo: req.user?.id })
      .select(
        "title description requestId requestedChanges adminNote status requestType requesterRole createdAt updatedAt comments -_id"
      )
      .populate("comments.commentedBy", "name email username -_id")
      .populate("requestedBy", "name email username -_id")
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      requests,
    });
    return;
  } catch (error) {
    next(error);
  }
}

async function updateRequest(
  req: Request & { user?: JWTUser },
  res: Response,
  next: NextFunction
) {
  try {
    const { requestId } = req.params;
    const { note, status } = req.body;
    const { id: userId } = req.user as JWTUser;

    if (!status) {
      res.status(400).json({
        success: false,
        message: "Status is required",
      });
      return;
    }

    const request = await RequestModel.findOne({ requestId });

    if (!request) {
      res.status(404).json({
        success: false,
        message: "Request not found",
      });
      return;
    }

    if (
      request.status === RequestStatus.APPROVED ||
      request.status === RequestStatus.REJECTED
    ) {
      res.status(400).json({
        success: false,
        message: "Request has already been resolved",
      });
      return;
    }

    if (request.assignedTo?.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: "You are not authorized to update this request",
      });
      return;
    }

    request.status = status;
    request.adminNote = note || "";

    if (
      status === RequestStatus.APPROVED ||
      status === RequestStatus.REJECTED
    ) {
      request.resolution = {
        action: status,
        reason: note,
        resolvedBy: new Types.ObjectId(userId),
      };
      request.resolvedAt = new Date();

      if (status === RequestStatus.APPROVED) {
        if (request.requesterRole === "instructor") {
          await handleInstructorApprovedRequest(request, res, next);
        } else if (request.requesterRole === "student") {
        }
      }
    }

    await request.save();

    res.status(200).json({
      success: true,
      message: "Request updated successfully",
      data: request,
    });
    return;
  } catch (error) {
    next(error);
  }
}

async function handleInstructorApprovedRequest(
  request: IRequest,
  res: Response,
  next: NextFunction
) {
  if (request.requestType === RequestType.instructorRequest.DELETE_COURSE) {
    try {
      const course = await Course.findById(
        request.relatedEntities.entityId
      ).populate("finalQuiz");

      if (!course) {
        throw new Error("Course not found");
      }

      await deleteMediaFromCloudinary(course.thumbnailId);
      await deleteVideoFromCloudinary(course.previewVideoId);

      const lectures = await Lecture.find({ course: course._id });
      for (let lecture of lectures) {
        await deleteVideoFromCloudinary(lecture.videoId);
        if (lecture.mcqs && lecture.mcqs.length > 0) {
          await MCQ.deleteMany({ _id: { $in: lecture.mcqs } });
        }
        await Lecture.findByIdAndDelete(lecture._id);
      }

      await User.updateMany(
        { enrolledCourses: course._id },
        { $pull: { enrolledCourses: course._id } }
      );

      await User.findByIdAndUpdate(course.instructor, {
        $pull: { createdCourses: course._id },
      });

      await Category.findByIdAndUpdate(course.category, {
        $pull: { courses: course._id },
      });

      if (course.courseVerification) {
        await CourseVerify.findByIdAndDelete(course.courseVerification);
      }

      if (course.finalQuiz) {
        for (let mcq of (course.finalQuiz as IFinalQuiz).mcqs) {
          await MCQ.findByIdAndDelete(mcq);
        }
        await FinalQuiz.findByIdAndDelete(course.finalQuiz._id);
      }

      await ReviewAndRating.deleteMany({ course: course._id });

      await Course.findByIdAndDelete(course._id);
    } catch (error) {
      next(error);
    }
  } else if (
    request.requestType ===
    RequestType.instructorRequest.INCREASE_COURSE_CREATE_LIMIT
  ) {
    try {
      const user = await User.findById(request.requestedBy);

      if (!user) {
        throw new Error("User not found");
      }

      user.courseCreateLimit = request.requestedChanges.newLimit;
      await user.save();
    } catch (error) {
      next(error);
    }
  }
}

async function deleteRequest(
  req: Request<{ requestId: string }> & { user?: JWTUser },
  res: Response,
  next: NextFunction
) {
  try {
    const { requestId } = req.params;
    const { id: userId } = req.user as JWTUser;

    const request = await RequestModel.findOne({ requestId });

    if (!request) {
      res.status(404).json({
        success: false,
        message: "Request not found",
      });
      return;
    }

    if (request.requestedBy.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: "You are not authorized to delete this request",
      });
      return;
    }

    if (
      request.status === RequestStatus.APPROVED ||
      request.status === RequestStatus.REJECTED ||
      request.status === RequestStatus.IN_REVIEW
    ) {
      res.status(400).json({
        success: false,
        message: "Request cannot be deleted",
      });
      return;
    }

    await RequestModel.findOneAndDelete(new Types.ObjectId(requestId));

    res.status(200).json({
      success: true,
      message: "Request deleted successfully",
    });
    return;
  } catch (error) {
    next(error);
  }
}

export default {
  createRequest,
  handleInstructorRequest,
  handleStudentRequest,
  addComment,
  getMyRequests,
  getStudentRequests,
  getRequests,
  updateRequest,
  deleteRequest,
};
