import { buildEnvHealthResponse } from "@tbe/utils/health";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("health utils", () => {
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    delete process.env.REQUIRED_VAR;
    delete process.env.OPTIONAL_VAR;
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("reports healthy status when all required variables are present", () => {
    process.env.REQUIRED_VAR = "value";

    const { httpStatus, report } = buildEnvHealthResponse([
      { name: "REQUIRED_VAR" },
    ]);

    expect(httpStatus).toBe(200);
    expect(report.status).toBe("healthy");
    expect(report.summary.missingRequired).toBe(0);
  });

  it("reports unhealthy status and 503 when a required variable is missing", () => {
    const { httpStatus, report } = buildEnvHealthResponse([
      { name: "REQUIRED_VAR", description: "Needed for X" },
    ]);

    expect(httpStatus).toBe(503);
    expect(report.status).toBe("unhealthy");
    expect(report.services.environment.missingVariables).toEqual([
      "REQUIRED_VAR",
    ]);
    expect(report.services.environment.variables[0].message).toBe(
      "Needed for X",
    );
  });

  it("reports degraded status and 207 when only optional variables are missing", () => {
    process.env.REQUIRED_VAR = "value";

    const { httpStatus, report } = buildEnvHealthResponse([
      { name: "REQUIRED_VAR" },
      { name: "OPTIONAL_VAR", optional: true },
    ]);

    expect(httpStatus).toBe(207);
    expect(report.status).toBe("degraded");
    expect(report.services.environment.missingOptionalVariables).toEqual([
      "OPTIONAL_VAR",
    ]);
  });

  it("treats a whitespace-only env value as missing", () => {
    process.env.REQUIRED_VAR = "   ";

    const { report } = buildEnvHealthResponse([{ name: "REQUIRED_VAR" }]);

    expect(report.services.environment.missingVariables).toEqual([
      "REQUIRED_VAR",
    ]);
  });

  it("uses a custom service name when provided", () => {
    process.env.REQUIRED_VAR = "value";

    const { report } = buildEnvHealthResponse([{ name: "REQUIRED_VAR" }], {
      serviceName: "payments",
    });

    expect(report.services.payments).toBeDefined();
    expect(report.services.environment).toBeUndefined();
  });

  it("provides a default message when no description is given", () => {
    const { report } = buildEnvHealthResponse([{ name: "REQUIRED_VAR" }]);

    expect(report.services.environment.variables[0].message).toBe(
      "REQUIRED_VAR environment variable is not configured",
    );
  });
});
