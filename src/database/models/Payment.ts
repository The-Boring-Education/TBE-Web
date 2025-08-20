import { type Model, model, models, Schema } from 'mongoose';

import { DATABASE_MODELS, PRODUCT_TYPE } from '@/constant';
import type { PaymentModel } from '@/interfaces';

const PaymentSchema: Schema<PaymentModel> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.USER,
      required: [true, 'User ref is required'],
    },
    productId: {
      type: String,
      required: [true, 'Product ID is required'],
    },
    productType: {
      type: String,
      enum: PRODUCT_TYPE,
      required: [true, 'Product type is required'],
    },
    amount: {
      type: Number,
      required: true,
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
    isPaid: {
      type: Boolean,
      default: false,
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
  }
);

const Payment: Model<PaymentModel> =
  models?.Payment ||
  model<PaymentModel>(DATABASE_MODELS.PAYMENT, PaymentSchema);

export default Payment;
