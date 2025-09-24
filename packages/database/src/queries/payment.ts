import { Payment, PrepYatraSubscription } from "../models"
import type {
    AddPaymentToDBRequestPayloadProps,
    DatabaseQueryResponseType,
    UpdatePaymentStatusPayloadProps
} from "@tbe/interface"

const addPaymentToDB = async ({
    userId,
    productId,
    productType,
    amount,
    orderId,
    paymentLink,
    appliedCoupon,
    couponCode
}: AddPaymentToDBRequestPayloadProps): Promise<DatabaseQueryResponseType> => {
    try {
        const payment = new Payment({
            user: userId,
            productId,
            productType,
            amount,
            orderId,
            paymentLink,
            isPaid: false,
            ...(appliedCoupon && { appliedCoupon }),
            ...(couponCode && { couponCode })
        })

        await payment.save()
        return { data: payment }
    } catch (error) {
        return { error: "Failed to save payment to DB" }
    }
}

const getPaymentByOrderIdFromDB = async (
    orderId: string
): Promise<DatabaseQueryResponseType> => {
    try {
        const payment = await Payment.findOne({ orderId })
        if (!payment) {
            return { error: "Payment not found" }
        }
        return { data: payment }
    } catch (error) {
        return { error: "Failed to find payment" }
    }
}

const updatePaymentStatusToDB = async ({
    orderId,
    paymentId,
    status
}: UpdatePaymentStatusPayloadProps): Promise<DatabaseQueryResponseType> => {
    try {
        const payment = await Payment.findOne({ orderId })
        if (!payment) {
            return { error: "Payment not found" }
        }

        payment.isPaid = status === "SUCCESS"
        if (paymentId) {
            payment.paymentId = paymentId
        }

        await payment.save()
        return { data: payment }
    } catch (error: any) {
        return { error: `Failed to update payment status: ${error.message}` }
    }
}

const checkPaymentStatusFromDB = async (
    userId: string,
    productId: string
): Promise<DatabaseQueryResponseType> => {
    try {
        const activeSubscription = await PrepYatraSubscription.findOne({
            userId,
            isActive: true
        })

        if (activeSubscription) {
            return {
                data: { purchased: true }
            }
        }

        const payment = await Payment.findOne({ user: userId, productId })

        if (!payment) {
            return {
                data: { purchased: false },
                error: "No payment record found"
            }
        }

        if (payment.isPaid) {
            return { data: { purchased: true } }
        } else {
            return {
                data: { purchased: false },
                error: "Payment not completed"
            }
        }
    } catch (error) {
        return { error: "Error checking payment status" }
    }
}

export {
    addPaymentToDB,
    checkPaymentStatusFromDB,
    getPaymentByOrderIdFromDB,
    updatePaymentStatusToDB
}
