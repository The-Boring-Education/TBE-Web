import { type Model, model, models, Schema } from 'mongoose';

import { DATABASE_MODELS } from '@tbe/constants';
import type { CouponModel } from '@tbe/interface';

const CouponSchema = new Schema<CouponModel>(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [20, 'Coupon code cannot exceed 20 characters'],
    },
    discountPercentage: {
      type: Number,
      required: [true, 'Discount percentage is required'],
      min: [1, 'Discount must be at least 1%'],
      max: [100, 'Discount cannot exceed 100%'],
    },
    description: {
      type: String,
      required: [true, 'Coupon description is required'],
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    maxUsage: {
      type: Number,
      default: null, // null means unlimited
      min: [1, 'Max usage must be at least 1 if specified'],
    },
    currentUsage: {
      type: Number,
      default: 0,
      min: [0, 'Current usage cannot be negative'],
    },
    applicableProducts: {
      type: [String],
      default: [], // Empty array means applicable to all products
    },
    minimumAmount: {
      type: Number,
      default: 0,
      min: [0, 'Minimum amount cannot be negative'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.USER,
      required: [true, 'Created by user is required'],
    },
  },
  {
    timestamps: true,
    _id: true,
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.id;
        return ret;
      },
    },
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.id;
        return ret;
      },
    },
  }
);

// Virtual for checking if coupon is expired
CouponSchema.virtual('isExpired').get(function () {
  return new Date() > this.expiryDate;
});

// Virtual for checking if coupon usage limit is reached
CouponSchema.virtual('isUsageLimitReached').get(function () {
  return this.maxUsage != null && this.maxUsage > 0 && this.currentUsage >= this.maxUsage;
});

// Virtual for checking if coupon is currently valid
CouponSchema.virtual('isValid').get(function () {
  return this.isActive && !this.isExpired && !this.isUsageLimitReached;
});

// Index for efficient queries
CouponSchema.index({ code: 1 });
CouponSchema.index({ isActive: 1, expiryDate: 1 });

const Coupon: Model<CouponModel> =
  models?.Coupon || model<CouponModel>(DATABASE_MODELS.COUPON, CouponSchema);

export default Coupon;