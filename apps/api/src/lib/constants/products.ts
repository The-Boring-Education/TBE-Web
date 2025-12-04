import type { ProductType } from './database'

export interface ProductConfig {
    type: ProductType
    requiresEnrollment: boolean
    enrollmentHandler?: string
    prepYatraAccess: boolean
}

export const PRODUCT_REGISTRY: Record<ProductType, ProductConfig> = {
    INTERVIEW_SHEET: {
        type: 'INTERVIEW_SHEET',
        requiresEnrollment: true,
        enrollmentHandler: 'enrollInSheet',
        prepYatraAccess: true,
    },
    SHIKSHA: {
        type: 'SHIKSHA',
        requiresEnrollment: true,
        enrollmentHandler: 'enrollInCourse',
        prepYatraAccess: true,
    },
    PREPYATRA: {
        type: 'PREPYATRA',
        requiresEnrollment: false,
        enrollmentHandler: 'createSubscription',
        prepYatraAccess: false,
    },
}

const getProductConfig = (productType: ProductType): ProductConfig => {
    const config = PRODUCT_REGISTRY[productType]
    if (!config) {
        throw new Error(
            `Product type ${productType} not registered in PRODUCT_REGISTRY`
        )
    }
    return config
}

const isValidProductType = (
    productType: string
): productType is ProductType => {
    return productType in PRODUCT_REGISTRY
}

export { getProductConfig, isValidProductType }

