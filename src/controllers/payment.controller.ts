import razorpayInstance from "../config/razorpayInstance";
import crypto from "crypto";
import Payment from "../models/payment.model";
import Course from "../models/course.model";
import User from "../models/user.model";
import CourseProgress from "../models/courseProgress.model";
import { transporter } from "../utils/transporter";
import paymentSuccessfullTemplate from "../templates/paymentSuccessfullTemplate";
import { NextFunction, Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import { serverConfig } from "../config/serverConfig";
import { CreateOrderDto, VerifyPaymentDto } from "../dto/payment.dto";
import { ILecture } from "../interfaces/lecture.interface";

async function createOrder(
  req: Request<{}, {}, CreateOrderDto>,
  res: Response,
  next: NextFunction
) {
  try {
    const { amount, courseId } = req.body;

    const course = await Course.findOne({ courseId });
    const user = req.user;

    if (!course) {
      res.status(404).json({
        success: false,
        message: "Course not found",
      });
      return;
    }

    if (course.enrolledStudents.includes(new Types.ObjectId(user?.id))) {
      res.status(400).json({
        success: false,
        message: "You have already enrolled in this course",
      });
      return;
    }

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: crypto.randomBytes(10).toString("hex"),
    };
    const order = await razorpayInstance.orders.create(options);
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

async function verifyPayment(
  req: Request<{}, {}, VerifyPaymentDto>,
  res: Response,
  next: NextFunction
) {
  const session = await mongoose.startSession();

  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      courseId,
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", serverConfig.RAZORPAY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
      return;
    }

    await session.startTransaction();

    const user = await User.findById(req.user?.id)
      .select("email name")
      .session(session);

    if (!user) {
      await session.abortTransaction();
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const existingPayment = await Payment.findOne({
      razorpay_payment_id,
      status: "successful",
    }).session(session);

    if (existingPayment) {
      await session.abortTransaction();
      res.status(400).json({
        success: false,
        message: "Payment already processed",
      });
      return;
    }

    const course = await Course.findOne({ courseId })
      .populate({
        path: "lectures",
        select: "order",
      })
      .session(session);

    if (!course) {
      await session.abortTransaction();
      res.status(404).json({
        success: false,
        message: "Course not found",
      });
      return;
    }

    const alreadyPurchased = await Payment.findOne({
      user: user._id,
      course: course._id,
      status: "successful",
    }).session(session);

    if (alreadyPurchased) {
      await session.abortTransaction();
      res.status(400).json({
        success: false,
        message: "Course already purchased",
      });
      return;
    }

    const razorpayPayment = await razorpayInstance.payments.fetch(
      razorpay_payment_id
    );

    if (Number(razorpayPayment.amount) / 100 !== course.price) {
      await session.abortTransaction();
      res.status(400).json({
        success: false,
        message: "Payment amount mismatch",
      });
      return;
    }

    const payment = await Payment.create(
      [
        {
          user: user._id,
          course: course._id,
          razorpay_payment_id,
          razorpay_order_id,
          razorpay_signature,
          amount: course.price,
          status: "successful",
          paymentMethod: razorpayPayment?.method || "unknown",
        },
      ],
      { session }
    );

    await Course.findByIdAndUpdate(
      course._id,
      {
        $addToSet: { enrolledStudents: user._id },
        $inc: {
          "courseStats.totalStudents": 1,
          "courseStats.totalRevenue": Math.round(course.price * 100) / 100,
        },
      },
      { session }
    );

    await User.findByIdAndUpdate(
      user._id,
      {
        $addToSet: { purchasedCourses: course._id },
        $push: { paymentHistory: payment[0]._id },
        $pull: { cart: course._id },
      },
      { session }
    );

    const instructorId = course.instructor;

    const previousPurchase = await Payment.find({
      user: user._id,
      status: "successful",
      course: {
        $in: await Course.find({ instructor: instructorId }).distinct("_id"),
      },
    }).session(session);

    if (previousPurchase.length === 1) {
      await User.findByIdAndUpdate(
        instructorId,
        {
          $inc: {
            "instructorProfile.totalStudents": 1,
          },
        },
        { session }
      );
    }

    await User.findByIdAndUpdate(
      instructorId,
      {
        $inc: {
          "instructorProfile.totalEarnings":
            Math.round(course.price * 0.7 * 100) / 100,
        },
      },
      { session }
    );
    const sortedLectures = (course.lectures as ILecture[]).sort(
      (a, b) => a.order - b.order
    );

    const newProgress = await CourseProgress.create({
      student: user._id,
      course: course._id,
      lectureProgress: sortedLectures.map((lecture) => ({
        lecture: lecture._id,
        isUnlocked: lecture.order === 1,
        quizAttempts: [],
        isCompleted: false,
      })),
      currentLecture: sortedLectures[0]._id,
    });

    try {
      const message = {
        from: "Study Sync",
        to: user.email,
        subject: "Payment Successfull",
        html: paymentSuccessfullTemplate(
          course.title,
          course.courseId,
          course.price,
          user.name,
          razorpay_payment_id,
          payment[0].createdAt.toString(),
          razorpay_order_id
        ),
      };
      const response = await transporter.sendMail(message);

      await session.commitTransaction();
    } catch (emailError) {
      console.error("Error sending success email:", emailError);
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: {
        paymentId: razorpay_payment_id,
        courseId: course._id,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
}
export default {
  createOrder,
  verifyPayment,
};
