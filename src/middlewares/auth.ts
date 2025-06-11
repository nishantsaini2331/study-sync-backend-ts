import { NextFunction, Request, Response } from "express";

import { ForbiddenError } from "../utils/errors/app.error";
import { verifyAuthToken } from "../utils/jwt";
import { JWTUser } from "../dto/user.dto";

async function auth(
  req: Request & { user?: JWTUser },
  res: Response,
  next: NextFunction
) {
  try {
    const token = req?.cookies?.token;
    if (!token) {
      res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
      return;
    }

    const decoded = verifyAuthToken(token);
    req.user = decoded as typeof req.user;
    next();
  } catch (error) {
    next(error);
  }
}

async function admin(
  req: Request & { user?: JWTUser },
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user;

    if (!user?.roles.includes("admin")) {
      res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
}

async function instructor(
  req: Request & { user?: JWTUser },
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user;

    if (!user?.roles.includes("instructor")) {
      res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
}

async function student(
  req: Request & { user?: JWTUser },
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user;

    if (!user?.roles.includes("student")) {
      res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
}

function isInstructorOrAdmin(
  req: Request & { user?: JWTUser },
  res: Response,
  next: NextFunction
) {
  const roles = req.user?.roles || [];
  if (roles.includes("instructor") || roles.includes("admin")) {
    next();
  } else {
    throw new ForbiddenError("Access denied. Not authorized.");
  }
}

function isInstructorOrStudent(
  req: Request & { user?: JWTUser },
  res: Response,
  next: NextFunction
) {
  const roles = req.user?.roles || [];
  if (roles.includes("instructor") || roles.includes("student")) {
    next();
  } else {
    throw new ForbiddenError("Access denied. Not authorized.");
  }
}

function isInstructorOrAdminOrStudent(
  req: Request & { user?: JWTUser },
  res: Response,
  next: NextFunction
) {
  const roles = req.user?.roles || [];
  if (
    roles.includes("instructor") ||
    roles.includes("admin") ||
    roles.includes("student")
  ) {
    next();
  } else {
    throw new ForbiddenError("Access denied. Not authorized.");
  }
}

export {
  auth,
  admin,
  instructor,
  student,
  isInstructorOrAdmin,
  isInstructorOrStudent,
  isInstructorOrAdminOrStudent,
};
