import log from "./logger";

const envConfig = {
  DATABASE_URL: process.env.DATABASE_URL!,
  PORT: process.env.PORT!,
  NODE_ENV: process.env.NODE_ENV!,
  CRYPT_SECRET: process.env.CRYPT_SECRET!,
  EMAIL_SERVICE: process.env.EMAIL_SERVICE!,
  EMAIL_USER: process.env.EMAIL_USER!,
  EMAIL_PASS: process.env.EMAIL_PASS!,
  CLIENT_URL: process.env.CLIENT_URL!,
  LOGO_URL: process.env.LOGO_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  SERVER_URL: process.env.SERVER_URL!,
  SIGNATURE_DIRECTORY: process.env.SIGNATURE_DIRECTORY!,
};

export function checkRequiredEnvVariables(): void {
  for (const envVar of Object.keys(envConfig) as (keyof typeof envConfig)[]) {
    const value = envConfig[envVar];
    if (!value) {
      log.error(`Required environment variable ${envVar} is not provided.`);
      process.exit(1);
    }
  }
  log.info("Environment variables succesfully checked");
}

export default envConfig;
