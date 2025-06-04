import mongoose from "mongoose";
import { IUser } from "../interfaces/user.interface";

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
    },

    roles: {
      type: [String],
      enum: ["instructor", "student", "admin"],
      default: ["student"],
    },

    purchasedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],

    createdCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],

    photoUrl: {
      type: String,
      default: "",
    },

    photoUrlId: {
      type: String,
      default: null,
    },

    socials: {
      youtube: {
        type: String,
        default: "",
      },
      twitter: {
        type: String,
        default: "",
      },
      linkedin: {
        type: String,
        default: "",
      },
      github: {
        type: String,
        default: "",
      },
      website: {
        type: String,
        default: "",
      },
    },
    bio: {
      type: String,
      default: "",
    },
    headline: {
      type: String,
      default: "",
    },

    qualification: {
      type: String,
      enum: [
        "Secondary (10th Pass)",
        "Higher Secondary (12th Pass)",
        "Bachelors",
        "Masters",
        "PhD",
        "Other",
      ],
      default: "Other",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    googleAuth: {
      type: Boolean,
      default: false,
    },

    courseCreateLimit: {
      type: Number,
      default: 2,
    },

    instructorOnBoardFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstructorOnBoardFrom",
      default: null,
    },

    cart: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    paymentHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
      },
    ],
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    lastPasswordChange: {
      type: Date,
      default: null,
    },

    instructorProfile: {
      totalStudents: {
        type: Number,
        default: 0,
      },
      totalCourses: {
        type: Number,
        default: 0,
      },
      totalEarnings: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
