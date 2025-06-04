import mongoose, { Types } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { ICertificate } from "../interfaces/certificate.interface";
import { ICourse } from "../interfaces/course.interface";

const courseCertificationSchema = new mongoose.Schema<ICertificate>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    learnerName: {
      type: String,
      required: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    instructorName: {
      type: String,
      required: true,
    },
    certificateId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      required: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    finalQuizScore: {
      type: Number,
      required: true,
    },
    courseCompletionDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["issued", "revoked"],
      default: "issued",
    },
  },
  { timestamps: true }
);

courseCertificationSchema.statics.generateCertificate = async function (
  student: { id: Types.ObjectId; name: string },
  course: ICourse,
  quizAttempt
) {
  try {
    const existingCertificate = await this.findOne({
      user: student.id,
      course: course._id,
    });

    if (existingCertificate) {
      return {
        success: false,
        message: "Certificate already generated",
        certificateId: existingCertificate.certificateId,
      };
    }
    const instructorName =
      typeof course.instructor !== "string" && "name" in course.instructor
        ? course.instructor.name
        : "Unknown Instructor";

    const newCertificate = await this.create({
      user: student.id,
      course: course._id,
      learnerName: student.name,
      courseName: course.title,
      instructorName,
      finalQuizScore: quizAttempt.score,
      courseCompletionDate: quizAttempt.createdAt,
    });

    return {
      success: true,
      message: "Certificate generated successfully",
      certificateId: newCertificate.certificateId,
      certificate: newCertificate,
    };
  } catch (error: unknown) {
    let message = "Something went wrong";
    if (error instanceof Error) {
      message: error.message;
    }
    return {
      success: false,
      message,
    };
  }
};

courseCertificationSchema.methods.revokeCertificate = async function () {
  this.status = "revoked";
  await this.save();
  return {
    success: true,
    message: "Certificate has been revoked",
  };
};

courseCertificationSchema.methods.verifyCertificate = function () {
  return {
    isValid: this.status === "issued",
    certificateId: this.certificateId,
    courseName: this.courseName,
    learnerName: this.learnerName,
    issueDate: this.issueDate,
    status: this.status,
  };
};

const CourseCertification = mongoose.model<ICertificate>(
  "CourseCertification",
  courseCertificationSchema
);

export default CourseCertification;
