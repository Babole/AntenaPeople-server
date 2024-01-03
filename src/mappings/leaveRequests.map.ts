import { DateTime } from "luxon";
import { LeaveType, LeaveRequestStatus } from "@prisma/client";
import * as apiModels from "../models/AntenaPeople";
import * as dbModels from "../models/db/leaveRequests.model";
import * as employeesdbModels from "../models/db/employees.model";
import * as signatureFilesdbModels from "../models/db/signatureFiles.model";
import * as employeesMappings from "../mappings/employees.map";

/**
 * Utility Function that Maps the list Approval db query result to the Response Object
 * @param approvalLeaveRequestsPaginatedQueryResult Approval Leave Requests DB Query Result Object Paginated
 * @param includedEmployees Decrypted Summary of all Initiators and Substitutes
 * @param approvalLeaveRequestsCount Cont of all Approval Leave Requests
 * @param pageNumber Page Number (zero-based) for Pagination
 * @param pageSize Page Size for Pagination
 * @returns The Mapped Response Object
 */
export function mapListApprovalDBResultToApiModelsApprovalLeaveRequests(
  approvalLeaveRequestsPaginatedQueryResult: dbModels.listApprovalPrismaLeaveRequestGetPayload[],
  includedEmployees: dbModels.includedEmployee[],
  approvalLeaveRequestsCount: number,
  pageNumber?: number,
  pageSize?: number
): apiModels.ApprovalLeaveRequests {
  let paginationMetaData: { page: apiModels.PaginationMetadata } | undefined;
  const approvalLeaveRequestsData: apiModels.ApprovalLeaveRequest[] = [];
  const employeesIncluded: apiModels.EmployeeIncluded[] = [];

  // pageNumber can be zero but pageSize cannot(would result in inf total pages)
  if (pageNumber !== undefined && pageSize) {
    paginationMetaData = {
      page: {
        number: pageNumber,
        size: pageSize,
        totalPages: Math.ceil(approvalLeaveRequestsCount / pageSize),
        totalElements: approvalLeaveRequestsCount,
      },
    };
  }

  approvalLeaveRequestsPaginatedQueryResult.map((leaveRequest) => {
    const approvalLeaveRequest: apiModels.ApprovalLeaveRequest = {
      id: leaveRequest.id,
      type: apiModels.LeaveRequestsTypeEnum.LeaveRequests,
      attributes: {
        startDate: DateTime.fromJSDate(leaveRequest.startDate).toFormat(
          "dd.MM.yyyy"
        ),
        endDate: DateTime.fromJSDate(leaveRequest.endDate).toFormat(
          "dd.MM.yyyy"
        ),
        workDays: leaveRequest.workDays,
        leaveType: getLeaveTypeAPIEnumFromDBEnum(leaveRequest.leaveType),
        leaveTypeDetails: leaveRequest.leaveTypeDetails ?? undefined,
        status: getLeaveStatusAPIEnumFromDBEnum(leaveRequest.status),
        rejectReason: leaveRequest.rejectReason,
        createdAt: DateTime.fromJSDate(leaveRequest.createdAt).toFormat(
          "dd.MM.yyyy"
        ),
        modifiedAt: DateTime.fromJSDate(leaveRequest.modifiedAt).toFormat(
          "dd.MM.yyyy"
        ),
      },
      relationships: {
        supervisor: employeesMappings.constructRelationshipsSupervisor(
          leaveRequest.initiator.supervisor!
        ).supervisor,
        HR: employeesMappings.constructRelationshipsHR(
          leaveRequest.initiator.HR!
        ).HR,
        initiator: employeesMappings.constructRelationshipsInitiator(
          leaveRequest.initiator
        ).initiator,
        substitute: employeesMappings.constructRelationshipsSubstitute(
          leaveRequest.substitute
        ).substitute,
      },
    };
    approvalLeaveRequestsData.push(approvalLeaveRequest);
  });

  includedEmployees.map((employee) => {
    const includedEmployee =
      employeesMappings.constructIncludedEmployee(employee);

    employeesIncluded.push(includedEmployee);
  });

  return {
    meta: paginationMetaData,
    data: approvalLeaveRequestsData,
    included: employeesIncluded.length ? employeesIncluded : undefined,
  };
}

/**
 * Utility Function that Maps the list Personal db query result to the Response Object
 * @param personalLeaveRequestsPaginatedQueryResult Personal Leave Requests DB Query Result Object Paginated
 * @param includedEmployees Decrypted Summary of all Substitutes
 * @param personalLeaveRequestsCount Cont of all Personal Leave Requests
 * @param pageNumber Page Number (zero-based) for Pagination
 * @param pageSize Page Size for Pagination
 * @returns The Mapped Response Object
 */
export function mapListPersonalDBResultToApiModelsPersonalLeaveRequests(
  personalLeaveRequestsPaginatedQueryResult: dbModels.listPersonalPrismaLeaveRequestGetPayload[],
  includedEmployees: dbModels.includedEmployee[],
  personalLeaveRequestsCount: number,
  pageNumber?: number,
  pageSize?: number
): apiModels.PersonalLeaveRequests {
  let paginationMetaData: { page: apiModels.PaginationMetadata } | undefined;
  const approvalLeaveRequestsData: apiModels.PersonalLeaveRequest[] = [];
  const employeesIncluded: apiModels.EmployeeIncluded[] = [];

  // pageNumber can be zero but pageSize cannot(would result in inf total pages)
  if (pageNumber !== undefined && pageSize) {
    paginationMetaData = {
      page: {
        number: pageNumber,
        size: pageSize,
        totalPages: Math.ceil(personalLeaveRequestsCount / pageSize),
        totalElements: personalLeaveRequestsCount,
      },
    };
  }

  personalLeaveRequestsPaginatedQueryResult.map((leaveRequest) => {
    const approvalLeaveRequest: apiModels.PersonalLeaveRequest = {
      id: leaveRequest.id,
      type: apiModels.LeaveRequestsTypeEnum.LeaveRequests,
      attributes: {
        startDate: DateTime.fromJSDate(leaveRequest.startDate).toFormat(
          "dd.MM.yyyy"
        ),
        endDate: DateTime.fromJSDate(leaveRequest.endDate).toFormat(
          "dd.MM.yyyy"
        ),
        workDays: leaveRequest.workDays,
        leaveType: getLeaveTypeAPIEnumFromDBEnum(leaveRequest.leaveType),
        leaveTypeDetails: leaveRequest.leaveTypeDetails ?? undefined,
        status: getLeaveStatusAPIEnumFromDBEnum(leaveRequest.status),
        createdAt: DateTime.fromJSDate(leaveRequest.createdAt).toFormat(
          "dd.MM.yyyy"
        ),
        modifiedAt: DateTime.fromJSDate(leaveRequest.modifiedAt).toFormat(
          "dd.MM.yyyy"
        ),
      },
      relationships: {
        substitute: employeesMappings.constructRelationshipsSubstitute(
          leaveRequest.substitute
        ).substitute,
      },
    };
    approvalLeaveRequestsData.push(approvalLeaveRequest);
  });

  includedEmployees.map((employee) => {
    const includedEmployee =
      employeesMappings.constructIncludedEmployee(employee);

    employeesIncluded.push(includedEmployee);
  });

  return {
    meta: paginationMetaData,
    data: approvalLeaveRequestsData,
    included: employeesIncluded.length ? employeesIncluded : undefined,
  };
}

/**
 * Utility Function that Maps the new Leave-Request request object to the db query input
 * @param employeeId Employee initiating Leave-Request
 * @param leaveRequestReqBody The new Leave-Request Request Body
 * @returns The Mapped DTO
 */
export function mapApiModelsCreateLeaveRequestToDBModelsPrismaLeaveRequestCreateInput(
  employeeId: string,
  leaveRequestReqBody: apiModels.CreateLeaveRequest
): dbModels.PrismaLeaveRequestCreateInput {
  const attributesLeaveRequest = leaveRequestReqBody.data.attributes;
  const attributesSubstitute = leaveRequestReqBody.included[0].attributes;

  return {
    startDate: new Date(attributesLeaveRequest.startDate),
    endDate: new Date(attributesLeaveRequest.endDate),
    workDays: attributesLeaveRequest.workDays,
    leaveType: attributesLeaveRequest.leaveType,
    leaveTypeDetails: attributesLeaveRequest.leaveTypeDetails,
    initiator: {
      connect: {
        id: employeeId,
      },
    },
    substitute: {
      connect: {
        email: attributesSubstitute.email.toLowerCase(),
      },
    },
  };
}

/**
 * Utility Function that Maps the Created Leave Request db query result to the Response Object
 * @param createdLeaveRequestDBOut The DB Query Result Object
 * @returns The Mapped Leave Request Api Response Object
 */
export function mapCreatedLeaveRequestDBOutToApiModelsCreatedLeaveRequest(
  createdLeaveRequestDBOut: [
    dbModels.IDPrismaLeaveRequestGetPayload,
    employeesdbModels.updateDaysLeftPrismaEmployeeGetPayload | undefined
  ]
): apiModels.CreatedLeaveRequest {
  const [newLeaveRequest, updatedEmployee] = createdLeaveRequestDBOut;
  return {
    data: {
      id: newLeaveRequest.id,
      type: apiModels.LeaveRequestsTypeEnum.LeaveRequests,
      relationships: updatedEmployee
        ? employeesMappings.constructRelationshipsInitiator(updatedEmployee)
        : undefined,
    },
    included: updatedEmployee
      ? [
          {
            id: updatedEmployee.id,
            type: apiModels.EmployeesTypeEnum.Employees,
            attributes: {
              vacationDaysLeft: updatedEmployee.vacationDaysLeft,
            },
          },
        ]
      : undefined,
  };
}

/**
 * Utility Function that Maps the update Leave-Request request object to the db query input
 * @param leaveRequestReqBody The new Leave-Request Request Body
 * @returns The Mapped DTO
 */
export function mapApiModelsUpdateLeaveRequestToDBModelsPrismaLeaveRequestUpdateInput(
  leaveRequestReqBody: apiModels.UpdateLeaveRequest
): dbModels.PrismaLeaveRequestUpdateInput {
  const { attributes } = leaveRequestReqBody.data;
  return {
    startDate: attributes.startDate
      ? new Date(attributes.startDate)
      : undefined,
    endDate: attributes.endDate ? new Date(attributes.endDate) : undefined,
    workDays: attributes.workDays,
    leaveType: attributes.leaveType,
    leaveTypeDetails: attributes.leaveTypeDetails,
    status: attributes.status,
    rejectReason: attributes.rejectReason,
  };
}

/**
 * Utility Function that Maps the Uploaded Signature File db query result to the Response Object
 * @param uploadedSignatureFileDBOut The DB Query Result Object
 * @returns The Mapped Signature File Api Response Object
 */
export function mapUploadedSignatureFileDBOutToApiModelsUploadedLeaveRequestSignatureFile(
  uploadedSignatureFileDBOut: [
    signatureFilesdbModels.IDPrismaLeaveRequestSignatureFilesGetPayload,
    dbModels.uploadSignatureFilePrismaLeaveRequestGetPayload
  ]
): apiModels.UploadedLeaveRequestSignatureFile {
  const [newSignatureFile, updatedLeaveRequest] = uploadedSignatureFileDBOut;
  return {
    data: {
      id: newSignatureFile.id,
      type: apiModels.LeaveRequestSignatureFileTypeEnum.SignatureFile,
      relationships: {
        leaveRequest: {
          data: {
            id: updatedLeaveRequest.id,
            type: apiModels.LeaveRequestsTypeEnum.LeaveRequests,
          },
        },
      },
    },
    included: [
      {
        id: updatedLeaveRequest.id,
        type: apiModels.LeaveRequestsTypeEnum.LeaveRequests,
        attributes: {
          status: getLeaveStatusAPIEnumFromDBEnum(updatedLeaveRequest.status),
        },
      },
    ],
  };
}

// -----
// Relationships and Included Mappings
// --

/**
 * Utility Function that Maps the Leave Request db query result to a Response Relationships Recent Leave Request Data Object
 * @param leaveRequestDBOut The DB Query Result Object
 * @returns The Mapped Relationships recentLeaveRequest Data Object
 */
export function constructRelationshipsRecentLeaveRequestData(leaveRequestDBOut: {
  id: string;
}): apiModels.RelationshipRecentLeaveRequests["recentLeaveRequests"]["data"][number] {
  return {
    id: leaveRequestDBOut.id,
    type: apiModels.LeaveRequestsTypeEnum.LeaveRequests,
  };
}

/**
 * Utility Function that Maps the Leave Request db query result to a Response Included Leave Request Object
 * @param leaveRequestDBOut The DB Query Result Object
 * @returns The Mapped Included Leave Request Object
 */
export function constructIncludedLeaveRequest(leaveRequestDBOut: {
  id: string;
  startDate: Date;
  endDate: Date;
  leaveType: LeaveType;
  status: LeaveRequestStatus;
}): apiModels.LeaveRequestIncluded {
  return {
    id: leaveRequestDBOut.id,
    type: apiModels.LeaveRequestsTypeEnum.LeaveRequests,
    attributes: {
      startDate: DateTime.fromJSDate(leaveRequestDBOut.startDate).toFormat(
        "dd.MM.yyyy"
      ),
      endDate: DateTime.fromJSDate(leaveRequestDBOut.endDate).toFormat(
        "dd.MM.yyyy"
      ),
      leaveType: getLeaveTypeAPIEnumFromDBEnum(leaveRequestDBOut.leaveType),
      status: getLeaveStatusAPIEnumFromDBEnum(leaveRequestDBOut.status),
    },
  };
}

// -----
// Helper Maps and Functions
// --

function getLeaveTypeAPIEnumFromDBEnum(
  leaveType: LeaveType
): apiModels.LeaveRequestLeaveTypeEnum {
  const mappedType = LeaveTypeMap.get(leaveType);
  if (!mappedType) {
    throw new Error(`Unsupported leave type: ${leaveType}`);
  }
  return mappedType;
}

function getLeaveStatusAPIEnumFromDBEnum(
  leaveStatus: LeaveRequestStatus
): apiModels.LeaveRequestStatusEnum {
  const mappedStatus = StatusMap.get(leaveStatus);
  if (!mappedStatus) {
    throw new Error(`Unsupported leave status: ${leaveStatus}`);
  }
  return mappedStatus;
}

const LeaveTypeMap = new Map<LeaveType, apiModels.LeaveRequestLeaveTypeEnum>([
  [LeaveType.VACATION, apiModels.LeaveRequestLeaveTypeEnum.VACATION],
  [LeaveType.EVENT_FAM, apiModels.LeaveRequestLeaveTypeEnum.EVENT_FAM],
  [LeaveType.NO_PAY, apiModels.LeaveRequestLeaveTypeEnum.NO_PAY],
  [LeaveType.CHILD, apiModels.LeaveRequestLeaveTypeEnum.CHILD],
  [LeaveType.OTHER, apiModels.LeaveRequestLeaveTypeEnum.OTHER],
]);

const StatusMap = new Map<LeaveRequestStatus, apiModels.LeaveRequestStatusEnum>(
  [
    [
      LeaveRequestStatus.AWAITING_INITIATOR,
      apiModels.LeaveRequestStatusEnum.AWAITING_INITIATOR,
    ],
    [
      LeaveRequestStatus.AWAITING_SUBSTITUTE,
      apiModels.LeaveRequestStatusEnum.AWAITING_SUBSTITUTE,
    ],
    [
      LeaveRequestStatus.AWAITING_SUPERVISOR,
      apiModels.LeaveRequestStatusEnum.AWAITING_SUPERVISOR,
    ],
    [
      LeaveRequestStatus.AWAITING_HR,
      apiModels.LeaveRequestStatusEnum.AWAITING_HR,
    ],
    [LeaveRequestStatus.APPROVED, apiModels.LeaveRequestStatusEnum.APPROVED],
    [LeaveRequestStatus.DENIED, apiModels.LeaveRequestStatusEnum.DENIED],
  ]
);
