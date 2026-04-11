// apps/api/src/lib/validation.ts

export interface ValidationResult<T> {
  ok: boolean;
  value?: T;
  message?: string;
}

export function parseDsaSheetCreateBody(body: any): ValidationResult<any> {
  try {
    if (!body) {
      return { ok: false, message: "Request body is required" };
    }
    // Add your validation logic here
    return { ok: true, value: body };
  } catch (error) {
    return { ok: false, message: "Invalid request body" };
  }
}

export function parseDsaSheetGetQuery(query: any): ValidationResult<any> {
  try {
    if (!query) {
      return { ok: false, message: "Query parameters are required" };
    }
    // Add your validation logic here
    return { ok: true, value: query };
  } catch (error) {
    return { ok: false, message: "Invalid query parameters" };
  }
}
