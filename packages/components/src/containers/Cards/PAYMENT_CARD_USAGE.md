# 💳 Universal PaymentCard Usage Guide

## Overview

The `PaymentCard` component is now **universal** and works with all product types:
- ✅ INTERVIEW_SHEET
- ✅ SHIKSHA (Courses)
- ✅ PROJECTS
- ✅ PREPYATRA (Subscriptions)
- ✅ GENERAL (Any other product)

## Quick Start

### Step 1: Import Required Components & Hooks

```typescript
import { PaymentCard } from '@tbe/components';
import { usePaymentAccess, useUser } from '@tbe/hooks';
import { useState } from 'react';
```

### Step 2: Use `usePaymentAccess` Hook

This hook abstracts all the payment status checking and locked logic:

```typescript
const { user } = useUser();
const [showPayment, setShowPayment] = useState(false);

// Universal payment access hook - works for all product types!
const { isLocked, hasAccess, isLoading } = usePaymentAccess({
  productId: product._id,
  productType: 'INTERVIEW_SHEET', // or 'SHIKSHA', 'PROJECTS', etc.
  isPremium: product.isPremium,
  isEnrolled: product.isEnrolled,
});
```

### Step 3: Show Locked Content or Payment Card

```typescript
{isLocked ? (
  <div>
    {/* Your locked content UI */}
    {!showPayment && (
      <Button onClick={() => setShowPayment(true)}>
        Pay Now to Unlock
      </Button>
    )}
    
    {showPayment && (
      <PaymentCard
        course={product}
        onClose={() => setShowPayment(false)}
        productType="INTERVIEW_SHEET"
      />
    )}
  </div>
) : (
  {/* Your unlocked content */}
)}
```

## Complete Example: Interview Sheet Page

```typescript
import { PaymentCard, Button, Text } from '@tbe/components';
import { usePaymentAccess, useUser } from '@tbe/hooks';
import { useState } from 'react';

const SheetPage = ({ sheet }) => {
  const { user } = useUser();
  const [showPayment, setShowPayment] = useState(false);

  // One hook call - handles everything!
  const { isLocked, hasAccess } = usePaymentAccess({
    productId: sheet._id,
    productType: 'INTERVIEW_SHEET',
    isPremium: sheet.isPremium,
    isEnrolled: sheet.isEnrolled,
  });

  return (
    <div>
      {isLocked ? (
        <div className="locked-content">
          <Text>This is a premium interview sheet</Text>
          {!showPayment && (
            <Button onClick={() => setShowPayment(true)}>
              Pay Now to Unlock
            </Button>
          )}
          {showPayment && (
            <PaymentCard
              course={sheet}
              onClose={() => setShowPayment(false)}
              productType="INTERVIEW_SHEET"
            />
          )}
        </div>
      ) : (
        <div className="unlocked-content">
          {/* Show all questions */}
        </div>
      )}
    </div>
  );
};
```

## Complete Example: Course Page (SHIKSHA)

```typescript
import { PaymentCard, Button } from '@tbe/components';
import { usePaymentAccess, useUser } from '@tbe/hooks';
import { useState } from 'react';

const CoursePage = ({ course }) => {
  const { user } = useUser();
  const [showPayment, setShowPayment] = useState(false);

  // Same hook, different product type!
  const { isLocked } = usePaymentAccess({
    productId: course._id,
    productType: 'SHIKSHA',
    isPremium: course.isPremium,
    isEnrolled: course.isEnrolled,
  });

  return (
    <div>
      {isLocked ? (
        <div>
          <p>This course requires payment</p>
          {!showPayment && (
            <Button onClick={() => setShowPayment(true)}>
              Enroll Now
            </Button>
          )}
          {showPayment && (
            <PaymentCard
              course={course}
              onClose={() => setShowPayment(false)}
              productType="SHIKSHA"
            />
          )}
        </div>
      ) : (
        <div>
          {/* Show course chapters */}
        </div>
      )}
    </div>
  );
};
```

## Complete Example: Project Page

```typescript
import { PaymentCard, Button } from '@tbe/components';
import { usePaymentAccess } from '@tbe/hooks';
import { useState } from 'react';

const ProjectPage = ({ project }) => {
  const [showPayment, setShowPayment] = useState(false);

  // Works for projects too!
  const { isLocked } = usePaymentAccess({
    productId: project._id,
    productType: 'PROJECTS',
    isPremium: project.isPremium,
    isEnrolled: project.isEnrolled,
  });

  return (
    <div>
      {isLocked ? (
        <PaymentCard
          course={project}
          onClose={() => setShowPayment(false)}
          productType="PROJECTS"
        />
      ) : (
        <div>{/* Project content */}</div>
      )}
    </div>
  );
};
```

## Product Type Configuration

The `PaymentCard` automatically uses the correct configuration based on `productType`:

- **INTERVIEW_SHEET**: Shows interview-specific benefits
- **SHIKSHA**: Shows course-specific benefits
- **PROJECTS**: Shows project-specific benefits
- **PREPYATRA**: Shows subscription benefits
- **GENERAL**: Shows generic benefits (fallback)

## usePaymentAccess Hook API

```typescript
interface UsePaymentAccessProps {
  productId: string;        // Required: Product ID
  productType?: string;     // Optional: Product type
  isPremium?: boolean;      // Optional: Is product premium
  isEnrolled?: boolean;     // Optional: Is user enrolled
}

// Returns:
{
  isPurchased: boolean | null;  // Payment status
  isLocked: boolean;            // Is product locked?
  hasAccess: boolean;           // Does user have access?
  isLoading: boolean;            // Is status loading?
}
```

## Migration from Old Code

### Before (Manual Logic):
```typescript
const { isPurchased } = usePaymentStatus({
  userId: user?.id,
  productId: sheet._id,
  productType: 'INTERVIEW_SHEET',
  isPremium: sheet.isPremium,
});

const isLocked = sheet.isPremium && !sheet.isEnrolled && isPurchased === false;
```

### After (Automatic):
```typescript
const { isLocked } = usePaymentAccess({
  productId: sheet._id,
  productType: 'INTERVIEW_SHEET',
  isPremium: sheet.isPremium,
  isEnrolled: sheet.isEnrolled,
});
```

## Benefits

1. ✅ **Minimal Setup**: Just 3 props needed
2. ✅ **Automatic Logic**: Locked status calculated automatically
3. ✅ **Universal**: Works for all product types
4. ✅ **Type-Safe**: Full TypeScript support
5. ✅ **Consistent**: Same pattern everywhere

## Notes

- The `PaymentCard` automatically configures itself based on `productType`
- No need to pass product-specific content - it's all in configs
- The hook handles all payment status checking internally
- Works with PrepYatra subscriptions automatically

