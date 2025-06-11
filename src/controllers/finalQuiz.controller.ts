import { NextFunction, Request, Response } from "express";
import Course from "../models/course.model";
import FinalQuiz from "../models/finalQuiz.model";
import MCQ from "../models/mcq.model";
import { CreateQuizDto, UpdateQuizDto } from "../dto/finalQuiz.dto";
import { Types } from "mongoose";
import { JWTUser } from "../dto/user.dto";

// function validateQuiz(quiz) {
//   if (!quiz || !quiz.length) {
//     throw new Error("Quiz is required");
//   }

//   if (quiz.length < 5) {
//     throw new Error("Minimum 5 MCQs required");
//   }

//   if (quiz.length > 20) {
//     throw new Error("Maximum 20 MCQs allowed");
//   }

//   quiz.forEach((mcq, index) => {
//     if (!mcq.question.trim()) {
//       throw new Error(`Question ${index + 1} is empty`);
//     }

//     if (mcq.correctOption === null || mcq.correctOption === undefined) {
//       throw new Error(`Correct option not selected for question ${index + 1}`);
//     }

//     if (!mcq.options || mcq.options.length < 2) {
//       throw new Error(
//         `At least two options required for question ${index + 1}`
//       );
//     }

//     mcq.options.forEach((option, optIndex) => {
//       if (!option.trim()) {
//         throw new Error(
//           `Option ${optIndex + 1} is empty in question ${index + 1}`
//         );
//       }
//     });
//   });
// }

async function createFinalQuiz(
  req: Request<{ courseId: string }, any, CreateQuizDto> & { user?: JWTUser },
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user;
    const { courseId } = req.params;
    const { quiz } = req.body;

    const course = await Course.findOne({ courseId });

    if (!course) {
      res.status(404).json({ success: false, message: "Course not found" });
      return;
    }

    if (course.instructor.toString() !== user?.id) {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }

    // try {
    //   validateQuiz(quiz);
    // } catch (validationError) {
    //     res
    //     .status(400)
    //     .json({ success: false, message: validationError.message });return
    // }

    const mcqIds = [];

    for (let mcq of quiz) {
      const createdMcq = await MCQ.create({
        course: course._id,
        question: mcq.question,
        options: mcq.options,
        correctOption: mcq.correctOption,
      });
      mcqIds.push(createdMcq._id);
    }

    const finalQuiz = await FinalQuiz.create({
      course: course._id,
      mcqs: mcqIds,
    });

    await Course.findByIdAndUpdate(course._id, { finalQuiz: finalQuiz._id });

    res.status(201).json({ success: true, finalQuiz });
    return;
  } catch (error) {
    next(error);
  }
}

async function getFinalQuiz(
  req: Request & { user?: JWTUser },
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user;
    const { courseId } = req.params;

    const course = await Course.findOne({ courseId }).populate("finalQuiz");

    if (!course) {
      res.status(404).json({ success: false, message: "Course not found" });
      return;
    }

    if (course.instructor.toString() !== user?.id) {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }

    if (!course.finalQuiz) {
      res.status(404).json({ success: false, message: "Final quiz not found" });
      return;
    }

    const finalQuiz = await FinalQuiz.findById(course.finalQuiz).populate(
      "mcqs"
    );

    res.status(200).json({ success: true, finalQuiz });
  } catch (error) {
    next(error);
  }
}

async function updateFinalQuiz(
  req: Request<{ courseId: string }, any, UpdateQuizDto> & { user?: JWTUser },
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user;
    const { courseId } = req.params;
    const { quiz } = req.body;

    const course = await Course.findOne({ courseId });

    if (!course) {
      res.status(404).json({ success: false, message: "Course not found" });
      return;
    }

    if (course.instructor.toString() !== user?.id) {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }
    // try {
    //   validateQuiz(quiz);
    // } catch (validationError) {
    //    res
    //     .status(400)
    //     .json({ success: false, message: validationError.message }); return
    // }

    const existingFinalQuiz = await FinalQuiz.findById(course.finalQuiz);

    if (!existingFinalQuiz) {
      res.status(404).json({ success: false, message: "Final quiz not found" });
      return;
    }

    const existingMcqIds = existingFinalQuiz.mcqs.map((mcq) => mcq.toString());

    const newMcqIds = quiz.map((mcq) => mcq._id);

    const mcqIdsToDelete = existingMcqIds.filter(
      (id) => !newMcqIds.includes(id)
    );

    if (mcqIdsToDelete.length > 0) {
      await MCQ.deleteMany({ _id: { $in: mcqIdsToDelete } });
      await FinalQuiz.findByIdAndUpdate(existingFinalQuiz._id, {
        $pull: { mcqs: { $in: mcqIdsToDelete } },
      });
    }

    for (let mcq of quiz) {
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
          course: course._id,
          question: mcq.question,
          options: mcq.options,
          correctOption: mcq.correctOption,
        });
        existingFinalQuiz.mcqs.push(newMcq._id as Types.ObjectId);
      }
    }

    await existingFinalQuiz.save();

    res.status(200).json({ success: true, message: "Final quiz updated" });
  } catch (error) {
    next(error);
  }
}

export default {
  createFinalQuiz,
  getFinalQuiz,
  updateFinalQuiz,
};
