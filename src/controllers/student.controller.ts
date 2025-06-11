import Comment from "../models/comment.model";
import Course from "../models/course.model";
import CourseProgress from "../models/courseProgress.model";
import Lecture from "../models/lecture.model";
import QuizAttempt from "../models/quizAttempt.model";
import FinalQuiz from "../models/finalQuiz.model";
import CourseCertification from "../models/certificate.model";
import User from "../models/user.model";
import { NextFunction, Request, Response } from "express";
import { ILecture } from "../interfaces/lecture.interface";
import { Types } from "mongoose";
import { ILectureProgress } from "../interfaces/courseProgress.interface";
import { IComment } from "../interfaces/comment.interface";
import { IMcq } from "../interfaces/mcq.interface";
import { JWTUser } from "../dto/user.dto";

async function populateReplies(comments: IComment[]) {
  for (const comment of comments) {
    let populatedComment = (await Comment.findById(
      comment._id as Types.ObjectId
    ).populate({
      path: "replies",
      populate: {
        path: "student",
        select: "name email username profilePic",
      },
    })) as IComment;

    if (!populatedComment) {
      continue;
    }

    comment.replies = populatedComment.replies;

    if (comment.replies && comment.replies.length > 0) {
      await populateReplies(comment.replies as IComment[]);
    }
  }
  return comments;
}

async function getStudentCourseById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const student = req.user;
    const courseId = req.params.id;

    const course = await Course.findOne({ courseId }).populate("lectures");

    if (!course) {
      res.status(404).json({
        success: false,
        message: "Course not found",
      });
      return;
    }

    const courseProgress = await CourseProgress.findOne({
      student: student?.id,
      course: course._id,
    })
      .populate({
        path: "lectureProgress.lecture",
        populate: [
          {
            path: "mcqs",
          },
          {
            path: "comments",
            populate: {
              path: "student",
              select: "name email username profilePic",
            },
          },
        ],
      })
      .populate("lectureProgress.quizAttempts finalQuizAttempts");

    if (!courseProgress) {
      res.status(404).json({
        success: false,
        message: "Course not found",
      });
      return;
    }
    let lockedLectures: { title: string; duration: number }[] = [];

    let unlockedLectures: (
      | ILectureProgress
      | {
          lecture: {
            _id: Types.ObjectId;
            title: string;
            duration: number;
            lectureId: string;
            order: number;
          };
          isCompleted: boolean;
        }
    )[] = [];

    courseProgress.lectureProgress.map((lec) =>
      lec.isUnlocked
        ? (lec.lecture._id as Types.ObjectId).toString() ==
          courseProgress.currentLecture.toString()
          ? unlockedLectures.push(lec)
          : unlockedLectures.push({
              lecture: {
                _id: lec.lecture._id as Types.ObjectId,
                title: (lec.lecture as ILecture).title,
                duration: (lec.lecture as ILecture).duration,
                lectureId: (lec.lecture as ILecture).lectureId,
                order: (lec.lecture as ILecture).order,
              },
              isCompleted: lec.isCompleted,
            })
        : lockedLectures.push({
            title: (lec.lecture as ILecture).title,
            duration: (lec.lecture as ILecture).duration,
          })
    );

    let currentLecture = unlockedLectures.find(
      (lec) =>
        (lec.lecture._id as Types.ObjectId).toString() ===
        courseProgress.currentLecture.toString()
    );

    if (!currentLecture) {
      res.status(404).json({
        success: false,
        message: "Current lecture not found",
      });
      return;
    }

    if (!currentLecture.isCompleted) {
      let lectureWithoutMcqsCorrectOptions = await Lecture.findById(
        currentLecture.lecture._id
      ).populate([
        {
          path: "mcqs",
          select: "-correctOption",
        },
        {
          path: "comments",
          populate: {
            path: "student",
            select: "name email username profilePic",
          },
        },
      ]);

      if (!lectureWithoutMcqsCorrectOptions) {
        res.status(404).json({
          success: false,
          message: "Lecture not found",
        });
        return;
      }

      currentLecture.lecture = lectureWithoutMcqsCorrectOptions;
    }

    (currentLecture.lecture as ILecture).comments = await populateReplies(
      (currentLecture.lecture as ILecture).comments as IComment[]
    );

    let finalQuiz;

    if (courseProgress.overallProgress === 100) {
      finalQuiz = await FinalQuiz.findOne({ course: course._id }).populate({
        path: "mcqs",
        select: courseProgress.isCourseFinalQuizPassed ? "" : "-correctOption",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        finalQuizAttemptLeft: courseProgress.finalQuizAttemptLeft,
        lockedLectures,
        unlockedLectures,
        currentLecture,
        overallProgress: courseProgress.overallProgress,
        finalQuiz: finalQuiz
          ? {
              ...finalQuiz.toObject(),
              requiredPassPercentage: course.requiredCompletionPercentage,
              isCompleted: courseProgress.isCourseFinalQuizPassed,
              quizAttempts: courseProgress.finalQuizAttempts,
            }
          : null,
      },
    });
    return;
  } catch (error) {
    next(error);
  }
}

async function unlockLecture(req: Request, res: Response, next: NextFunction) {
  try {
    const student = req.user;
    const { courseId, lectureId } = req.params;
    const { userAnswers } = req.body;

    const course = await Course.findOne({ courseId }).populate("lectures");

    if (!course) {
      res.status(404).json({
        success: false,
        message: "Course not found",
      });
      return;
    }

    const courseProgress = await CourseProgress.findOne({
      student: student?.id,
      course: course._id,
    });

    if (!courseProgress) {
      res.status(404).json({
        success: false,
        message: "Course not found",
      });
      return;
    }

    const lecture = await Lecture.findOne({ lectureId }).populate("mcqs");

    if (!lecture) {
      res.status(404).json({
        success: false,
        message: "Lecture not found",
      });
      return;
    }

    const currentLecture = courseProgress.currentLecture.toString();

    if (currentLecture !== (lecture._id as Types.ObjectId).toString()) {
      res.status(400).json({
        success: false,
        message: "You can only unlock the current lecture",
      });
      return;
    }

    const lectureProgress = courseProgress.lectureProgress.find(
      (lec) =>
        lec.lecture.toString() === (lecture._id as Types.ObjectId).toString()
    );

    if (!lectureProgress) {
      res.status(404).json({
        success: false,
        message: "Lecture not found",
      });
      return;
    }

    if (lectureProgress.isCompleted) {
      res.status(400).json({
        success: false,
        message: "Lecture already completed",
      });
      return;
    }

    const mcqs = lecture.mcqs;

    for (let i = 0; i < mcqs.length; i++) {
      if (
        !Object.keys(userAnswers).includes(
          (mcqs[i]._id as Types.ObjectId).toString()
        )
      ) {
        res.status(400).json({
          success: false,
          message: "Please make sure you have answered all questions",
        });
        return;
      }
    }

    let correctAnswers = 0;
    let totalQuestions = mcqs.length;

    for (let i = 0; i < mcqs.length; i++) {
      for (let j = 0; j < Object.keys(userAnswers).length; j++) {
        if (
          (mcqs[i]._id as Types.ObjectId).toString() ===
          Object.keys(userAnswers)[j]
        ) {
          if (
            (mcqs[i] as IMcq).correctOption ===
            userAnswers[Object.keys(userAnswers)[j]]
          ) {
            correctAnswers += 1;
          }
        }
      }
    }

    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    const isPassed = percentage >= lecture.requiredPassPercentage;
    if (isPassed) {
      const quizAttempt = await QuizAttempt.create({
        student: student?.id,
        lecture: lecture._id,
        mcqResponses: mcqs.map((mcq, index) => ({
          mcq: mcq._id as Types.ObjectId,
          selectedOption: {
            textIndex: userAnswers[mcq._id.toString()],
            isCorrect:
              (mcq as IMcq).correctOption === userAnswers[mcq._id.toString()],
          },
        })),
        score: Math.round((correctAnswers / totalQuestions) * 100),
        totalQuestions,
        passingScore: lecture.requiredPassPercentage,
        isPassed,
      });

      await courseProgress.updateLectureProgress(
        lecture._id as Types.ObjectId,
        quizAttempt
      );
    }

    res.status(200).json({
      success: true,
      data: { correctAnswers, totalQuestions, percentage, isPassed },
    });
    return;
  } catch (error) {
    next(error);
  }
}

async function getCurrentLecture(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const student = req.user;
    const { courseId, lectureId } = req.params;

    const course = await Course.findOne({ courseId }).populate("lectures");

    if (!course) {
      res.status(404).json({
        success: false,
        message: "Course not found",
      });
      return;
    }

    const lecture = await Lecture.findOne({ lectureId });

    if (!lecture) {
      res.status(404).json({
        success: false,
        message: "Lecture not found",
      });
      return;
    }

    const courseProgress = await CourseProgress.findOne({
      student: student?.id,
      course: course._id,
    })
      .populate({
        path: "lectureProgress.lecture",
        populate: [
          {
            path: "mcqs",
          },
          {
            path: "comments",
            populate: {
              path: "student",
              select: "name email username profilePic",
            },
          },
        ],
      })
      .populate("lectureProgress.quizAttempts");

    if (!courseProgress) {
      res.status(404).json({
        success: false,
        message: "Course not found",
      });
      return;
    }

    courseProgress.currentLecture = lecture._id;
    await courseProgress.save();

    let currentLecture = courseProgress.lectureProgress.find(
      (lec) => lec.lecture._id.toString() == lecture._id.toString()
    );
    if (!currentLecture) {
      res.status(404).json({
        success: false,
        message: "Current lecture not found",
      });
      return;
    }

    if (!currentLecture.isCompleted) {
      let lectureWithoutMcqsCorrectOptions = await Lecture.findById(
        currentLecture.lecture._id
      ).populate([
        {
          path: "mcqs",
          select: "-correctOption",
        },
        {
          path: "comments",
          populate: {
            path: "student",
            select: "name email username profilePic",
          },
        },
      ]);

      if (!lectureWithoutMcqsCorrectOptions) {
        res.status(404).json({
          success: false,
          message: "Lecture not found",
        });
        return;
      }
      currentLecture.lecture = lectureWithoutMcqsCorrectOptions;
    }
    (currentLecture.lecture as ILecture).comments = await populateReplies(
      (currentLecture.lecture as ILecture).comments as IComment[]
    );

    res.status(200).json({
      success: true,
      data: currentLecture,
    });
    return;
  } catch (error) {
    next(error);
  }
}

async function submitFinalQuiz(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const student = req.user;
    const { courseId } = req.params;
    const { userAnswers } = req.body;

    const course = await Course.findOne({ courseId }).populate(
      "lectures instructor"
    );

    if (!course) {
      res.status(404).json({
        success: false,
        message: "Course not found",
      });
      return;
    }

    const courseProgress = await CourseProgress.findOne({
      student: student?.id,
      course: course._id,
    });

    if (!courseProgress) {
      res.status(404).json({
        success: false,
        message: "Course not found",
      });
      return;
    }

    if (courseProgress.finalQuizAttemptLeft <= 0) {
      res.status(400).json({
        success: false,
        message: "You have exhausted all attempts for the final quiz",
      });
      return;
    }

    if (courseProgress.overallProgress !== 100) {
      res.status(400).json({
        success: false,
        message: "You need to complete all lectures first",
      });
      return;
    }

    const finalQuiz = await FinalQuiz.findOne({ course: course._id }).populate(
      "mcqs"
    );

    if (!finalQuiz) {
      res.status(404).json({
        success: false,
        message: "Final quiz not found",
      });
      return;
    }

    const mcqs = finalQuiz.mcqs;

    for (let i = 0; i < mcqs.length; i++) {
      if (!Object.keys(userAnswers).includes(mcqs[i]._id.toString())) {
        res.status(400).json({
          success: false,
          message: "Please make sure you have answered all questions",
        });
        return;
      }
    }

    let correctAnswers = 0;

    for (let i = 0; i < mcqs.length; i++) {
      for (let j = 0; j < Object.keys(userAnswers).length; j++) {
        if (mcqs[i]._id.toString() === Object.keys(userAnswers)[j]) {
          if (
            (mcqs[i] as IMcq).correctOption ===
            userAnswers[Object.keys(userAnswers)[j]]
          ) {
            correctAnswers += 1;
          }
        }
      }
    }

    const percentage = Math.round((correctAnswers / mcqs.length) * 100);

    const isPassed = percentage >= course.requiredCompletionPercentage;
    let certificateResult = null;
    if (isPassed) {
      const quizAttempt = await QuizAttempt.create({
        student: student?.id,
        course: course._id,
        mcqResponses: mcqs.map((mcq, index) => ({
          mcq: mcq._id,
          selectedOption: {
            textIndex: userAnswers[mcq._id.toString()],
            isCorrect:
              (mcq as IMcq).correctOption === userAnswers[mcq._id.toString()],
          },
        })),
        score: Math.round((correctAnswers / mcqs.length) * 100),
        totalQuestions: mcqs.length,
        passingScore: course.requiredCompletionPercentage,
        isPassed,
      });

      await CourseProgress.findOneAndUpdate(
        { _id: courseProgress._id },
        {
          isCourseFinalQuizPassed: true,
          $push: { finalQuizAttempts: quizAttempt._id },
        }
      );
      certificateResult = await CourseCertification.generateCertificate(
        student as JWTUser,
        course,
        quizAttempt
      );
    }

    courseProgress.finalQuizAttemptLeft -= 1;
    await courseProgress.save();

    const response: {
      success: boolean;
      data: {
        correctAnswers: number;
        totalQuestions: number;
        percentage: number;
        isPassed: boolean;
        certificate?: {
          certificateId: string;
          message: string;
        };
      };
    } = {
      success: true,
      data: {
        correctAnswers,
        totalQuestions: mcqs.length,
        percentage,
        isPassed,
      },
    };

    if (certificateResult && certificateResult.success) {
      response.data.certificate = {
        certificateId: certificateResult?.certificateId!,
        message: certificateResult.message,
      };
    }

    res.status(200).json(response);
    return;
  } catch (error) {
    next(error);
  }
}

async function getEnrolledCourses(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const student = req.user;

    const courses = await User.findById(student?.id)
      .select("purchasedCourses")
      .populate({
        path: "purchasedCourses",
        populate: {
          path: "instructor",
          select: "name email username profilePic",
        },
        select:
          "title description language instructor minimumSkill thumbnail courseId -_id",
      });

    if (!courses) {
      res.status(404).json({
        success: false,
        message: "No courses found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: courses.purchasedCourses,
    });
    return;
  } catch (error) {
    next(error);
  }
}

async function getCartCourses(req: Request, res: Response, next: NextFunction) {
  try {
    const student = req.user;

    const courses = await User.findById(student?.id)
      .select("cart")
      .populate({
        path: "cart",
        populate: {
          path: "instructor",

          select: "name email username profilePic",
        },
        select:
          "title description language price instructor minimumSkill thumbnail courseId -_id",
      });

    if (!courses) {
      res.status(404).json({
        success: false,
        message: "No courses found in cart",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: courses.cart,
    });
    return;
  } catch (error) {
    next(error);
  }
}

async function getCertificates(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const student = req.user;

    const certificates = await CourseCertification.find({
      user: student?.id,
    })
      .select("course status certificateId createdAt -_id")
      .populate({
        path: "course",
        select: "title courseId thumbnail -_id",
      });

    res.status(200).json({
      success: true,
      data: certificates,
    });
    return;
  } catch (error) {
    next(error);
  }
}

async function getPaymentDetails(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const student = req.user;

    const paymentDetails = await User.findById(student?.id)
      .select("paymentHistory -_id")
      .populate({
        path: "paymentHistory",
        populate: {
          path: "course",
          select: "title courseId thumbnail -_id",
        },
        select:
          "amount status createdAt paymentMethod  razorpay_payment_id -_id",
      });

    if (!paymentDetails) {
      res.status(404).json({
        success: false,
        message: "Payment details not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: paymentDetails.paymentHistory,
    });
    return;
  } catch (error) {
    next(error);
  }
}

async function getProgress(req: Request, res: Response, next: NextFunction) {
  try {
    const student = req.user;
    const { username } = req.params;
    let userId = student?.id;

    if (username !== "me") {
      let user = await User.findOne({ username }).select("purchasedCourses");
      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }
      userId = user._id.toString();
    }

    if (!userId) {
      res.status(400).json({
        success: false,
        message: "User ID is required",
      });
      return;
    }

    const courseProgress = await CourseProgress.find({
      student: userId.toString(),
    })
      .select(
        "overallProgress isCourseFinalQuizPassed lectureProgress createdAt updatedAt"
      )
      .populate({
        path: "course",
        select: "title courseId",
      })
      .populate({
        path: "lectureProgress.lecture",
        select: "title lectureId isCompleted isUnlocked quizAttempts",
      });

    res.status(200).json({
      success: true,
      data: courseProgress,
    });
    return;
  } catch (error) {
    next(error);
  }
}

export default {
  getStudentCourseById,
  unlockLecture,
  getCurrentLecture,
  populateReplies,
  submitFinalQuiz,
  getEnrolledCourses,
  getCartCourses,
  getCertificates,
  getPaymentDetails,
  getProgress,
};
