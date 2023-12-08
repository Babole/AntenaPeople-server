import express, { Express } from "express";
import cors from "cors";

import validatorMiddleware from "./middleware/validator";
import { errorHandler } from "./middleware/errorHandler";
import authenticationRouter from "./routes/authentication.router";
import employeesRouter from "./routes/employees.router";
import leaveRequestsRouter from "./routes/leaveRequests.router";

function createServer() {
  const app: Express = express();

  app.set("query parser", "simple");

  app.use(cors());
  app.use(
    express.json({
      type: "application/vnd.api+json",
      strict: false,
    })
  );

  app.get("/", (req, res) => res.send("Welcome to AntenaPeople Admin API"));

  app.use(validatorMiddleware);

  app.use("/", authenticationRouter);

  app.use("/", employeesRouter);

  app.use("/", leaveRequestsRouter);

  app.use(errorHandler);

  return app;
}

export default createServer;
