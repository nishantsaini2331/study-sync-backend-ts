import { NextFunction, Request, Response } from "express";
import Comment from "../models/comment.model";
import Course from "../models/course.model";
import Lecture from "../models/lecture.model";
import { Types } from "mongoose";
import { JWTUser } from "../dto/user.dto";

async function addComment(
  req: Request & { user?: JWTUser },
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user;

    const { lectureId } = req.params;
    const { comment } = req.body;

    if (!comment) {
      res.status(500).json({
        message: "Please enter the comment",
      });
      return;
    }

    const lecture = await Lecture.findOne({ lectureId });

    if (!lecture) {
      res.status(500).json({
        message: "Lecture not found",
      });
      return;
    }

    const course = await Course.findById(lecture.course);

    if (!course) {
      res.status(500).json({
        message: "Course not found",
      });
      return;
    }

    if (
      user?.id !== course.instructor.toString() &&
      !course.enrolledStudents.includes(new Types.ObjectId(user?.id))
    ) {
      res.status(400).json({
        success: false,
        message: "You are not valid user to add comment",
      });
      return;
    }

    const newComment = await Comment.create({
      comment,
      lecture: lecture._id,
      student: user?.id,
      course: lecture.course,
      isInstructor: user?.id === course.instructor.toString(),
    });

    await newComment.populate("student", "name email username profilePic");

    lecture.comments.push(newComment._id as Types.ObjectId);
    await lecture.save();

    res.status(200).json({
      success: true,
      message: "Comment added successfully",
      comment: newComment,
    });
    return;
  } catch (error) {
    next(error);
  }
}

async function deleteComment(
  req: Request & { user?: JWTUser },
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user;
    const { id } = req.params;

    const comment = await Comment.findById(id);

    if (!comment) {
      res.status(500).json({
        message: "Comment is not found",
      });
      return;
    }

    const course = await Course.findById(comment.course);

    if (!course) {
      res.status(500).json({
        message: "Course is not found",
      });
      return;
    }

    if (
      comment.student.toString() != user?.id &&
      user?.id !== course.instructor.toString()
    ) {
      res.status(400).json({
        success: false,
        message: "You are not valid user to delete this comment",
      });
      return;
    }

    async function deleteCommentAndReplies(id: Types.ObjectId) {
      let comment = await Comment.findById(id);

      if (!comment) {
        return;
      }

      for (let replyId of comment.replies) {
        await deleteCommentAndReplies(replyId as Types.ObjectId);
      }

      if (comment.parentComment) {
        await Comment.findByIdAndUpdate(comment.parentComment, {
          $pull: { replies: id },
        });
      }

      await Comment.findByIdAndDelete(id);
    }

    await deleteCommentAndReplies(new Types.ObjectId(id));

    await Lecture.findByIdAndUpdate(comment.lecture, {
      $pull: { comments: id },
    });

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
    return;
  } catch (error) {
    next(error);
  }
}

async function editComment(
  req: Request & { user?: JWTUser },
  res: Response,
  next: NextFunction
) {
  try {
    const student = req.user;
    const { id } = req.params;
    const { updatedCommentText } = req.body;

    const comment = await Comment.findById(id);

    if (!comment) {
      res.status(500).json({
        message: "Comment is not found",
      });
      return;
    }

    if (comment.student.toString() != student?.id) {
      res.status(400).json({
        success: false,
        message: "You are not valid user to edit this comment",
      });
      return;
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      {
        comment: updatedCommentText,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      updatedComment,
    });
    return;
  } catch (error) {
    next(error);
  }
}

async function likeDislikeComment(
  req: Request& { user?: JWTUser },
  res: Response,
  next: NextFunction
) {
  try {
    const student = req.user;
    const { id } = req.params;

    const comment = await Comment.findById(id);

    if (!comment) {
      res.status(500).json({
        message: "Comment is not found",
      });
      return;
    }

    if (comment.likes.includes(new Types.ObjectId(student?.id))) {
      await Comment.findByIdAndUpdate(id, {
        $pull: { likes: student?.id },
      });

      res.status(200).json({
        success: true,
        message: "Comment unliked successfully",
      });
      return;
    } else {
      await Comment.findByIdAndUpdate(id, {
        $push: { likes: student?.id },
      });

      res.status(200).json({
        success: true,
        message: "Comment liked successfully",
      });
      return;
    }
  } catch (error) {
    next(error);
  }
}

async function addNestedComment(
  req: Request & { user?: JWTUser },
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user;
    const { id } = req.params;
    const { reply, lectureId } = req.body;

    if (!reply) {
      res.status(500).json({
        message: "Please enter the comment",
      });
      return;
    }

    const lecture = await Lecture.findOne({ lectureId });
    if (!lecture) {
      res.status(500).json({
        message: "Lecture not found",
      });
      return;
    }
    const course = await Course.findById(lecture.course);

    if (!course) {
      res.status(500).json({
        message: "Course not found",
      });
      return;
    }

    if (
      user?.id !== course.instructor.toString() &&
      !course.enrolledStudents.includes(new Types.ObjectId(user?.id))
    ) {
      res.status(400).json({
        success: false,
        message: "You are not valid user to add comment",
      });
      return;
    }

    const parentComment = await Comment.findById(id);

    if (!parentComment) {
      res.status(500).json({
        message: "Parent Comment not found",
      });
      return;
    }

    const newComment = await Comment.create({
      comment: reply,
      lecture: parentComment.lecture,
      student: user?.id,
      course: parentComment.course,
      parentComment: parentComment._id,
      isInstructor: user?.id === course.instructor.toString(),
    });

    await newComment.populate("student", "name email username profilePic");

    parentComment.replies.push(newComment._id as Types.ObjectId);
    await parentComment.save();

    res.status(200).json({
      success: true,
      message: "Comment added successfully",
      reply: newComment,
    });
    return;
  } catch (error) {
    next(error);
  }
}

async function pinComment(req: Request & { user?: JWTUser }, res: Response, next: NextFunction) {
  try {
    const instructor = req.user;
    const { id } = req.params;

    const { isPinned } = req.body;

    const comment = await Comment.findById(id).populate("lecture");

    if (!comment) {
      res.status(500).json({
        message: "Comment is not found",
      });
      return;
    }

    const course = await Course.findById(comment.course);

    if (!course) {
      res.status(500).json({
        message: "Course is not found",
      });
      return;
    }

    if (instructor?.id !== course.instructor.toString()) {
      res.status(400).json({
        success: false,
        message: "You are not valid user to pin this comment",
      });
      return;
    }
    if (isPinned) {
      await Comment.findByIdAndUpdate(id, {
        isPinned: true,
      });
      res.status(200).json({
        success: true,
        message: "Comment pinned successfully",
      });
      return;
    } else {
      await Comment.findByIdAndUpdate(id, {
        isPinned: false,
      });
      res.status(200).json({
        success: true,
        message: "Comment unpinned successfully",
      });
      return;
    }
  } catch (error) {
    next(error);
  }
}

export default {
  addComment,
  deleteComment,
  editComment,
  likeDislikeComment,
  addNestedComment,
  pinComment,
};
