/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export type ApprovalLeaveRequest = LeaveRequestSummary & {
  relationships: {
    initiator: {
      data: {
        id: string;
        type: EmployeesTypeEnum;
      };
    };
    substitute: {
      data: {
        id: string;
        type: EmployeesTypeEnum;
      };
    };
    supervisor: {
      data: {
        id: string;
        type: EmployeesTypeEnum;
      };
    };
    HR: {
      data: {
        id: string;
        type: EmployeesTypeEnum;
      };
    };
  };
};

/** ApprovalLeaveRequests */
export interface ApprovalLeaveRequests {
  meta: {
    page: PaginationMetadata;
  };
  /**
   * @minItems 0
   * @uniqueItems true
   */
  data: ApprovalLeaveRequest[];
  /**
   * @minItems 0
   * @uniqueItems true
   */
  included: EmployeeIncluded[];
}

/** CreatedEmployee */
export interface CreatedEmployee {
  data: {
    id: string;
    type: EmployeesTypeEnum;
  };
}

/** CreatedLeaveRequest */
export interface CreatedLeaveRequest {
  data: {
    /** @format uuid */
    id: string;
    type: LeaveRequestsTypeEnum;
  };
}

/** CreateLeaveRequest */
export interface CreateLeaveRequest {
  data: {
    type: LeaveRequestsTypeEnum;
    attributes: {
      /** @format date */
      startDate: string;
      /** @format date */
      endDate: string;
      /** @format int32 */
      workDays: number;
      leaveType: LeaveRequestLeaveTypeEnum;
      /**
       * @minLength 2
       * @maxLength 30
       */
      leaveTypeDetails?: string;
    };
    relationships: {
      substitute: {
        data: {
          /** @format email */
          email: string;
          type: EmployeesTypeEnum;
        };
      };
    };
  };
}

/** CreateEmployeeLoginInfo */
export interface CreateEmployeeLoginInfo {
  data: {
    type: EmployeesTypeEnum;
    attributes: {
      /**
       * @minLength 13
       * @maxLength 13
       * @pattern ^\d{13}$
       */
      cnp: string;
      /**
       * @format email
       * @pattern ^[^@]+@(antenagroup\.ro|intactmediagroup\.ro|antena3\.ro)$
       */
      email: string;
      /**
       * @format password
       * @minLength 8
       */
      password: string;
      /** @format password */
      confirmPassword: string;
    };
  };
}

/** EmployeeIncluded */
export interface EmployeeIncluded {
  /** @format uuid */
  id: string;
  type: EmployeesTypeEnum;
  attributes: {
    name: string;
    surname: string;
    role?: string;
    /** @format email */
    email?: string;
  };
}

/** EmployeePersonalSummary */
export interface EmployeePersonalSummary {
  data: {
    id: MeTypeEnum;
    type: EmployeesTypeEnum;
    attributes: {
      /** @format int32 */
      vacationDaysTotal: number;
      /** @format int32 */
      vacationDaysLeft: number;
      /** @format email */
      email: string;
    };
    relationships: {
      supervisor: {
        data: {
          id: string;
          type: EmployeesTypeEnum;
        };
      };
    };
  };
  /**
   * @minItems 0
   * @uniqueItems true
   */
  included: EmployeeIncluded[];
}

/** EmployeesTypeEnum */
export enum EmployeesTypeEnum {
  Employees = "employees",
}

/** EmploymentStatusEnum */
export enum EmploymentStatusEnum {
  CURRENT = "CURRENT",
  FORMER = "FORMER",
  ALL = "ALL",
}

/** Error */
export interface Error {
  code: string;
  title: string;
  detail?: string;
  source?:
    | {
        pointer: string;
      }
    | {
        parameter: string;
      };
}

/** Errors */
export interface Errors {
  /** @minItems 1 */
  errors: Error[];
  meta: {
    status: string;
    /** @format date-time */
    timestamp: string;
    correlationId: string;
  };
}

/** ForgotPasswordEmployee */
export interface ForgotPasswordEmployee {
  data: {
    type: EmployeesTypeEnum;
    attributes: {
      /** @format email */
      email: string;
    };
  };
}

/** LeaveRequestIncluded */
export interface LeaveRequestIncluded {
  /** @format uuid */
  id: string;
  type: LeaveRequestsTypeEnum;
  attributes: {
    /** @format date */
    startDate: string;
    /** @format date */
    endDate: string;
    leaveType: LeaveRequestLeaveTypeEnum;
    status: LeaveRequestStatusEnum;
  };
}

/** LeaveRequestsTypeEnum */
export enum LeaveRequestsTypeEnum {
  LeaveRequests = "leave-requests",
}

/** LeaveRequestSignatureFileTypeEnum */
export enum LeaveRequestSignatureFileTypeEnum {
  SignatureFile = "signature-file",
}

/** LeaveRequestSummary */
export interface LeaveRequestSummary {
  /** @format uuid */
  id: string;
  type: LeaveRequestsTypeEnum;
  attributes: {
    /** @format date */
    startDate: string;
    /** @format date */
    endDate: string;
    /** @format int32 */
    workDays: number;
    leaveType: LeaveRequestLeaveTypeEnum;
    /**
     * @minLength 2
     * @maxLength 30
     */
    leaveTypeDetails?: string;
    status: LeaveRequestStatusEnum;
    /** @maxLength 50 */
    rejectReason?: string | null;
    /** @format date-time */
    createdAt: string;
    /** @format date-time */
    modifiedAt: string;
  };
}

/** LeaveRequestsSummary */
export interface LeaveRequestsSummary {
  /**
   * @minItems 0
   * @uniqueItems true
   */
  data: LeaveRequestSummary[];
}

/** LoggedinEmployee */
export interface LoggedinEmployee {
  data: {
    type: TokensTypeEnum;
    attributes: {
      accessToken: string;
      /** @format int32 */
      expiresIn: number;
    };
  };
  meta: {
    /** @format date-time */
    timestamp: string;
  };
}

/** LoginEmployee */
export interface LoginEmployee {
  data: {
    type: EmployeesTypeEnum;
    attributes: {
      /** @format email */
      email: string;
      /** @format password */
      password: string;
    };
  };
}

/** MeTypeEnum */
export enum MeTypeEnum {
  ValueMe = "@me",
}

/** PaginationMetadata */
export interface PaginationMetadata {
  /** @format int32 */
  number: number;
  /** @format int32 */
  size: number;
  /** @format int32 */
  totalPages: number;
  /** @format int32 */
  totalElements: number;
}

/** PersonalLeaveRequestsSummary */
export type PersonalLeaveRequestsSummary = LeaveRequestsSummary & {
  meta: {
    page: PaginationMetadata;
  };
};

/** ResetPasswordEmployee */
export interface ResetPasswordEmployee {
  data: {
    type: EmployeesTypeEnum;
    attributes: {
      /**
       * @format password
       * @minLength 8
       */
      password: string;
      /** @format password */
      confirmPassword: string;
    };
  };
}

/** LeaveRequestStatusEnum */
export enum LeaveRequestStatusEnum {
  AWAITING_SUBSTITUTE = "AWAITING_SUBSTITUTE",
  AWAITING_SUPERVISOR = "AWAITING_SUPERVISOR",
  AWAITING_HR = "AWAITING_HR",
  APPROVED = "APPROVED",
  DENIED = "DENIED",
}

/** LeaveRequestStatusFilterEnum */
export enum LeaveRequestStatusFilterEnum {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  DENIED = "DENIED",
}

/** LeaveRequestLeaveTypeEnum */
export enum LeaveRequestLeaveTypeEnum {
  VACATION = "VACATION",
  EVENT_FAM = "EVENT_FAM",
  CHILD = "CHILD",
  NO_PAY = "NO_PAY",
  OTHER = "OTHER",
}

/** SubordinateSummary */
export interface SubordinateSummary {
  id: string;
  type: EmployeesTypeEnum;
  attributes: {
    name: string;
    surname: string;
    role: string;
    currentEmployee?: boolean;
  };
  relationships: {
    recentLeaveRequests: {
      /**
       * @minItems 0
       * @uniqueItems true
       */
      data: {
        /** @format uuid */
        id: string;
        type: LeaveRequestsTypeEnum;
      }[];
    };
  };
}

/** SubordinatesSummary */
export interface SubordinatesSummary {
  /**
   * @minItems 0
   * @uniqueItems true
   */
  data: SubordinateSummary[];
  /**
   * @minItems 0
   * @uniqueItems true
   */
  included: LeaveRequestIncluded[];
}

/** TokensTypeEnum */
export enum TokensTypeEnum {
  Tokens = "tokens",
}

/** UpdateLeaveRequest */
export interface UpdateLeaveRequest {
  data: {
    type: LeaveRequestsTypeEnum;
    attributes: {
      /** @format date */
      startDate?: string;
      /** @format date */
      endDate?: string;
      /** @format int32 */
      workDays?: number;
      leaveType?: LeaveRequestLeaveTypeEnum;
      /**
       * @minLength 2
       * @maxLength 30
       */
      leaveTypeDetails?: string;
      status?: LeaveRequestStatusEnum;
      /** @maxLength 50 */
      rejectReason?: string | null;
    };
  };
}

/** UpdatedLeaveRequestIncluded */
export interface UpdatedLeaveRequestIncluded {
  /** @format uuid */
  id: string;
  type: LeaveRequestsTypeEnum;
  attributes: {
    status: LeaveRequestStatusEnum;
  };
}

/** UploadedLeaveRequestSignatureFile */
export interface UploadedLeaveRequestSignatureFile {
  data: {
    /** @format uuid */
    id: string;
    type: LeaveRequestSignatureFileTypeEnum;
    relationships: {
      leaveRequest: {
        data: {
          /** @format uuid */
          id: string;
          type: LeaveRequestsTypeEnum;
        };
      };
    };
  };
  /**
   * @minItems 0
   * @uniqueItems true
   */
  included: UpdatedLeaveRequestIncluded[];
}

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, HeadersDefaults, ResponseType } from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({ securityWorker, secure, format, ...axiosConfig }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({ ...axiosConfig, baseURL: axiosConfig.baseURL || "" });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(params1: AxiosRequestConfig, params2?: AxiosRequestConfig): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method && this.instance.defaults.headers[method.toLowerCase() as keyof HeadersDefaults]) || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] = property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(key, isFileType ? formItem : this.stringifyFormItem(formItem));
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (type === ContentType.FormData && body && body !== null && typeof body === "object") {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (type === ContentType.Text && body && body !== null && typeof body !== "string") {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title AntenaPeople API
 * @version 1.0.0
 *
 * This general interface of the AntenaPeople API offers a suite of functionalities designed for employee self-service and streamlined HR operations. It enables employees to manage their personal profiles and holiday bookings
 *
 * Key features include:
 * - Creation and update of employee profiles on the platform.
 * - Creation and update of employee personal holiday bookings.
 * - Overview and administration of all employee holiday bookings.
 *
 * Authentication is required to interact with the API and is facilitated through secure JWT tokens.  The API exclusively exchanges data in JSON format for both requests and responses.
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  employees = {
    /**
     * @description This can only be done by a registered user confirming email address.
     *
     * @tags Authentication
     * @name EmployeeVerifyEmail
     * @summary Sets the employee's email status
     * @request POST:/employees/email-status/{token}
     */
    employeeVerifyEmail: (token: string, params: RequestParams = {}) =>
      this.request<CreatedEmployee, Errors>({
        path: `/employees/email-status/${token}`,
        method: "POST",
        ...params,
      }),

    /**
     * @description This can be done by anyone if the employee already exists and email has been verified.
     *
     * @tags Authentication
     * @name EmployeeForgotPassword
     * @summary Sends password recovery email
     * @request POST:/employees/forgot-password
     */
    employeeForgotPassword: (data: ForgotPasswordEmployee, params: RequestParams = {}) =>
      this.request<any, Errors>({
        path: `/employees/forgot-password`,
        method: "POST",
        body: data,
        ...params,
      }),

    /**
     * @description This can be done by anyone if the employee's login details are valid and email has been verified.
     *
     * @tags Authentication
     * @name LoginEmployee
     * @summary Authenticate an employee and return an access token
     * @request POST:/employees/login
     */
    loginEmployee: (data: LoginEmployee, params: RequestParams = {}) =>
      this.request<LoggedinEmployee, Errors>({
        path: `/employees/login`,
        method: "POST",
        body: data,
        ...params,
      }),

    /**
     * @description This can be done by anyone if the employee already exists and email has not been verified.
     *
     * @tags Authentication
     * @name CreateEmployeeLoginInfo
     * @summary Creates employee's login details
     * @request POST:/employees/register
     */
    createEmployeeLoginInfo: (data: CreateEmployeeLoginInfo, params: RequestParams = {}) =>
      this.request<CreatedEmployee, Errors>({
        path: `/employees/register`,
        method: "POST",
        body: data,
        ...params,
      }),

    /**
     * @description This can be done by a user with the reset token.
     *
     * @tags Authentication
     * @name EmployeeResetPassword
     * @summary Reset the password for an employee
     * @request POST:/employees/reset-password
     * @secure
     */
    employeeResetPassword: (data: ResetPasswordEmployee, params: RequestParams = {}) =>
      this.request<any, Errors>({
        path: `/employees/reset-password`,
        method: "POST",
        body: data,
        secure: true,
        ...params,
      }),

    /**
     * @description This can only be done by the logged in user.
     *
     * @tags Employees
     * @name GetPersonalEmployeeInfo
     * @summary Gets personal employee information
     * @request GET:/employees/@me
     * @secure
     */
    getPersonalEmployeeInfo: (params: RequestParams = {}) =>
      this.request<EmployeePersonalSummary, Errors>({
        path: `/employees/@me`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description This can only be done by the logged in user.
     *
     * @tags Employees
     * @name ListSubordinates
     * @summary Lists subordinates
     * @request GET:/employees/@me/subordinates
     * @secure
     */
    listSubordinates: (
      query?: {
        /**
         * Employment status filter.
         * @default "CURRENT"
         */
        employmentStatus?: EmploymentStatusEnum;
      },
      params: RequestParams = {},
    ) =>
      this.request<SubordinatesSummary, Errors>({
        path: `/employees/@me/subordinates`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description This can only be done by the logged in user.
     *
     * @tags Leave Requests
     * @name ListApprovalLeaveRequests
     * @summary Lists leave requests under employee's approval
     * @request GET:/employees/@me/leave-approvals
     * @secure
     */
    listApprovalLeaveRequests: (
      query: {
        /** Leave Request Approval Status */
        statusFilter: LeaveRequestStatusFilterEnum;
        /**
         * Page Number (zero-based) for Pagination
         * @format int32
         * @min 0
         */
        "page[number]"?: number;
        /**
         * Page Size for Pagination
         * @format int32
         * @min 1
         * @max 100
         */
        "page[size]"?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<ApprovalLeaveRequests, Errors>({
        path: `/employees/@me/leave-approvals`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description This can only be done by the logged in user.
     *
     * @tags Leave Requests
     * @name ListPersonalLeaveRequests
     * @summary Lists personal leave requests
     * @request GET:/employees/@me/leave-requests
     * @secure
     */
    listPersonalLeaveRequests: (
      query: {
        /** Leave Request Approval Status */
        statusFilter: LeaveRequestStatusFilterEnum;
        /**
         * Page Number (zero-based) for Pagination
         * @format int32
         * @min 0
         */
        "page[number]"?: number;
        /**
         * Page Size for Pagination
         * @format int32
         * @min 1
         * @max 100
         */
        "page[size]"?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<PersonalLeaveRequestsSummary, Errors>({
        path: `/employees/@me/leave-requests`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description This can only be done by the logged in user.
     *
     * @tags Leave Requests
     * @name CreatePersonalLeaveRequest
     * @summary Creates a leave request
     * @request POST:/employees/@me/leave-requests
     * @secure
     */
    createPersonalLeaveRequest: (data: CreateLeaveRequest, params: RequestParams = {}) =>
      this.request<CreatedLeaveRequest, Errors>({
        path: `/employees/@me/leave-requests`,
        method: "POST",
        body: data,
        secure: true,
        ...params,
      }),
  };
  leaveRequests = {
    /**
     * @description This can be done by logged in user or relevant management
     *
     * @tags Leave Requests
     * @name UpdateLeaveRequestInfo
     * @summary Updates leave request information
     * @request PATCH:/leave-requests/{leaveRequestId}
     * @secure
     */
    updateLeaveRequestInfo: (leaveRequestId: string, data: UpdateLeaveRequest, params: RequestParams = {}) =>
      this.request<any, Errors>({
        path: `/leave-requests/${leaveRequestId}`,
        method: "PATCH",
        body: data,
        secure: true,
        ...params,
      }),

    /**
     * @description This can be done by logged in user or relevant management
     *
     * @tags Leave Requests
     * @name UploadLeaveRequestSignatureFile
     * @summary Uploads Signature File and Attaches it to Leave Request
     * @request POST:/leave-requests/{leaveRequestId}/signature-file
     * @secure
     */
    uploadLeaveRequestSignatureFile: (leaveRequestId: string, data: File, params: RequestParams = {}) =>
      this.request<UploadedLeaveRequestSignatureFile, any>({
        path: `/leave-requests/${leaveRequestId}/signature-file`,
        method: "POST",
        body: data,
        secure: true,
        ...params,
      }),
  };
}
