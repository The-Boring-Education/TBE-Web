import { Schema, model, models, type Model } from 'mongoose';
import { DATABASE_MODELS, PAYMENT_STATUS, PRODUCT_TYPE } from '@/constant';
import type { PaymentModel } from '@/interfaces';

const PaymentSchema: Schema<PaymentModel> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.USER,
      required: [true, 'User ref is required'],
    },
    item: {
      itemId: {
        type: Schema.Types.ObjectId,
        required: [true, 'Item ID is required'],
      },
      itemType: {
        type: String,
        enum: PRODUCT_TYPE,
        required: [true, 'Item type is required'],
      },
    },
    amount: {
      type: Number,
      required:true,
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
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
  }
);

const Payment: Model<PaymentModel> =
  models?.Payment || model<PaymentModel>(DATABASE_MODELS.PAYMENT, PaymentSchema);

export default Payment;
