import express from "express";
import { serverConfig } from "./config/serverConfig";
import apiRoutes from "./routes";
import {
  appErrorHandler,
  genericErrorHandler,
} from "./middlewares/error.middleware";
import { connectDB } from "./config/dbConfig";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cookieParser());
app.use(
  cors({
    origin: serverConfig.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());

app.use("/api", apiRoutes);
app.use(appErrorHandler);
app.use(genericErrorHandler);

app.listen(serverConfig.PORT, () => {
  console.log("Server is started");
  connectDB();
});
