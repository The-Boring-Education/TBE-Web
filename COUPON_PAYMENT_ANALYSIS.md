# 🔍 Coupon Codes और Payment System Analysis

## 📋 Table of Contents
1. [Current Coupon APIs](#current-coupon-apis)
2. [Payment Flow with Coupons](#payment-flow-with-coupons)
3. [API Classification (Admin vs User)](#api-classification)
4. [Recommendations](#recommendations)

---

## 📝 Current Coupon APIs

### 1. **GET/POST `/api/v1/coupon`** ❌ **ADMIN ONLY** (Should be moved)
- **Location**: `apps/api/src/pages/api/v1/coupon/index.ts`
- **Auth**: Uses `adminMiddleware` ✅
- **Methods**:
  - `GET` - Get all coupons (admin only)
  - `POST` - Create new coupon (admin only)
- **Status**: ✅ Admin protected, but in wrong location
- **Should Move To**: `/api/v1/admin/coupon`

### 2. **GET/PUT/DELETE `/api/v1/coupon/[couponId]`** ❌ **ADMIN ONLY** (Should be moved)
- **Location**: `apps/api/src/pages/api/v1/coupon/[couponId].ts`
- **Auth**: Uses `adminMiddleware` ✅
- **Methods**:
  - `GET` - Get single coupon by ID (admin only)
  - `PUT` - Update coupon (admin only)
  - `DELETE` - Delete coupon (admin only)
- **Status**: ✅ Admin protected, but in wrong location
- **Should Move To**: `/api/v1/admin/coupon/[couponId]`

### 3. **POST `/api/v1/coupon/[couponId]/bulk-apply`** ❌ **ADMIN ONLY** (Should be moved)
- **Location**: `apps/api/src/pages/api/v1/coupon/[couponId]/bulk-apply.ts`
- **Auth**: Uses `adminMiddleware` ✅
- **Method**: `POST` - Apply coupon to multiple sheets (admin only)
- **Body**: `{ sheetIds: string[] }`
- **Status**: ✅ Admin protected, but in wrong location
- **Should Move To**: `/api/v1/admin/coupon/[couponId]/bulk-apply`

### 4. **POST `/api/v1/coupon/validate`** ✅ **USER API** (Correct location)
- **Location**: `apps/api/src/pages/api/v1/coupon/validate.ts`
- **Auth**: ❌ **NO ADMIN AUTH** - Public/User API
- **Method**: `POST` - Validate coupon code for a product
- **Body**:
  ```typescript
  {
    code: string;
    productId: string;
    productType: string;
    userId?: string; // Optional
  }
  ```
- **Purpose**: Users can validate/check if a coupon code is valid for their purchase
- **Usage**: Used by frontend when user enters coupon code
- **Status**: ✅ Correct - This is a user-facing API, should stay in `/coupon/`

---

## 💳 Payment Flow with Coupons

### Current Payment Flow:

```
1. User views product (e.g., Interview Sheet)
   ↓
2. User enters coupon code (optional)
   ↓
3. Frontend calls: POST /api/v1/coupon/validate
   - Validates coupon code
   - Returns coupon details with discount
   ↓
4. Frontend calculates discounted price
   ↓
5. User clicks "Buy Now"
   ↓
6. Frontend calls: POST /api/v1/payment/create-order
   Body: {
     userId, productId, productType,
     amount: <discounted_price>,
     appliedCoupon: <coupon_id>,  // ✅ Coupon info sent here
     couponCode: <coupon_code>
   }
   ↓
7. API creates payment order with Cashfree
   ↓
8. Payment record saved to DB with coupon info
   {
     appliedCoupon: ObjectId,  // Coupon reference
     couponCode: string,        // Coupon code string
     amount: number            // Final amount (already discounted)
   }
   ↓
9. User redirected to Cashfree payment gateway
   ↓
10. Payment webhook updates status
```

### Key Points:

1. **Coupon Validation Happens on Frontend**:
   - User validates coupon BEFORE payment
   - Frontend calculates discounted price
   - Discounted amount is sent to `create-order` API

2. **Coupon Info Stored in Payment**:
   - `appliedCoupon`: Coupon ObjectId reference
   - `couponCode`: Coupon code string (for reference)
   - Payment model has these fields ✅

3. **Amount Calculation**:
   - **Frontend calculates discount** based on coupon validation response
   - Final discounted amount sent to payment API
   - API does NOT recalculate discount

---

## 🎯 API Classification

### ✅ **User-Facing APIs** (Should stay in `/coupon/`):
- `POST /api/v1/coupon/validate` - Validate coupon code ✅

### ❌ **Admin APIs** (Should move to `/admin/coupon/`):
- `GET /api/v1/coupon` - Get all coupons (admin only)
- `POST /api/v1/coupon` - Create coupon (admin only)
- `GET /api/v1/coupon/[couponId]` - Get single coupon (admin only)
- `PUT /api/v1/coupon/[couponId]` - Update coupon (admin only)
- `DELETE /api/v1/coupon/[couponId]` - Delete coupon (admin only)
- `POST /api/v1/coupon/[couponId]/bulk-apply` - Bulk apply to sheets (admin only)

---

## 📊 Current API Structure

```
/api/v1/coupon/
  ├── index.ts                    ❌ ADMIN (move to /admin/coupon)
  ├── validate.ts                 ✅ USER (keep here)
  ├── [couponId]/
  │   ├── index.ts               ❌ ADMIN (move to /admin/coupon/[couponId])
  │   └── bulk-apply.ts          ❌ ADMIN (move to /admin/coupon/[couponId]/bulk-apply)
```

### Recommended Structure:

```
/api/v1/
  ├── coupon/
  │   └── validate.ts            ✅ USER API (keep here)
  └── admin/
      └── coupon/
          ├── index.ts           ✅ ADMIN (moved from /coupon/index.ts)
          └── [couponId]/
              ├── index.ts       ✅ ADMIN (moved from /coupon/[couponId].ts)
              └── bulk-apply.ts  ✅ ADMIN (moved from /coupon/[couponId]/bulk-apply.ts)
```

---

## ✅ Validate API Analysis

### **POST `/api/v1/coupon/validate`**

**Purpose**: 
- Users can check if a coupon code is valid
- Validates coupon against product and user
- Returns coupon details with discount info

**Auth**: 
- ❌ **NO ADMIN AUTH** - Public/User API
- Anyone can call this (intended behavior)

**Request Body**:
```typescript
{
  code: string;           // Coupon code (e.g., "SUMMER50")
  productId: string;      // Product ID (sheet ID, course ID, etc.)
  productType: string;    // "INTERVIEW_SHEET", "SHIKSHA", etc.
  userId?: string;        // Optional - for usage tracking
}
```

**Response**:
```typescript
{
  status: true,
  message: "Coupon validated successfully",
  data: {
    _id: string,
    code: string,
    discountPercentage: number,
    description: string,
    isActive: boolean,
    expiryDate: string,
    maxUsage?: number,
    currentUsage: number,
    applicableProducts: string[],
    minimumAmount: number,
    isValid: boolean  // Whether coupon is valid for this product
  }
}
```

**Frontend Usage** (from `SheetLandingPage.tsx`):
```typescript
// User enters coupon code
const handleApplyCoupon = async () => {
  const response = await fetch(`${routes.api.base}${routes.api.validateCoupon}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: couponCode.toUpperCase(),
      productId: sheet?._id,
      productType: 'INTERVIEW_SHEET',
    }),
  });
  
  const data = await response.json();
  if (data.status && data.data) {
    setAppliedCoupon(data.data); // Store coupon for payment
  }
};
```

**Payment Integration** (from `PaymentCard.tsx`):
```typescript
// When creating payment order, coupon info is included
body: JSON.stringify({
  userId: user?.id,
  productId: course._id,
  productType,
  amount: course.price, // Already discounted price calculated on frontend
  ...(course.appliedCoupon && {
    appliedCoupon: course.appliedCoupon._id,
    couponCode: course.appliedCoupon.code,
  }),
}),
```

**Conclusion**: ✅ **This is a USER API** - Should stay in `/api/v1/coupon/validate`

---

## 🔄 Complete Payment Flow with Coupon

### Step-by-Step Flow:

1. **User Views Product**
   - Frontend loads product details (price, etc.)

2. **User Enters Coupon Code** (Optional)
   - User types coupon code in UI
   - Frontend calls: `POST /api/v1/coupon/validate`
   - Validates:
     - Coupon exists and is active
     - Coupon not expired
     - Coupon applicable to this product
     - Usage limit not exceeded
     - Minimum amount requirement met

3. **Frontend Calculates Discount**
   ```typescript
   const originalPrice = sheet.price; // e.g., 499
   const discountPercentage = appliedCoupon.discountPercentage; // e.g., 20
   const discountAmount = (originalPrice * discountPercentage) / 100; // 99.8
   const finalPrice = originalPrice - discountAmount; // 399.2
   ```

4. **User Clicks "Buy Now"**
   - Frontend has `appliedCoupon` object stored in state

5. **Create Payment Order**
   - Frontend calls: `POST /api/v1/payment/create-order`
   - Sends:
     - `amount`: finalPrice (already discounted)
     - `appliedCoupon`: coupon._id
     - `couponCode`: coupon.code

6. **Payment API Processing**
   - Creates Cashfree order with discounted amount
   - Saves payment record with coupon info
   - Returns payment link

7. **User Completes Payment**
   - Redirected to Cashfree gateway
   - Pays discounted amount
   - Webhook updates payment status

8. **Enrollment**
   - After successful payment, user gets access to product

---

## 📋 Recommendations

### 1. **Move Admin Coupon APIs to Admin Folder**

**Files to Move**:
1. `apps/api/src/pages/api/v1/coupon/index.ts` 
   → `apps/api/src/pages/api/v1/admin/coupon/index.ts`

2. `apps/api/src/pages/api/v1/coupon/[couponId].ts`
   → `apps/api/src/pages/api/v1/admin/coupon/[couponId].ts`

3. `apps/api/src/pages/api/v1/coupon/[couponId]/bulk-apply.ts`
   → `apps/api/src/pages/api/v1/admin/coupon/[couponId]/bulk-apply.ts`

**Keep in Current Location**:
- `apps/api/src/pages/api/v1/coupon/validate.ts` ✅ (User API)

### 2. **Update Frontend Routes** (If needed)

Check if frontend uses admin coupon APIs:
- If admin panel calls these APIs, update routes after moving
- User-facing validate API route remains same: `/api/v1/coupon/validate`

### 3. **Documentation**

After moving:
- Update API documentation
- Update admin panel frontend code if it references these endpoints
- Update any integration tests

---

## 🎯 Summary

### Current State:
- ✅ **User API**: `/api/v1/coupon/validate` - Public, for users to validate coupons
- ❌ **Admin APIs in wrong location**: 
  - `/api/v1/coupon` (GET/POST)
  - `/api/v1/coupon/[couponId]` (GET/PUT/DELETE)
  - `/api/v1/coupon/[couponId]/bulk-apply` (POST)

### Payment Flow:
- ✅ Coupon validation happens on frontend before payment
- ✅ Frontend calculates discounted price
- ✅ Discounted amount sent to payment API
- ✅ Coupon info stored in payment record

### Action Items:
1. Move admin coupon APIs to `/api/v1/admin/coupon/`
2. Keep validate API in `/api/v1/coupon/validate`
3. Update admin panel frontend routes if needed
4. Test payment flow with coupons

