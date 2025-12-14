import type { PaymentModel } from '@/lib/interfaces'
import { getProductConfig } from '@/lib/constants/products'
import { executeEnrollmentHandler } from './enrollmentHandlers'


const processPostPaymentEnrollment = async (
    payment: PaymentModel
): Promise<{ success: boolean; error?: string; data?: any }> => {
    try {
        const productConfig = getProductConfig(payment.productType)

        if (!productConfig.requiresEnrollment) {
            if (productConfig.enrollmentHandler) {
                return await executeEnrollmentHandler(
                    productConfig.enrollmentHandler,
                    payment
                )
            }
            // No enrollment needed
            return {
                success: true,
                data: { noEnrollmentRequired: true },
            }
        }

        // Check if enrollment handler exists
        if (!productConfig.enrollmentHandler) {
            console.warn(
                `No enrollment handler configured for ${payment.productType}`
            )
            return {
                success: false,
                error: `No enrollment handler configured for ${payment.productType}`,
            }
        }

        // Execute enrollment handler
        const result = await executeEnrollmentHandler(
            productConfig.enrollmentHandler,
            payment
        )

        if (!result.success) {
            console.error(
                `Enrollment failed for ${payment.productType}:`,
                result.error
            )
        } else {
            console.log(
                `Successfully enrolled user in ${payment.productType} - Order: ${payment.orderId}`
            )
        }

        return result
    } catch (error: any) {
        console.error('Payment enrollment processing error:', error)
        return {
            success: false,
            error: error.message || 'Unknown enrollment error',
        }
    }
}

export { processPostPaymentEnrollment }

