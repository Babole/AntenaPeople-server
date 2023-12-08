export type Token = {
  employeeId: string;
  type: TokenTypeEnum;
};

export enum TokenTypeEnum {
  ACCESS_USER = "ACCESS_USER",
  EMAIL_VALIDATION = "EMAIL_VALIDATION",
  PASSWORD_RESET = "PASSWORD_RESET",
}
