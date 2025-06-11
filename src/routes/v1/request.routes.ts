import express from "express";
import {
  admin,
  auth,
  isInstructorOrAdmin,
  isInstructorOrStudent,
} from "../../middlewares/auth";
import { requestController } from "../../controllers";
const router = express.Router();

router.post("/", auth, requestController.createRequest);
router.post("/:requestId/comment", auth, requestController.addComment);
router.get(
  "/my-requests",
  auth,
  isInstructorOrStudent,
  requestController.getMyRequests
);
router.get(
  "/student-requests",
  auth,
  isInstructorOrAdmin,
  requestController.getStudentRequests
);
router.get("/admin-requests", auth, admin, requestController.getRequests);
router.put(
  "/:requestId/update",
  auth,
  isInstructorOrAdmin,
  requestController.updateRequest
);
router.delete(
  "/:requestId/delete",
  auth,
  isInstructorOrStudent,
  requestController.deleteRequest
);

export default router;
