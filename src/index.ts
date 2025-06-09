import express from "express";
import { serverConfig } from "./config/serverConfig";
import apiRoutes from "./routes";
import {
  appErrorHandler,
  genericErrorHandler,
} from "./middlewares/error.middleware";

const app = express();

app.use(express.json());

app.use("/api", apiRoutes);
app.use(appErrorHandler);
app.use(genericErrorHandler);

app.listen(serverConfig.PORT, () => {
  console.log("Server is started");
});
