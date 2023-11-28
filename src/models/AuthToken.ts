export type Token = {
  employeeId: string;
  type: TokenTypeEnum;
};

export enum TokenTypeEnum {
  ACCESS = "ACCESS",
  EMAIL_VALIDATION = "EMAIL_VALIDATION",
  PASSWORD_RESET = "PASSWORD_RESET",
}
