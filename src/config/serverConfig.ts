interface ServerConfig {
  PORT: number;
  MONGO_URI: string;

  JWT_SECRET: string;
  JWT_EXPIRE: string;

  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;

  NODEMAILER_USER: string;
  NODEMAILER_HOST: string;
  NODEMAILER_PASSWORD: string;
  NODEMAILER_PORT: number;

  RAZORPAY_KEY_ID: string;
  RAZORPAY_SECRET: string;

  ADMIN_USER_ID: string;

  FRONTEND_URL: string;
  NODE_ENV: string;

  FIREBASE_TYPE: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_PRIVATE_KEY_ID: string;
  FIREBASE_PRIVATE_KEY: string;
  FIREBASE_CLIENT_EMAIL: string;
  FIREBASE_CLIENT_ID: string;
  FIREBASE_AUTH_URI: string;
  FIREBASE_TOKEN_URI: string;
  FIREBASE_AUTH_PROVIDER_X509_CERT_URL: string;
  FIREBASE_CLIENT_X509_CERT_URL: string;
  FIREBASE_UNIVERSAL_DOMAIN: string;
}

export const serverConfig: ServerConfig = {
  PORT: parseInt(process.env.PORT || "5000", 10),
  MONGO_URI: process.env.MONGO_URI || "",

  JWT_SECRET: process.env.JWT_SECRET || "",
  JWT_EXPIRE: process.env.JWT_EXPIRE || "1h",

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",

  NODEMAILER_USER: process.env.NODEMAILER_USER || "",
  NODEMAILER_HOST: process.env.NODEMAILER_HOST || "",
  NODEMAILER_PASSWORD: process.env.NODEMAILER_PASS || "",
  NODEMAILER_PORT: parseInt(process.env.NODEMAILER_PORT || "465", 10),

  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "",
  RAZORPAY_SECRET: process.env.RAZORPAY_SECRET || "",

  ADMIN_USER_ID: process.env.ADMIN_USER_ID || "",

  FRONTEND_URL: process.env.FRONTEND_URL || "",
  NODE_ENV: process.env.NODE_ENV || "development",

  FIREBASE_TYPE: process.env.FIREBASE_TYPE || "service_account",
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || "",
  FIREBASE_PRIVATE_KEY_ID: process.env.FIREBASE_PRIVATE_KEY_ID || "",
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY || "",
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || "",
  FIREBASE_CLIENT_ID: process.env.FIREBASE_CLIENT_ID || "",
  FIREBASE_AUTH_URI: process.env.FIREBASE_AUTH_URI || "",
  FIREBASE_TOKEN_URI: process.env.FIREBASE_TOKEN_URI || "",
  FIREBASE_AUTH_PROVIDER_X509_CERT_URL:
    process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || "",
  FIREBASE_CLIENT_X509_CERT_URL:
    process.env.FIREBASE_CLIENT_X509_CERT_URL || "",
  FIREBASE_UNIVERSAL_DOMAIN: process.env.FIREBASE_UNIVERSAL_DOMAIN || "",
};
