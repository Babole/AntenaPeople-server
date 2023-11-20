import * as dotenv from "dotenv";
dotenv.config();

import createServer from "./utils/server";

import logger from "./utils/logger";

if (!process.env.PORT) {
  process.exit(1);
}

const port: number = parseInt(process.env.PORT);

const app = createServer();

app.listen(port, () => {
  logger.info(
    `Express now departing from port ${port}! ---${process.env.NODE_ENV} environment`
  );
});
