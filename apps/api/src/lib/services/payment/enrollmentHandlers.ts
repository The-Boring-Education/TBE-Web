import { planTypeMap } from '@/lib/constants'
import {
    createSubscriptionInDB,
    enrollInACourse,
    enrollInASheet,
    getActiveSubscriptionByUserFromDB,
    getEnrolledCourseFromDB,
    getEnrolledSheetFromDB,
    updateUserPointsInDB,
    updateUserSubscriptionStatusInDB,
} from '@/lib/database'
import type { PaymentModel } from '@/lib/interfaces'
import { getPYSubscriptionFeaturesByType } from '@/lib/utils'

type EnrollmentHandler = (
    payment: PaymentModel
) => Promise<{ success: boolean; error?: string; data?: any }>

const enrollInSheet: EnrollmentHandler = async (payment) => {
    try {
        const { data: alreadyEnrolled } = await getEnrolledSheetFromDB({
            userId: payment.user.toString(),
            sheetId: payment.productId,
        })

        if (alreadyEnrolled) {
            return { success: true, data: { alreadyEnrolled: true } }
        }

        const { data, error } = await enrollInASheet({
            userId: payment.user.toString(),
            sheetId: payment.productId,
        })

        if (error) {
            console.error('Sheet enrollment failed:', error)
            return { success: false, error }
        }

        // Add points for enrollment
        await updateUserPointsInDB(payment.user.toString(), 'ENROLL_SHEET')

        return { success: true, data }
    } catch (error: any) {
        console.error('Sheet enrollment error:', error)
        return { success: false, error: error.message }
    }
}

const enrollInCourse: EnrollmentHandler = async (payment) => {
    try {
        const { data: alreadyEnrolled } = await getEnrolledCourseFromDB({
            userId: payment.user.toString(),
            courseId: payment.productId,
        })

        if (alreadyEnrolled) {
            return { success: true, data: { alreadyEnrolled: true } }
        }

        const { data, error } = await enrollInACourse({
            userId: payment.user.toString(),
            courseId: payment.productId,
        })

        if (error) {
            console.error('Course enrollment failed:', error)
            return { success: false, error }
        }

        // Add points for enrollment
        await updateUserPointsInDB(payment.user.toString(), 'ENROLL_COURSE')

        return { success: true, data }
    } catch (error: any) {
        console.error('Course enrollment error:', error)
        return { success: false, error: error.message }
    }
}

const createSubscription: EnrollmentHandler = async (payment) => {
    try {
        const plan =
            planTypeMap[
                String(payment.productId) as keyof typeof planTypeMap
            ] || {
                type: '3Months',
                duration: 1,
            }

        const expiryDate =
            plan.type === 'Lifetime'
                ? new Date('2099-12-31')
                : new Date(
                      Date.now() + plan.duration * 30 * 24 * 60 * 60 * 1000
                  )

        const { data: existingSubscription } =
            await getActiveSubscriptionByUserFromDB(
                payment.user.toString(),
                plan.type
            )

        if (existingSubscription) {
            return {
                success: true,
                data: { alreadyEnrolled: true, existingSubscription },
            }
        }

        const features = getPYSubscriptionFeaturesByType(plan.type)

        const { error: createError } = await createSubscriptionInDB({
            userId: payment.user.toString(),
            type: plan.type,
            amount: payment.amount,
            duration: plan.duration,
            expiryDate,
            features,
        })

        if (createError) {
            console.error('Subscription creation failed:', createError)
            return { success: false, error: createError }
        }
                
        const { error: updateError } =
            await updateUserSubscriptionStatusInDB({
                userId: payment.user.toString(),
                subscriptionStatus: 'Active',
                subscriptionExpiry: expiryDate,
            })

        if (updateError) {
            console.error('Subscription status update failed:', updateError)
            return { success: false, error: updateError }
        }

        return { success: true, data: { plan: plan.type, expiryDate } }
    } catch (error: any) {
        console.error('Subscription enrollment error:', error)
        return { success: false, error: error.message }
    }
}

const ENROLLMENT_HANDLERS: Record<string, EnrollmentHandler> = {
    enrollInSheet,
    enrollInCourse,
    createSubscription,
}

const executeEnrollmentHandler = async (
    handlerName: string,
    payment: PaymentModel
) => {
    const handler = ENROLLMENT_HANDLERS[handlerName]
    if (!handler) {
        throw new Error(`Enrollment handler "${handlerName}" not found`)
    }
    return await handler(payment)
}

export {
    ENROLLMENT_HANDLERS,
    executeEnrollmentHandler,
}

