import User from "../models/user.model";

import bcrypt from "bcryptjs";
import ShortUniqueId from "short-unique-id";
import { serverConfig } from "../config/serverConfig";
import { generateAuthToken } from "../utils/jwt";
import { transporter } from "../utils/transporter";

import jwt from "jsonwebtoken";
import emailExistence from "email-existence";
import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import InstructorOnBoardForm from "../models/instructorOnBoardForm.model";
import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { IUser, SocialInterFace } from "../interfaces/user.interface";
import {
  LoginUserDTO,
  OnboardFormDTO,
  RegisterUserDTO,
  ResetPasswordDTO,
  UpdateUserDTO,
} from "../dto/user.dto";
import { verifyAuthToken } from "../utils/jwt";
import { IInstructorOnBoardForm } from "../interfaces/instructorOnBoardFromSchema.interface";
import { Types } from "mongoose";
import { validateSocialLinks } from "../validators/validateSocialLinks";
const { randomUUID } = new ShortUniqueId({ length: 6 });

import { uploadMedia, deleteMediaFromCloudinary } from "../utils/cloudinary";
import { UploadApiResponse } from "cloudinary";
import { ICourse } from "../interfaces/course.interface";

const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

const isProduction = serverConfig.NODE_ENV === "production";

// admin.initializeApp({
//   credential: admin.credential.cert({
//     type: serverConfig.FIREBASE_TYPE,
//     project_id: serverConfig.FIREBASE_PROJECT_ID,
//     private_key_id: serverConfig.FIREBASE_PRIVATE_KEY_ID,
//     private_key: serverConfig.FIREBASE_PRIVATE_KEY,
//     client_email: serverConfig.FIREBASE_CLIENT_EMAIL,
//     client_id: serverConfig.FIREBASE_CLIENT_ID,
//     auth_uri: serverConfig.FIREBASE_AUTH_URI,
//     token_uri: serverConfig.FIREBASE_TOKEN_URI,
//     auth_provider_x509_cert_url:
//       serverConfig.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
//     client_x509_cert_url: serverConfig.FIREBASE_CLIENT_X509_CERT_URL,
//     universe_domain: serverConfig.FIREBASE_UNIVERSAL_DOMAIN,
//   }),
// });

async function sendVerificationEmail(user: IUser) {
  const verifyToken = await generateAuthToken(user);

  const url = `http://localhost:5173/verify-email/${verifyToken}`;
  const message = {
    from: "Study Sync",
    to: user.email,
    subject: "Account Verification",
    text: `Click this link to verify your account: ${url}`,
  };

  const response = await transporter.sendMail(message);
}

function checkEmailExistence(email: string) {
  return new Promise((resolve) => {
    emailExistence.check(email, (err: any, result: boolean) => {
      if (err) {
        resolve(false);
      } else {
        resolve(result);
      }
    });
  });
}

async function verifyEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const { verificationToken } = req.params;

    const { id } = verifyAuthToken(verificationToken);

    const user = await User.findByIdAndUpdate(
      id,
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      res.status(400).json({
        success: false,
        message: "User not exist",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
    return;
  } catch (error) {
    next(error);
  }
}

async function register(
  req: Request<{}, {}, RegisterUserDTO>,
  res: Response,
  next: NextFunction
) {
  try {
    const { name, email, password, qualification, isAdmin = false } = req.body;

    if (!isAdmin) {
      if (!passwordRegex.test(password)) {
        res.status(400).json({
          success: false,
          message:
            "Password must be at least 8 characters long, contain at least one number, one uppercase letter, one lowercase letter, and one special character",
        });
        return;
      }
      const isValid = await checkEmailExistence(email);

      if (!isValid) {
        res.status(400).json({
          success: false,
          message: "Email is invalid or does not exist",
        });
        return;
      }
    }

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      if (existingUser.googleAuth) {
        res.status(400).json({
          success: false,
          message:
            "This email is already registered with Google, please login with Google",
        });
        return;
      }

      if (existingUser.isVerified) {
        res.status(400).json({
          success: false,
          message: "User already exists",
        });
        return;
      } else {
        sendVerificationEmail(existingUser);
        res.status(400).json({
          success: false,
          message: "Please verify your email address",
        });
        return;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const username = email.split("@")[0] + randomUUID();

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      username: username.length > 20 ? username.slice(0, 20) : username,
      qualification,

      isVerified: isAdmin ? true : false,
    });

    if (!isAdmin) {
      sendVerificationEmail(user);
    }

    res.status(201).json({
      success: true,
      message: "Please verify your email address to activate your account",
    });
  } catch (error) {
    next(error);
  }
}

async function login(
  req: Request<{}, {}, LoginUserDTO>,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, password } = req.body;

    const user = (await User.findOne({
      email,
    })) as IUser;

    if (!user) {
      res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    if (user.googleAuth) {
      res.status(400).json({
        success: false,
        message:
          "This email is registered with Google, please login with Google",
      });
      return;
    }

    if (!user.isVerified) {
      sendVerificationEmail(user);
      res.status(400).json({
        success: false,
        message: "Please verify your email address",
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    const token = await generateAuthToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
      },
    });
    return;
  } catch (error) {
    next(error);
  }
}

async function googleAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const { accessToken } = req.body;

    const response = await getAuth().verifyIdToken(accessToken);

    const { email, name, photoUrl } = response;

    let user = await User.findOne({ email });

    if (user) {
      // already registered
      if (user.googleAuth) {
        let token = await generateAuthToken(user);

        return res
          .status(200)
          .cookie("token", token, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
          })
          .json({
            success: true,
            message: "User logged in successfully",
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
            },
          });
      } else {
        return res.status(400).json({
          success: false,
          message:
            "This email is already registered with email and password, please login with email and password",
        });
      }
    }

    let newUser = await User.create({
      name: name,
      email,
      googleAuth: true,
      photoUrl,
      isVerified: true,
    });

    let token = await generateAuthToken(newUser);

    return res
      .status(201)
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
      })
      .json({
        success: true,
        message: "User registered successfully",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
        },
      });
  } catch (error) {
    next(error);
  }
}

async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    res
      .status(200)
      .clearCookie("token", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
      })
      .json({
        success: true,
        message: "User logged out successfully",
      });
    return;
  } catch (error) {
    res.status(500).send();
  }
}

async function getUser(
  req: Request<{ username: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username })
      .select("bio name photoUrl socials qualification headline username")
      .lean();

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      user,
    });
    return;
  } catch (error) {
    next(error);
  }
}

async function updateUser(
  req: Request<{}, {}, UpdateUserDTO>,
  res: Response,
  next: NextFunction
) {
  try {
    const updateFields = [
      "name",
      "username",
      "photoUrl",
      "bio",
      "headline",
      "qualification",
      "socials",
    ];

    const image = req.file;

    const user = (await User.findById(req.user?.id)) as IUser;

    const isUserExistWithUsername = await User.findOne({
      username: req.body.username,
    });

    if (
      isUserExistWithUsername &&
      isUserExistWithUsername._id != req.user?.id
    ) {
      res.status(400).json({
        success: false,
        message: "Username already exists",
      });
      return;
    }

    let socials: SocialInterFace;

    if (req.body.socials) {
      socials = JSON.parse(req.body.socials);
      const socialValidation = validateSocialLinks(socials);
      if (!socialValidation.isValid) {
        res.status(400).json({
          success: false,
          message: socialValidation.message,
        });
        return;
      }
    }

    if (image) {
      if (user.photoUrlId) {
        await deleteMediaFromCloudinary(user.photoUrlId);
      }
      const { secure_url, public_id } = (await uploadMedia(
        `data:image/jpeg;base64,${image.buffer.toString("base64")}`
      )) as UploadApiResponse;

      user.photoUrl = secure_url;
      user.photoUrlId = public_id;
    }

    updateFields.forEach((field) => {
      const key = field as keyof UpdateUserDTO;
      const value = req.body[key];

      if (value !== undefined) {
        if (key === "socials" && typeof socials === "object") {
          user.socials = { ...user.socials, ...socials };
        } else {
          (user as any)[key] = value;
        }
      }
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        name: user.name,
        username: user.username,
        photoUrl: user.photoUrl,
        bio: user.bio,
        headline: user.headline,
        qualification: user.qualification,
        socials: user.socials,
      },
    });
    return;
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findByIdAndDelete(req.user?.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    if (user.photoUrlId) {
      await deleteMediaFromCloudinary(user.photoUrlId);
    }

    res.status(200).json({
      success: true,
      message: "Profile deleted successfully",
    });
    return;
  } catch (error) {
    next();
  }
}

async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { newPassword, currentPassword } = req.body;

    if (!newPassword || !currentPassword) {
      res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
      return;
    }

    const user = (await User.findById(req.user?.id)) as IUser;

    if (user?.googleAuth) {
      res.status(400).json({
        success: false,
        message: "Google authenticated users cannot change password directly",
      });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user?.password);

    if (!isMatch) {
      res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
      return;
    }

    if (!passwordRegex.test(newPassword)) {
      res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long, contain at least one number, one uppercase letter, one lowercase letter, and one special character",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
    return;
  } catch (error) {
    next(error);
  }
}

async function onboard(
  req: Request<{}, {}, OnboardFormDTO>,
  res: Response,
  next: NextFunction
) {
  try {
    const { questions } = req.body;
    const userId = req.user?.id;

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const form = (await InstructorOnBoardForm.create({
      userId,
      questions,
    })) as IInstructorOnBoardForm;

    user.instructorOnBoardFrom = form._id as Types.ObjectId;

    if (!user.roles.includes("instructor")) {
      user.roles.push("instructor");
    }
    await user.save();

    const token = await generateAuthToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: "we love you to onboard as an instructor",
    });

    return;
  } catch (error) {
    next(error);
  }
}

async function fetchProfile(
  req: Request<{ username: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username })
      .select(
        "bio name photoUrl socials qualification headline username createdCourses roles -_id"
      )
      .populate({
        path: "createdCourses",
        select: "title thumbnail description courseId status -_id",
      });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }
    let createdCourses = (user.createdCourses as ICourse[]).filter(
      (course) => course.status === "published"
    );

    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        createdCourses,
      },
    });
    return;
  } catch (error) {
    return;
  }
}

async function forgotPassword(
  req: Request<{}, {}, { email: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(200).json({
        success: true,
        message:
          "If your email is registered, you will receive a password reset link",
      });
      return;
    }

    if (user.googleAuth) {
      res.status(200).json({
        success: true,
        message:
          "If your email is registered, you will receive a password reset link",
      });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);

    await user.save();

    const resetUrl = `${serverConfig.FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Password Reset Request",
      html: `
          <h1>You requested a password reset</h1>
          <p>Please click the following link to reset your password:</p>
          <a href="${resetUrl}" target="_blank">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message:
        "If your email is registered, you will receive a password reset link",
    });
    return;
  } catch (error) {
    next(error);
  }
}

async function resetPassword(
  req: Request<{}, {}, ResetPasswordDTO>,
  res: Response,
  next: NextFunction
) {
  try {
    const { token, password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: "Invalid or expired password reset token",
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.lastPasswordChange = new Date();

    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Password Reset Confirmation",
      html: `
          <h1>Your password has been reset successfully</h1>
          <p>If you didn't request this change, please contact support.</p>
        `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
    return;
  } catch (error) {
    next(error);
  }
}

async function verifyResetToken(
  req: Request<{ token: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { token } = req.params;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: "Password reset token is invalid or has expired",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Token is valid",
    });
    return;
  } catch (error) {
    next(error);
  }
}

export default {
  register,
  login,
  logout,
  getUser,
  updateUser,
  deleteUser,
  verifyEmail,
  onboard,
  fetchProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyResetToken,
};
