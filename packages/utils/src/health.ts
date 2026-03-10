type EnvironmentHealthStatus = "healthy" | "degraded" | "unhealthy";

export interface EnvVarCheck {
  name: string;
  description?: string;
  optional?: boolean;
}

export interface EnvVarResult {
  name: string;
  optional: boolean;
  status: "present" | "missing";
  message?: string;
}

export interface EnvServiceReport {
  status: EnvironmentHealthStatus;
  total: number;
  missing: number;
  missingOptional: number;
  variables: EnvVarResult[];
  missingVariables: string[];
  missingOptionalVariables: string[];
}

export interface EnvHealthResponse {
  status: EnvironmentHealthStatus;
  timestamp: string;
  services: Record<string, EnvServiceReport>;
  summary: {
    totalVariables: number;
    missingRequired: number;
    missingOptional: number;
  };
}

export interface BuildEnvHealthOptions {
  serviceName?: string;
}

export interface EnvHealthResult {
  httpStatus: number;
  report: EnvHealthResponse;
}

const getHealthStatusFromCounts = (
  missingRequired: number,
  missingOptional: number,
): EnvironmentHealthStatus => {
  if (missingRequired > 0) {
    return "unhealthy";
  }

  if (missingOptional > 0) {
    return "degraded";
  }

  return "healthy";
};

const getHttpStatusFromHealth = (status: EnvironmentHealthStatus): number => {
  switch (status) {
    case "healthy":
      return 200;
    case "degraded":
      return 207;
    default:
      return 503;
  }
};

export const buildEnvHealthResponse = (
  checks: EnvVarCheck[],
  options?: BuildEnvHealthOptions,
): EnvHealthResult => {
  const serviceName = options?.serviceName || "environment";

  const results: EnvVarResult[] = checks.map((check) => {
    const rawValue = process.env[check.name];
    const value = typeof rawValue === "string" ? rawValue.trim() : undefined;
    const isPresent = Boolean(value);

    return {
      name: check.name,
      optional: Boolean(check.optional),
      status: isPresent ? "present" : "missing",
      message: isPresent
        ? undefined
        : check.description ||
          `${check.name} environment variable is not configured`,
    };
  });

  const missingRequired = results.filter(
    (result) => !result.optional && result.status === "missing",
  );
  const missingOptional = results.filter(
    (result) => result.optional && result.status === "missing",
  );

  const serviceStatus = getHealthStatusFromCounts(
    missingRequired.length,
    missingOptional.length,
  );

  const serviceReport: EnvServiceReport = {
    status: serviceStatus,
    total: results.length,
    missing: missingRequired.length,
    missingOptional: missingOptional.length,
    variables: results,
    missingVariables: missingRequired.map((item) => item.name),
    missingOptionalVariables: missingOptional.map((item) => item.name),
  };

  const report: EnvHealthResponse = {
    status: serviceStatus,
    timestamp: new Date().toISOString(),
    services: {
      [serviceName]: serviceReport,
    },
    summary: {
      totalVariables: results.length,
      missingRequired: missingRequired.length,
      missingOptional: missingOptional.length,
    },
  };

  return {
    httpStatus: getHttpStatusFromHealth(serviceStatus),
    report,
  };
};
