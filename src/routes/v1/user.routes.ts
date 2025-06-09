import express, { Request, Response } from "express";
import { userController } from "../../controllers";
import { validateParams, validateReqBody } from "../../middlewares/validate";
import {
  FetchProfileSchema,
  ForgotPasswordSchema,
  LoginUserSchema,
  OnboardFormSchema,
  RegisterUserSchema,
  ResetPasswordSchema,
  UpdateUserSchema,
  VerifyResetTokenSchema,
} from "../../dto/user.dto";
import { auth } from "../../middlewares/auth";
import upload from "../../utils/multer";
import User from "../../models/user.model";
import { IUser } from "../../interfaces/user.interface";
const router = express.Router();

router.post(
  "/register",
  validateReqBody(RegisterUserSchema),
  userController.register
);
router.post("/login", validateReqBody(LoginUserSchema), userController.login);
router.get("/logout", auth, userController.logout);
router.get("/user/:username", userController.getUser);
router.patch(
  "/user",
  auth,
  validateReqBody(UpdateUserSchema),
  upload.single("photoUrl"),
  userController.updateUser
);
router.delete("/user", auth, userController.deleteUser);
router.get("/verify-email/:verificationToken", userController.verifyEmail);

router.post(
  "/instructor/onboard",
  auth,
  validateReqBody(OnboardFormSchema),
  userController.onboard
);
router.get(
  "/profile/:username",
  validateParams(FetchProfileSchema),
  userController.fetchProfile
);

router.post("/change-password", auth, userController.changePassword);
router.post(
  "/forgot-password",
  validateReqBody(ForgotPasswordSchema),
  userController.forgotPassword
);
router.post(
  "/reset-password",
  validateReqBody(ResetPasswordSchema),
  userController.resetPassword
);
router.post(
  "/verify-reset-token/:token",
  validateParams(VerifyResetTokenSchema),
  userController.verifyResetToken
);

router.get("/auth", auth, async (req: Request, res: Response) => {
  const user = (await User.findById(req.user?.id)
    .select("name photoUrl username roles email courseCreateLimit cart")
    .populate({ path: "cart", select: "courseId -_id" })
    .lean()) as IUser;

  const courseIds = user.cart.map((course) => course.courseId);

  res.json({
    user: {
      ...user.toObject(),
      cart: courseIds,
    },
    success: true,
    message: "Authorized access",
  });
});

export default router;
