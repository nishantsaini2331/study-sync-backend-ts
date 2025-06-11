import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { IRequest } from "../interfaces/request.interface";
import { serverConfig } from "../config/serverConfig";

const RequestType = {
  instructorRequest: {
    CREATE_COURSE: "CREATE_COURSE",
    EDIT_COURSE: "EDIT_COURSE",
    DELETE_COURSE: "DELETE_COURSE",
    ADD_MODULE: "ADD_MODULE",
    EDIT_MODULE: "EDIT_MODULE",
    DELETE_MODULE: "DELETE_MODULE",
    EDIT_FINAL_QUIZ: "EDIT_FINAL_QUIZ",
    INCREASE_COURSE_CREATE_LIMIT: "INCREASE_COURSE_CREATE_LIMIT",
  },
  studentRequest: {
    RESET_QUIZ_ATTEMPTS: "RESET_QUIZ_ATTEMPTS",
    EXTENSION_REQUEST: "EXTENSION_REQUEST",
    REFUND_REQUEST: "REFUND_REQUEST",
    CERTIFICATE_ISSUE: "CERTIFICATE_ISSUE",
  },
};

const RequestStatus = {
  PENDING: "PENDING",
  IN_REVIEW: "IN_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

const RequestSchema = new mongoose.Schema<IRequest>(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      default: () => `REQ-${uuidv4().split("-")[0].toUpperCase()}`,
    },

    requestType: {
      type: String,
      required: true,
      enum: [
        ...Object.values(RequestType.instructorRequest),
        ...Object.values(RequestType.studentRequest),
      ],
    },

    status: {
      type: String,
      required: true,
      enum: Object.values(RequestStatus),
      default: RequestStatus.PENDING,
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    requesterRole: {
      type: String,
      required: true,
      enum: ["instructor", "student", "admin"],
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    relatedEntities: {
      entityType: {
        type: String,
        enum: ["Course", "Lecture", "Quiz", "User"],
        required: true,
      },
      entityId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "relatedEntities.entityType",
        required: true,
      },
    },

    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileType: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    requestedChanges: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: serverConfig.ADMIN_USER_ID,
    },

    resolvedAt: {
      type: Date,
    },

    comments: [
      {
        comment: String,
        commentedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        commenterRole: {
          type: String,
          enum: ["instructor", "student", "admin"],
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    adminNote: {
      type: String,
    },

    resolution: {
      action: String,
      reason: String,
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  },
  {
    timestamps: true,
  }
);

RequestSchema.index({ status: 1 });
RequestSchema.index({ requestedBy: 1 });
RequestSchema.index({ courseId: 1 });
RequestSchema.index({ requestType: 1 });
RequestSchema.index({ assignedTo: 1 });
RequestSchema.index({
  "relatedEntities.entityType": 1,
  "relatedEntities.entityId": 1,
});

RequestSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

RequestSchema.statics.findByCourse = function (courseId) {
  return this.find({
    "relatedEntities.entityType": "Course",
    "relatedEntities.entityId": courseId,
  });
};

RequestSchema.methods.approve = function (
  adminId: mongoose.Types.ObjectId,
  notes: string
) {
  this.status = RequestStatus.APPROVED;
  this.resolution = {
    action: "APPROVED",
    reason: notes,
    resolvedBy: adminId,
  };
  this.resolvedAt = Date.now();
  return this.save();
};

RequestSchema.methods.reject = function (
  adminId: mongoose.Types.ObjectId,
  reason: string
) {
  this.status = RequestStatus.REJECTED;
  this.resolution = {
    action: "REJECTED",
    reason: reason,
    resolvedBy: adminId,
  };
  this.resolvedAt = Date.now();
  return this.save();
};

RequestSchema.methods.addComment = function (
  text: string,
  userId: mongoose.Types.ObjectId,
  userRole: string
) {
  this.comments.push({
    text: text,
    commentedBy: userId,
    commenterRole: userRole,
  });
  return this.save();
};

const Request = mongoose.model<IRequest>("Request", RequestSchema);

export { Request, RequestType, RequestStatus };
