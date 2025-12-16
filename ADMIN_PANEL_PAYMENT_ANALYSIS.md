# 🔍 Admin Panel और Payment System Analysis

## 📋 Table of Contents
1. [Admin Panel Structure](#admin-panel-structure)
2. [Existing Admin APIs](#existing-admin-apis)
3. [Payment System APIs](#payment-system-apis)
4. [Coupon System APIs](#coupon-system-apis)
5. [Interview Sheet APIs](#interview-sheet-apis)
6. [Missing APIs](#missing-apis)
7. [Implementation Plan](#implementation-plan)

---

## 🏗️ Admin Panel Structure

### Frontend Admin Pages (`apps/platform/src/pages/admin/`)
- `index.tsx` - Admin Dashboard (Overview, stats, charts)
- `users.tsx` - User management
- `analytics.tsx` - Analytics data
- `revenue.tsx` - Revenue data

### Admin Authentication
- **Middleware**: `apps/api/src/middleware/api.ts` - `adminMiddleware` function
- **Header-based Auth**: Uses `x-admin-secret` header
- **Secret**: `process.env.ADMIN_SECRET` (default: "TBEAdmin")
- **Admin Emails**: `apps/api/src/middleware/admin.ts` - `["theboringeducation@gmail.com"]`

---

## ✅ Existing Admin APIs

### 1. Dashboard APIs (`/api/v1/admin/dashboard`)
- **GET** `/api/v1/admin/dashboard?type=overview` - Get overview stats
- **GET** `/api/v1/admin/dashboard?type=users&page=1&limit=20` - Get paginated users
- **GET** `/api/v1/admin/dashboard?type=user-courses` - Get user course enrollments
- **GET** `/api/v1/admin/dashboard?type=user-projects` - Get user project enrollments
- **GET** `/api/v1/admin/dashboard?type=user-sheets` - Get user sheet enrollments

### 2. Analytics APIs (`/api/v1/admin/analytics`)
- **GET** `/api/v1/admin/analytics?type=user-engagement` - User engagement analytics
- **GET** `/api/v1/admin/analytics?type=revenue` - Revenue analytics

### 3. User Management APIs (`/api/v1/admin/users`)
- **GET** `/api/v1/admin/users?action=growth` - User growth data
- Multiple user-related endpoints

### 4. Content Management (`/api/v1/admin/content`)
- Content management endpoints

### 5. Other Admin APIs
- `/api/v1/admin/quiz-analytics` - Quiz analytics
- `/api/v1/admin/quiz-active-sessions` - Active quiz sessions
- `/api/v1/admin/prepyatra/*` - PrepYatra admin endpoints
- `/api/v1/admin/mentorship/*` - Mentorship admin endpoints

---

## 💳 Payment System APIs

### Existing Payment APIs (`/api/v1/payment/`)

#### 1. Create Payment Order
- **POST** `/api/v1/payment/create-order`
- **Purpose**: Create a new payment order with Cashfree
- **Body**: 
  ```typescript
  {
    userId: string;
    productId: string;
    productType: string;
    amount: number;
    customerName: string;
    customerEmail: string;
    appliedCoupon?: string; // Coupon ID
    couponCode?: string;
  }
  ```
- **Response**: Returns `paymentSessionId` and `paymentLink`

#### 2. Payment Webhook
- **POST** `/api/v1/payment/webhook`
- **Purpose**: Handle Cashfree payment webhooks
- Updates payment status in DB and handles enrollment

#### 3. Check Payment Status
- **GET** `/api/v1/payment/checkstatus`
- **Purpose**: Check if user has purchased a product

### Payment Model Structure
```typescript
{
  user: ObjectId (ref: User),
  productId: string,
  productType: string, // enum: PRODUCT_TYPE
  amount: number,
  orderId: string (unique),
  paymentId: string,
  paymentLink: string,
  isPaid: boolean,
  appliedCoupon: ObjectId (ref: Coupon),
  couponCode: string,
  createdAt: Date,
  updatedAt: Date
}
```

### ❌ Missing Payment APIs for Admin

**⚠️ NO ADMIN API EXISTS FOR:**
- ❌ Get all payments (paginated)
- ❌ Get payment by ID
- ❌ Update payment status manually (admin override)
- ❌ Get payments by user
- ❌ Get payments by product
- ❌ Get payments with filters (date range, status, product type)
- ❌ Payment statistics/analytics for admin

---

## 🎟️ Coupon System APIs

### Existing Coupon APIs (`/api/v1/coupon/`)

#### 1. Get All Coupons (Admin Only)
- **GET** `/api/v1/coupon`
- **Auth**: Admin middleware required
- **Response**: List of all coupons

#### 2. Create Coupon (Admin Only)
- **POST** `/api/v1/coupon`
- **Auth**: Admin middleware required
- **Body**:
  ```typescript
  {
    code: string;
    discountPercentage: number; // 1-100
    description: string;
    isActive?: boolean; // default: true
    expiryDate: string; // ISO date string
    maxUsage?: number; // optional, null = unlimited
    minimumAmount?: number; // default: 0
    applicableProducts?: string[]; // empty = all products
  }
  ```

#### 3. Get Single Coupon (Admin Only)
- **GET** `/api/v1/coupon/[couponId]`
- **Auth**: Admin middleware required

#### 4. Update Coupon (Admin Only)
- **PUT** `/api/v1/coupon/[couponId]`
- **Auth**: Admin middleware required
- **Body**: Partial update of coupon fields

#### 5. Delete Coupon (Admin Only)
- **DELETE** `/api/v1/coupon/[couponId]`
- **Auth**: Admin middleware required

#### 6. Apply Coupon to Sheets (Admin Only)
- **POST** `/api/v1/coupon/[couponId]/bulk-apply`
- **Auth**: Admin middleware required
- **Body**: 
  ```typescript
  {
    sheetIds: string[];
  }
  ```
- **Purpose**: Add sheet IDs to coupon's `applicableProducts` array

### Coupon Model Structure
```typescript
{
  code: string (unique, uppercase),
  discountPercentage: number, // 1-100
  description: string,
  isActive: boolean,
  expiryDate: Date,
  maxUsage: number | null, // null = unlimited
  currentUsage: number, // default: 0
  applicableProducts: string[], // empty = all products
  minimumAmount: number, // default: 0
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### ✅ Coupon APIs Status: **COMPLETE**
All necessary coupon CRUD operations exist for admin.

---

## 📝 Interview Sheet APIs

### Existing Interview Sheet APIs (`/api/v1/interview-prep/`)

#### 1. Get All Sheets
- **GET** `/api/v1/interview-prep`

#### 2. Upload/Create Sheet
- **POST** `/api/v1/interview-prep/upload`

#### 3. Get Single Sheet
- **GET** `/api/v1/interview-prep/[sheetId]?userId=xxx`
- **Purpose**: Get sheet details for a user

#### 4. Update Sheet ✅
- **PATCH** `/api/v1/interview-prep/[sheetId]`
- **Body**: Partial update with `AddInterviewSheetRequestPayloadProps`
- **Fields that can be updated**:
  ```typescript
  {
    name?: string;
    meta?: string;
    slug?: string;
    coverImageURL?: string;
    description?: string;
    liveOn?: Date;
    isPremium?: boolean;
    price?: number; ✅ // Can update price
    discountPercentage?: number; ✅ // Can update discount
    roadmap?: string;
    features?: string[];
    // appliedCoupon is in model but not in update interface
  }
  ```

### Interview Sheet Model Structure
```typescript
{
  name: string,
  meta: string,
  slug: string,
  coverImageURL: string,
  description: string,
  liveOn: Date,
  isPremium: boolean,
  price: number, ✅
  discountPercentage: number, ✅ // 0-100
  appliedCoupon?: ObjectId (ref: Coupon), ✅
  questions: InterviewSheetQuestionModel[],
  roadmap: RoadmapsType,
  features: string[],
  createdAt: Date,
  updatedAt: Date
}
```

### ⚠️ Interview Sheet Update API Issues

**Current Status:**
- ✅ API exists: `PATCH /api/v1/interview-prep/[sheetId]`
- ✅ Can update `price` and `discountPercentage`
- ❌ **NO ADMIN AUTH** - Anyone can call this API!
- ❌ `appliedCoupon` field exists in model but update might not handle it properly

**Missing:**
- ❌ Admin-only endpoint for updating sheet prices/discounts
- ❌ API to set/update `appliedCoupon` on a sheet
- ❌ API to remove `appliedCoupon` from a sheet

---

## ❌ Missing APIs Summary

### 1. Admin Payment APIs (Critical Missing)

#### Get All Payments (Paginated)
```
GET /api/v1/admin/payments?page=1&limit=20&status=all|paid|unpaid&productType=INTERVIEW_SHEET
```
- List all payments with filters
- Include user details (populated)
- Include product details
- Include coupon details if applied

#### Get Payment by ID
```
GET /api/v1/admin/payments/[paymentId]
```
- Get single payment with all details

#### Update Payment Status (Manual Override)
```
PATCH /api/v1/admin/payments/[paymentId]
```
- Admin can manually update payment status
- Useful for refunds, corrections, etc.

#### Payment Statistics
```
GET /api/v1/admin/payments/stats
```
- Total revenue
- Payments by status
- Payments by product type
- Recent payments

### 2. Admin Interview Sheet Price/Discount APIs

#### Update Sheet Price/Discount (Admin Only)
```
PATCH /api/v1/admin/interview-prep/[sheetId]/pricing
```
- Update price
- Update discountPercentage
- Admin auth required

#### Apply Coupon to Sheet
```
POST /api/v1/admin/interview-prep/[sheetId]/coupon
Body: { couponId: string }
```
- Set `appliedCoupon` field on sheet
- Validate coupon exists

#### Remove Coupon from Sheet
```
DELETE /api/v1/admin/interview-prep/[sheetId]/coupon
```
- Remove `appliedCoupon` from sheet

#### Get All Sheets with Pricing Info (Admin)
```
GET /api/v1/admin/interview-prep?includePricing=true
```
- Get all sheets with price, discount, coupon info
- Useful for admin panel display

### 3. Frontend Integration Points

**Admin Panel needs:**
- Payment listing page (similar to users.tsx)
- Payment detail modal/page
- Interview Sheet pricing management page
- Coupon management page (partially exists via coupon APIs)

---

## 📊 Database Queries Status

### Payment Queries (`apps/api/src/lib/database/queries/payment.ts`)
- ✅ `addPaymentToDB` - Create payment
- ✅ `getPaymentByOrderIdFromDB` - Get by order ID
- ✅ `updatePaymentStatusToDB` - Update status
- ✅ `checkPaymentStatusFromDB` - Check if user purchased
- ❌ **Missing**: `getAllPaymentsFromDB` (paginated, with filters)
- ❌ **Missing**: `getPaymentByIdFromDB`
- ❌ **Missing**: `getPaymentsByUserIdFromDB`
- ❌ **Missing**: `getPaymentsByProductIdFromDB`

### Coupon Queries (`apps/api/src/lib/database/queries/coupon.ts`)
- ✅ All necessary queries exist
- ✅ `getAllCouponsFromDB`
- ✅ `getCouponByIdFromDB`
- ✅ `createCouponFromDB`
- ✅ `updateCouponFromDB`
- ✅ `deleteCouponFromDB`
- ✅ `applyCouponToSheetsFromDB`
- ✅ `removeCouponFromSheetFromDB`

### Interview Sheet Queries (`apps/api/src/lib/database/queries/interview-prep.ts`)
- ✅ `updateInterviewSheetInDB` - Updates any field
- ⚠️ **Issue**: No admin auth check
- ⚠️ **Issue**: Not clear if `appliedCoupon` can be set via this

---

## 🎯 Implementation Plan

### Phase 1: Payment Admin APIs (High Priority)

1. **Create Database Query Functions**
   - `getAllPaymentsFromDB` - Paginated, with filters
   - `getPaymentByIdFromDB` - Single payment
   - `getPaymentsByUserIdFromDB` - User's payments
   - `getPaymentsByProductIdFromDB` - Product payments

2. **Create Admin Payment API Endpoints**
   - `GET /api/v1/admin/payments` - List all (with admin auth)
   - `GET /api/v1/admin/payments/[paymentId]` - Get single
   - `PATCH /api/v1/admin/payments/[paymentId]` - Update status
   - `GET /api/v1/admin/payments/stats` - Statistics

### Phase 2: Interview Sheet Admin APIs (High Priority)

1. **Create Admin Interview Sheet Pricing Endpoints**
   - `PATCH /api/v1/admin/interview-prep/[sheetId]/pricing` - Update price/discount (admin only)
   - `POST /api/v1/admin/interview-prep/[sheetId]/coupon` - Apply coupon to sheet
   - `DELETE /api/v1/admin/interview-prep/[sheetId]/coupon` - Remove coupon
   - `GET /api/v1/admin/interview-prep` - Get all sheets with pricing (admin view)

2. **Update Existing Interview Sheet Update API**
   - Add admin auth check OR
   - Keep existing but add admin-specific endpoints

### Phase 3: Frontend Integration

1. **Payment Management Page**
   - List all payments
   - Filters (status, product type, date range)
   - Payment detail view
   - Manual status update

2. **Interview Sheet Pricing Page**
   - List all sheets with pricing
   - Edit price/discount per sheet
   - Apply/remove coupons per sheet
   - Bulk operations

3. **Coupon Management Page** (Enhance existing)
   - List coupons
   - Create/edit/delete coupons
   - Apply coupons to sheets (bulk or single)

---

## 🔐 Security Considerations

### Current Admin Auth
- Uses `x-admin-secret` header
- Secret stored in `process.env.ADMIN_SECRET`
- Applied via `adminMiddleware` function

### Required for New APIs
- All new admin APIs MUST use `adminMiddleware`
- Payment update APIs should log admin actions
- Consider adding admin action audit trail

---

## 📝 Notes

1. **Coupon System**: ✅ Complete - All CRUD operations exist
2. **Payment System**: ❌ Missing admin management APIs
3. **Interview Sheet**: ⚠️ Update API exists but:
   - No admin auth
   - Unclear if `appliedCoupon` can be set
   - Need admin-specific endpoints

4. **Database Models**: All models support required fields
   - Payment model has `appliedCoupon` and `couponCode`
   - InterviewSheet model has `price`, `discountPercentage`, `appliedCoupon`
   - Coupon model is complete

5. **Current Payment Flow**:
   - User creates order → Payment record created with coupon info
   - Webhook updates payment status
   - Enrollment happens after successful payment

