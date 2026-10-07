export const couponAdminPaths = {
  collection: "/admin/coupon",
  item: (couponId: string) => `/admin/coupon/${couponId}`,
  sheet: (couponId: string, sheetId: string) =>
    `/admin/coupon/${couponId}/sheets/${sheetId}`,
  bulkApply: (couponId: string) => `/admin/coupon/${couponId}/bulk-apply`,
} as const;
