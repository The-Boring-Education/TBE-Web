import { type Model, model, models, Schema } from "mongoose";

import { DATABASE_MODELS, PAYMENT_STATUS, PRODUCT_TYPE } from "@/lib/constants";
import type { PaymentModel } from "@/lib/interfaces";

const PaymentSchema: Schema<PaymentModel> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.USER,
      required: [true, "User ref is required"],
    },
    productId: {
      type: String,
      required: [true, "Product ID is required"],
    },
    productType: {
      type: String,
      enum: PRODUCT_TYPE,
      required: [true, "Product type is required"],
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount cannot be negative"],
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    paymentId: {
      type: String,
    },
    paymentLink: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: PAYMENT_STATUS,
      default: "PENDING",
    },
    gateway: {
      type: String,
      default: "CASHFREE",
    },
    appliedCoupon: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.COUPON,
      default: null,
    },
    couponCode: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

PaymentSchema.index({ user: 1, productId: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ createdAt: -1 });
PaymentSchema.index({ paymentId: 1 }, { sparse: true });

const Payment: Model<PaymentModel> =
  models?.Payment ||
  model<PaymentModel>(DATABASE_MODELS.PAYMENT, PaymentSchema);

export default Payment;
