import { describe, expect, it } from "vitest";

import { couponAdminPaths } from "../../../../admin/src/api/couponPaths";

describe("couponAdminPaths", () => {
  describe("collection", () => {
    it("points at the admin coupon list/create route", () => {
      expect(couponAdminPaths.collection).toBe("/admin/coupon");
    });
  });

  describe("item", () => {
    it("builds the admin coupon item route", () => {
      expect(couponAdminPaths.item("abc123")).toBe("/admin/coupon/abc123");
    });
  });

  describe("sheet", () => {
    it("builds the admin coupon sheet route", () => {
      expect(couponAdminPaths.sheet("coupon-1", "sheet-9")).toBe(
        "/admin/coupon/coupon-1/sheets/sheet-9",
      );
    });
  });

  describe("bulkApply", () => {
    it("builds the admin bulk-apply route", () => {
      expect(couponAdminPaths.bulkApply("coupon-1")).toBe(
        "/admin/coupon/coupon-1/bulk-apply",
      );
    });
  });
});
