# User Source Tracking Plan

## 🎯 **Goal**
Track which platform users come from so we can see end-to-end how many users come from each platform in the admin panel.

## 📋 **Simple Implementation Plan**

### **1. Database Changes**
Add a simple `source` field to the User model to track where users came from.

**User Model Extension:**
```typescript
// Add to User schema
source: {
  type: String,
  enum: [
    'direct',           // Direct visits to main website
    'prepyatra',        // From PrepYatra platform
    'techyatra',        // From TechYatra platform
    'dsayatra',         // From DSAYatra platform
    'resumeyatra',      // From ResumeYatra platform
    'instagram',        // From Instagram
    'linkedin',         // From LinkedIn
    'youtube',          // From YouTube
    'whatsapp',         // From WhatsApp community
    'google',           // From Google search
    'referral',         // From other websites/blogs
    'email',            // From email campaigns
    'webinar',          // From webinar promotions
    'other'             // Other sources
  ],
  default: 'direct'
}
```

### **2. URL Parameter Tracking**
Use simple URL parameters to identify the source:

**Examples:**
```
https://theboringeducation.com/login?source=prepyatra
https://theboringeducation.com/login?source=instagram
https://theboringeducation.com/login?source=linkedin
```

### **3. Authentication Flow Update**
Modify the NextAuth signIn callback to capture the source parameter:

```typescript
// In signIn callback
const source = req.query.source as string || 'direct';
// Store source when creating user
```

### **4. Admin Analytics Enhancement**
Add source tracking to the existing admin analytics API:

**New Analytics Endpoint:**
```
GET /api/v1/admin/analytics?type=user-sources
```

**Response:**
```json
{
  "status": true,
  "data": {
    "sourceBreakdown": [
      {
        "source": "prepyatra",
        "userCount": 150,
        "percentage": 25.5
      },
      {
        "source": "instagram", 
        "userCount": 120,
        "percentage": 20.4
      },
      {
        "source": "direct",
        "userCount": 100,
        "percentage": 17.0
      }
    ],
    "totalUsers": 588,
    "topSource": "prepyatra"
  }
}
```

### **5. Admin Dashboard Updates**
Add a new section to the admin dashboard showing:

- **Source Breakdown Chart**: Pie chart showing user distribution by source
- **Source Performance Table**: Table with user counts and percentages
- **Top Performing Sources**: List of top 5 sources
- **Time-based Analysis**: Source performance over time (daily/weekly/monthly)

## 🛠 **Implementation Steps**

### **Step 1: Update User Model**
- Add `source` field to User schema
- Update TypeScript interfaces
- Run database migration

### **Step 2: Update Authentication**
- Modify NextAuth signIn callback
- Capture `source` parameter from URL
- Store source when creating new users

### **Step 3: Update Admin Analytics API**
- Add new analytics type: `user-sources`
- Create aggregation query for source breakdown
- Return formatted data for admin dashboard

### **Step 4: Update Admin Dashboard**
- Add new "User Sources" section
- Create charts and tables for source data
- Add time-based filtering options

### **Step 5: Update External Platform Links**
- Add `?source=platformname` to all external platform links
- Update social media links with source parameters
- Update email campaign links

## 📊 **Expected Admin Dashboard View**

### **User Sources Overview**
```
┌─────────────────────────────────────────────────────────┐
│                    User Sources                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📊 Source Breakdown (Last 30 Days)                    │
│                                                         │
│  PrepYatra     ████████████████████ 25.5% (150 users)  │
│  Instagram     ██████████████████   20.4% (120 users)  │
│  Direct        ████████████████     17.0% (100 users)  │
│  LinkedIn      ████████████         12.2% (72 users)   │
│  YouTube       ██████████           10.2% (60 users)   │
│  Other         ████████             8.5% (50 users)    │
│  WhatsApp      ██████               6.2% (36 users)    │
│                                                         │
│  Total Users: 588                                       │
│  Top Source: PrepYatra                                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### **Source Performance Table**
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Source      │ Users       │ Percentage  │ Growth      │
├─────────────┼─────────────┼─────────────┼─────────────┤
│ PrepYatra   │ 150         │ 25.5%       │ +12% ↗️     │
│ Instagram   │ 120         │ 20.4%       │ +8% ↗️      │
│ Direct      │ 100         │ 17.0%       │ -2% ↘️      │
│ LinkedIn    │ 72          │ 12.2%       │ +15% ↗️     │
│ YouTube     │ 60          │ 10.2%       │ +5% ↗️      │
│ Other       │ 50          │ 8.5%        │ +3% ↗️      │
│ WhatsApp    │ 36          │ 6.2%        │ +20% ↗️     │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

## 🔗 **URL Examples for Different Sources**

### **External Platforms**
```
https://theboringeducation.com/login?source=prepyatra
https://theboringeducation.com/login?source=techyatra
https://theboringeducation.com/login?source=dsayatra
https://theboringeducation.com/login?source=resumeyatra
```

### **Social Media**
```
https://theboringeducation.com/login?source=instagram
https://theboringeducation.com/login?source=linkedin
https://theboringeducation.com/login?source=youtube
https://theboringeducation.com/login?source=whatsapp
```

### **Other Sources**
```
https://theboringeducation.com/login?source=google
https://theboringeducation.com/login?source=referral
https://theboringeducation.com/login?source=email
https://theboringeducation.com/login?source=webinar
```

## 📈 **Benefits**

1. **Clear Visibility**: See exactly which platforms drive the most users
2. **Performance Tracking**: Monitor which sources are growing/declining
3. **Resource Allocation**: Focus efforts on high-performing sources
4. **Simple Implementation**: Minimal code changes, easy to maintain
5. **Admin Insights**: Quick overview in admin dashboard

## ⏱️ **Timeline**

- **Day 1-2**: Update User model and database
- **Day 3**: Update authentication flow
- **Day 4**: Update admin analytics API
- **Day 5**: Update admin dashboard
- **Day 6**: Update external platform links
- **Day 7**: Testing and deployment

## 🎯 **Success Metrics**

- Track user registration by source
- Monitor source performance over time
- Identify top-performing platforms
- Measure growth/decline of each source
- Make data-driven decisions on platform focus

---

**Note**: This is a simple, focused implementation that gives you exactly what you need - visibility into which platforms your users come from, with a clean admin interface to view the data.
