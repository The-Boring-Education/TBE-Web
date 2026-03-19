import type { ProductType } from "./database";

export type EnrollmentHandlerName =
  | "enrollInSheet"
  | "enrollInCourse"
  | "createSubscription";

export type AccessType = "ONE_TIME" | "SUBSCRIPTION";

export interface ProductConfig {
  type: ProductType;
  accessType: AccessType;
  enrollmentHandler?: EnrollmentHandlerName;
}

export const PRODUCT_REGISTRY: Partial<Record<ProductType, ProductConfig>> = {
  INTERVIEW_SHEET: {
    type: "INTERVIEW_SHEET",
    accessType: "ONE_TIME",
    enrollmentHandler: "enrollInSheet",
  },
  SHIKSHA: {
    type: "SHIKSHA",
    accessType: "ONE_TIME",
    enrollmentHandler: "enrollInCourse",
  },
  PROJECTS: {
    type: "PROJECTS",
    accessType: "ONE_TIME",
  },
  PREPYATRA: {
    type: "PREPYATRA",
    accessType: "SUBSCRIPTION",
    enrollmentHandler: "createSubscription",
  },
  DSA_YATRA: {
    type: "DSA_YATRA",
    accessType: "SUBSCRIPTION",
    enrollmentHandler: "createSubscription",
  },
  ONCAMPUS: {
    type: "ONCAMPUS",
    accessType: "SUBSCRIPTION",
    enrollmentHandler: "createSubscription",
  },
  WEBINAR: {
    type: "WEBINAR",
    accessType: "ONE_TIME",
  },
};

const getProductConfig = (productType: ProductType): ProductConfig => {
  const config = PRODUCT_REGISTRY[productType];
  if (!config) {
    throw new Error(
      `Product type ${productType} not registered in PRODUCT_REGISTRY`,
    );
  }
  return config;
};

const isValidProductType = (
  productType: string,
): productType is ProductType => {
  return productType in PRODUCT_REGISTRY;
};

export { getProductConfig, isValidProductType };
