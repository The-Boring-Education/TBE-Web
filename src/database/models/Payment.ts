import { Schema, model, models, type Model } from 'mongoose';
import { DATABASE_MODELS } from '@/constant';
import type { PaymentModel } from '@/interfaces';

const PaymentSchema: Schema<PaymentModel> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.USER,
      required: [true, 'User ref is required'],
    },

    interviewSheetId: {
      type: Schema.Types.ObjectId,
      ref:DATABASE_MODELS.INTERVIEW_SHEET,
      required: [true, 'Interview Sheet ID is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be greater than 0'],
    },
    cashfreeOrderId: {
      type: String,
      required: [true, 'Cashfree Order ID is required'],
      unique: true,
    },
    cashfreePaymentId: {
      type: String,
    },
    paymentLink: {
      type: String,
      required: [true, 'Payment link is required'],
    },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED'],
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
