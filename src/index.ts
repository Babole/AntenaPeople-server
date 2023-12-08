import * as dotenv from "dotenv";
dotenv.config();
import { checkRequiredEnvVariables } from "./utils/envConfig";
checkRequiredEnvVariables();

import envConfig from "./utils/envConfig";
import createServer from "./server";
import logger from "./utils/logger";

const port: number = parseInt(envConfig.PORT);

const app = createServer();

app.listen(port, () => {
  logger.info(
    `Express now departing from port ${port}! ---${envConfig.NODE_ENV} environment`
  );
});
