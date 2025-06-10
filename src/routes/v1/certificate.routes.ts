import express from "express";
import { auth, student } from "../../middlewares/auth";
import { certificateController } from "../../controllers";

const router = express.Router();

router.get(
  "/download-certificate/:certificateId",
  auth,
  student,
  certificateController.downloadCertificate
);

router.get(
  "/verify-certificate/:certificateId",
  certificateController.verifyCertificate
);

export default router;
