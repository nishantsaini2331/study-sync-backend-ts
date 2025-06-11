import Course from "../models/course.model";
import Lecture from "../models/lecture.model";
import MCQ from "../models/mcq.model";

import ShortUniqueId from "short-unique-id";
const { randomUUID } = new ShortUniqueId({ length: 4 });

import { uploadMedia, deleteVideoFromCloudinary } from "../utils/cloudinary";
import { NextFunction, Request, Response } from "express";
import { UploadApiResponse } from "cloudinary";
import {
  CreateLectureDto,
  UpdateLectureDto,
  UpdateMcqDTO,
} from "../dto/lecture.dto";

async function createLecture(
  req: Request<{ id: string }, {}, CreateLectureDto>,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user;
    const courseId = req.params.id;
    const video = req.file;

    if (!video) {
      res
        .status(400)
        .json({ success: false, message: "Video file is required" });
      return;
    }

    const { title, description, requiredPassPercentage, mcqs } = req.body;

    const course = await Course.findOne({ courseId });

    if (!course) {
      res.status(404).json({ success: false, message: "Course not found" });
      return;
    }

    const highestOrderLecture = await Lecture.findOne(
      { course: course._id },
      {},
      { sort: { order: -1 } }
    );

    const newOrder = highestOrderLecture ? highestOrderLecture.order + 1 : 1;

    const {
      secure_url: videoUrl,
      public_id: videoId,
      duration,
    } = (await uploadMedia(
      `data:video/mp4;base64,${video.buffer.toString("base64")}`
    )) as UploadApiResponse;

    const lectureId =
      course.courseId + "-" + title.split(" ").join("-") + randomUUID();

    const lecture = await Lecture.create({
      title,
      description,
      videoUrl,
      videoId,
      course: course._id,
      duration,
      requiredPassPercentage,
      lectureId,
      order: newOrder,
    });

    // Now create MCQs and associate them with the lecture

    await Course.findByIdAndUpdate(course._id, {
      $push: { lectures: lecture._id },
    });

    const mcqIds = [];
    for (let mcq of mcqs) {
      const createdMcq = await MCQ.create({
        lecture: lecture._id, // Assign the lecture ID here
        question: mcq.question,
        options: mcq.options,
        correctOption: mcq.correctOption,
      });
      mcqIds.push(createdMcq._id);
    }

    // Optionally update the lecture with the list of MCQs (if needed)
    lecture.mcqs = mcqIds;
    await lecture.save();

    res.status(201).json({
      success: true,
      message: "Lecture created successfully",
      lecture,
    });
    return;
  } catch (error) {
    next(error);
  }
}

async function getLecture(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const lectureId = req.params.id;
    const lecture = await Lecture.findOne({ lectureId }).populate("mcqs");
    if (!lecture) {
      res.status(404).json({ success: false, message: "Lecture not found" });
      return;
    }
    res.status(200).json({ success: true, lecture });
    return;
  } catch (error) {
    next(error);
  }
}

async function updateLecture(
  req: Request<{ id: string }, {}, UpdateLectureDto>,
  res: Response,
  next: NextFunction
) {
  try {
    const lectureId = req.params.id;
    const { title, description, requiredPassPercentage } = req.body;

    const mcqs: UpdateMcqDTO[] = req.body.mcqs ? JSON.parse(req.body.mcqs) : [];
    const video = req.file;

    const lecture = await Lecture.findOne({ lectureId }).populate("mcqs");

    if (!lecture) {
      res.status(404).json({ success: false, message: "Lecture not found" });
      return;
    }

    const existingMcqIds = lecture.mcqs.map((mcq) => mcq._id.toString());
    const newMcqIds = mcqs.map((mcq) => mcq._id);
    const mcqIdsToDelete = existingMcqIds.filter(
      (id) => !newMcqIds.includes(id)
    );

    if (mcqIdsToDelete.length > 0) {
      await MCQ.deleteMany({ _id: { $in: mcqIdsToDelete } });
      await Lecture.findByIdAndUpdate(lecture._id, {
        $pull: { mcqs: { $in: mcqIdsToDelete } },
      });
    }

    for (let mcq of mcqs) {
      if (mcq._id) {
        const existingMcq = await MCQ.findById(mcq._id);
        if (existingMcq) {
          existingMcq.question = mcq.question;
          existingMcq.options = mcq.options;
          existingMcq.correctOption = mcq.correctOption;
          await existingMcq.save();
        } else {
          res.status(404).json({
            success: false,
            message: `MCQ with ID ${mcq._id} not found`,
          });
          return;
        }
      } else {
        const newMcq = await MCQ.create({
          lecture: lecture._id,
          question: mcq.question,
          options: mcq.options,
          correctOption: mcq.correctOption,
        });
        lecture.mcqs.push(newMcq._id);
      }
    }

    lecture.title = title || lecture.title;
    lecture.description = description || lecture.description;
    lecture.requiredPassPercentage =
      requiredPassPercentage || lecture.requiredPassPercentage;

    if (video) {
      await deleteVideoFromCloudinary(lecture.videoId);
      const { secure_url: videoUrl, public_id: videoId } = (await uploadMedia(
        `data:video/mp4;base64,${video.buffer.toString("base64")}`
      )) as UploadApiResponse;
      lecture.videoUrl = videoUrl;
      lecture.videoId = videoId;
    }

    await lecture.save();

    res.status(200).json({
      success: true,
      message: "Lecture updated successfully",
      lecture,
    });
    return;
  } catch (error) {
    next(error);
  }
}

async function deleteLecture(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const lectureId = req.params.id;
    const lecture = await Lecture.findOne({ lectureId });

    if (!lecture) {
      res.status(404).json({ success: false, message: "Lecture not found" });
      return;
    }

    await Lecture.findByIdAndDelete(lecture._id);
    await MCQ.deleteMany({ _id: { $in: lecture.mcqs } });
    await deleteVideoFromCloudinary(lecture.videoId);
    await Course.findByIdAndUpdate(lecture.course, {
      $pull: { lectures: lecture._id },
    });

    res.status(200).json({
      success: true,
      message: "Lecture deleted successfully",
    });
    return;
  } catch (error) {
    next;
  }
}

export default { createLecture, getLecture, updateLecture, deleteLecture };
