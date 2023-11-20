import express, { Express } from "express";
import cors from "cors";

import {
  validatorMiddleware,
  errorHandler,
} from "../validator/openApiValidator";

function createServer() {
  const app: Express = express();

  app.use(cors());
  app.use(
    express.json({
      type: "application/vnd.api+json",
      strict: false,
    })
  );

  app.get("/", (req, res) => res.send("Welcome to AntenaPeople Admin API"));

  app.use(validatorMiddleware);

  app.use(errorHandler);

  return app;
}

export default createServer;
