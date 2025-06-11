import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import CourseCertification from "../models/certificate.model";
import CourseProgress from "../models/courseProgress.model";
import QRCode from "qrcode";
import { serverConfig } from "../config/serverConfig";
import { NextFunction, Request, Response } from "express";
import { IUser } from "../interfaces/user.interface";
import { JWTUser } from "../dto/user.dto";

async function downloadCertificate(
  req: Request & { user?: JWTUser },
  res: Response,
  next: NextFunction
) {
  let browser = null;
  try {
    const student = req.user;
    const { certificateId } = req.params;

    const certificate = await CourseCertification.findOne({
      certificateId,
      student: student?.id,
    })
      .populate("course")
      .populate({
        path: "user",
        select: "name -_id",
      });

    if (!certificate) {
      res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
      return;
    }

    const courseProgress = await CourseProgress.findOne({
      student: student?.id,
      course: certificate.course._id,
    });

    if (!courseProgress) {
      res.status(404).json({
        success: false,
        message: "Course progress not found",
      });
      return;
    }

    const templatePath = path.join(
      __dirname,
      "..",
      "templates",
      "certificate.html"
    );

    const templateHtml = fs.readFileSync(templatePath, "utf-8");
    const template = Handlebars.compile(templateHtml);

    const logoPath = path.join(__dirname, "..", "templates", "logo.svg");
    const logoBuffer = fs.readFileSync(logoPath);
    const base64Logo = logoBuffer.toString("base64");

    const issueDate = new Date(certificate.issueDate).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

    const completionDate = new Date(
      certificate.courseCompletionDate
    ).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const verificationUrl = `${serverConfig.FRONTEND_URL}/verify-certificate/${certificateId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: "M",
      type: "image/png",
      width: 150,
      margin: 1,
      color: {
        dark: "#1a237e",
        light: "#ffffff",
      },
    });

    const certificateData = {
      learnerName: (certificate.user as IUser).name,
      courseName: certificate.courseName,
      instructorName: certificate.instructorName,
      certificateId: certificate.certificateId,
      issueDate,
      completionDate,
      finalScore: certificate.finalQuizScore,
      qrCodeDataUrl: qrCodeDataUrl,
      logoDataUrl: `data:image/svg+xml;base64,${base64Logo}`,
    };

    const html = template(certificateData);

    browser = await puppeteer.launch({
      headless: true,
      executablePath:
        serverConfig.NODE_ENV === "production"
          ? "/usr/bin/chromium"
          : "/usr/bin/chromium-browser",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setContent(html);

    await page.evaluate(() => document.fonts.ready);

    const pdfBuffer = await page.pdf({
      format: "A4",
      landscape: true,
      printBackground: true,
      scale: 1,
      height: "100%",
      width: "100%",
    });

    await browser.close();
    browser = null;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="certificate-${certificateId}.pdf"`
    );

    res.end(pdfBuffer);
    return;
  } catch (error) {
    if (browser) {
      await browser.close().catch(console.error);
    }
    next(error);
  }
}

async function verifyCertificate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { certificateId } = req.params;

    const certificate = await CourseCertification.findOne({
      certificateId,
    })
      .populate("course")
      .populate({
        path: "user",
        select: "name -_id",
      });

    if (!certificate) {
      res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
      return;
    }

    const certificateData = {
      learnerName: (certificate.user as IUser).name,
      courseName: certificate.courseName,
      instructorName: certificate.instructorName,
      certificateId: certificate.certificateId,
      issueDate: certificate.issueDate,
      finalQuizScore: certificate.finalQuizScore,
      courseCompletionDate: certificate.courseCompletionDate,
    };
    res.status(200).json({
      success: true,
      data: certificateData,
    });
    return;
  } catch (error) {
    next(error);
  }
}

export default {
  downloadCertificate,
  verifyCertificate,
};
