import { NextFunction, Request, Response } from "express";

export const preprocessLectureBody = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (typeof req.body.mcqs === "string") {
      req.body.mcqs = JSON.parse(req.body.mcqs);
    }

    if (typeof req.body.requiredPassPercentage === "string") {
      req.body.requiredPassPercentage = Number(req.body.requiredPassPercentage);
    }

    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid MCQs format or bad input",
    });
  }
};
