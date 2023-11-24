import * as OpenApiValidator from "express-openapi-validator";
import path from "path";
import envConfig from "../utils/envConfig";

const apiSpec = path.join(__dirname, "../specification/antenapeople.yaml");

let emailPattern: RegExp;

if (envConfig.NODE_ENV === "development") {
  emailPattern = new RegExp("^[^\\s@]+@[^\\s@]+.[^\\s@]+$");
} else {
  emailPattern = new RegExp(
    "^[^\\s@]+@(antenagroup\\.ro|intactmediagroup\\.ro|antena3\\.ro)$"
  );
}

const validatorMiddleware = OpenApiValidator.middleware({
  apiSpec,
  formats: {
    "employee-email": (email: string) => emailPattern.test(email),
  },
});

export default validatorMiddleware;
