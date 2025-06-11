import mongoose from "mongoose";
import { serverConfig } from "./serverConfig";

export const connectDB = async () => {
  try {
    await mongoose.connect(serverConfig.MONGO_URI);
    console.log("Db connected successfully");
  } catch (error) {
    console.log("DB connection failed");
  }
};
