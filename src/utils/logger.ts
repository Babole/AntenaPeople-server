import pino from "pino";
import { DateTime } from "luxon";

const loggerOptions: pino.LoggerOptions = {
  timestamp: () =>
    `,"time":"${DateTime.utc().toFormat("dd.MM.yyyy HH:mm:ss Z")}"`,
};

if (process.env.NODE_ENV === "development") {
  loggerOptions.transport = { target: "pino-pretty" };
  loggerOptions.base = { pid: false };
}

const log = pino(loggerOptions);

export default log;
