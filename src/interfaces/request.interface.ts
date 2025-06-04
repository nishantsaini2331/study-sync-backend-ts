import { Document, Types } from "mongoose";

export interface IRequest extends Document {
  requestId: string;
  requestType: string;
  status: string;
  requestedBy: Types.ObjectId;
  requesterRole: "instructor" | "student" | "admin";
  title: string;
  description: string;
  relatedEntities: {
    entityType: "Course" | "Lecture" | "Quiz" | "User";
    entityId: Types.ObjectId;
  };
  attachments: Array<{
    fileName: string;
    fileUrl: string;
    fileType: string;
    uploadedAt?: Date;
  }>;
  requestedChanges: Record<string, any>;
  assignedTo?: Types.ObjectId;
  resolvedAt?: Date;
  comments: Array<{
    comment: string;
    commentedBy: Types.ObjectId;
    commenterRole: "instructor" | "student" | "admin";
    timestamp?: Date;
  }>;
  adminNote?: string;
  resolution?: {
    action: string;
    reason: string;
    resolvedBy: Types.ObjectId;
  };
  createdAt?: Date;
  updatedAt?: Date;

  approve(adminId: Types.ObjectId, notes: string): Promise<IRequest>;
  reject(adminId: Types.ObjectId, reason: string): Promise<IRequest>;
  addComment(
    text: string,
    userId: Types.ObjectId,
    userRole: string
  ): Promise<IRequest>;
}
