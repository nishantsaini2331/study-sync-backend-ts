import dotenv from "dotenv";

dotenv.config();

export const serverConfig = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE,

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  NODEMAILER_USER: process.env.NODEMAILER_USER,
  NODEMAILER_HOST: process.env.NODEMAILER_HOST,
  NODEMAILER_PASSWORD: process.env.NODEMAILER_PASS,
  NODEMAILER_PORT: process.env.NODEMAILER_PORT,

  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_SECRET: process.env.RAZORPAY_SECRET,

  ADMIN_USER_ID: process.env.ADMIN_USER_ID,

  FRONTEND_URL: process.env.FRONTEND_URL,

  NODE_ENV: process.env.NODE_ENV,
};
