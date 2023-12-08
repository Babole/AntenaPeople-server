import * as dbModels from "../models/db/employees.model";
import * as apiModels from "../models/AntenaPeople";
import * as leaveRequestsMappings from "../mappings/leaveRequests.map";

/**
 * Utility Function that Maps the Employee's Personal Summary db query result to the Response Object
 * @param personalSummaryQueryResult The DB Query Result Object
 * @returns The Mapped Response Object
 */
export function mapDBModelsPersonalSummaryPrismaEmployeeGetPayloadToApiModelsEmployeePersonalSummary(
  employeesSummaryQueryResult: dbModels.personalSummaryPrismaEmployeeGetPayload
): apiModels.EmployeePersonalSummary {
  return {
    data: {
      id: apiModels.MeTypeEnum.ValueMe,
      type: apiModels.EmployeesTypeEnum.Employees,
      attributes: {
        vacationDaysTotal: employeesSummaryQueryResult.vacationDaysTotal,
        vacationDaysLeft: employeesSummaryQueryResult.vacationDaysLeft,
        name: employeesSummaryQueryResult.name,
        surname: employeesSummaryQueryResult.surname,
      },
      relationships: employeesSummaryQueryResult.supervisor
        ? constructRelationshipsSupervisor(
            employeesSummaryQueryResult.supervisor
          )
        : undefined,
    },
    included: employeesSummaryQueryResult.supervisor
      ? [constructIncludedEmployee(employeesSummaryQueryResult.supervisor)]
      : undefined,
  };
}

/**
 * Utility Function that Maps the Subordinate Summary List db query result to the Response Object
 * @param subordinatesListQueryResult The DB Query Result Object
 * @returns The Mapped Response Object
 */
export function mapDBModelsListSubordinatesPrismaEmployeeGetPayloadToApiModelsSubordinatesSummary(
  subordinatesListQueryResult: dbModels.listSubordinatesPrismaEmployeeGetPayload[]
): apiModels.SubordinatesSummary {
  const temporaryData: apiModels.SubordinateSummary[] = [];
  const temporaryIncluded: apiModels.LeaveRequestIncluded[] = [];

  subordinatesListQueryResult.map((subordinate) => {
    const temporarySubordinateSummary: apiModels.SubordinateSummary = {
      id: subordinate.id,
      type: apiModels.EmployeesTypeEnum.Employees,
      attributes: {
        name: subordinate.name,
        surname: subordinate.surname,
        role: subordinate.role,
        currentEmployee: subordinate.currentEmployee,
      },
    };

    if (subordinate.leaveRequestsInitiated.length) {
      const temporaryRelationships: apiModels.RelationshipRecentLeaveRequests =
        {
          recentLeaveRequests: {
            data: [],
          },
        };

      subordinate.leaveRequestsInitiated.map((leaveRequest) => {
        temporaryRelationships.recentLeaveRequests.data.push(
          leaveRequestsMappings.constructRelationshipsRecentLeaveRequestData(
            leaveRequest
          )
        );
        temporaryIncluded.push(
          leaveRequestsMappings.constructIncludedLeaveRequest(leaveRequest)
        );
      });

      temporarySubordinateSummary["relationships"] = temporaryRelationships;
    }

    temporaryData.push(temporarySubordinateSummary);
  });

  return {
    data: temporaryData,
    included: temporaryIncluded.length ? temporaryIncluded : undefined,
  };
}

// -----
// Relationships and Included Mappings
// --

/**
 * Utility Function that Maps the Employee db query result to a Supervisor Relationship Object
 * @param employeeDBOut The DB Query Result Object
 * @returns The Mapped Supervisor Relationship Object
 */
export function constructRelationshipsSupervisor(employeeDBOut: {
  id: string;
}): apiModels.RelationshipSupervisor {
  return {
    supervisor: {
      data: {
        id: employeeDBOut.id,
        type: apiModels.EmployeesTypeEnum.Employees,
      },
    },
  };
}

/**
 * Utility Function that Maps the Employee db query result to a Substitute Relationship Object
 * @param employeeDBOut The DB Query Result Object
 * @returns The Mapped Substitute Relationship Object
 */
export function constructRelationshipsSubstitute(employeeDBOut: {
  id: string;
}): apiModels.RelationshipSubstitute {
  return {
    substitute: {
      data: {
        id: employeeDBOut.id,
        type: apiModels.EmployeesTypeEnum.Employees,
      },
    },
  };
}

/**
 * Utility Function that Maps the Employee db query result to an Initiator Relationship Object
 * @param employeeDBOut The DB Query Result Object
 * @returns The Mapped Initiator Relationship Object
 */
export function constructRelationshipsInitiator(employeeDBOut: {
  id: string;
}): apiModels.RelationshipInitiator {
  return {
    initiator: {
      data: {
        id: employeeDBOut.id,
        type: apiModels.EmployeesTypeEnum.Employees,
      },
    },
  };
}

/**
 * Utility Function that Maps the Employee db query result to an HR Relationship Object
 * @param employeeDBOut The DB Query Result Object
 * @returns The Mapped HR Relationship Object
 */
export function constructRelationshipsHR(employeeDBOut: {
  id: string;
}): apiModels.RelationshipHR {
  return {
    HR: {
      data: {
        id: employeeDBOut.id,
        type: apiModels.EmployeesTypeEnum.Employees,
      },
    },
  };
}

/**
 * Utility Function that Maps the Employee db query result to a Response Included Employee Object
 * @param employeeDBOut The DB Query Result Object
 * @returns The Mapped Included Employee Object
 */
export function constructIncludedEmployee(employeeDBOut: {
  id: string;
  name: string;
  surname: string;
  role?: string | null;
  email?: string | null;
}): apiModels.EmployeeIncluded {
  return {
    id: employeeDBOut.id,
    type: apiModels.EmployeesTypeEnum.Employees,
    attributes: {
      name: employeeDBOut.name,
      surname: employeeDBOut.surname,
      role: employeeDBOut.role ? employeeDBOut.role : undefined,
      email: employeeDBOut.email ? employeeDBOut.email : undefined,
    },
  };
}
