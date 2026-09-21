import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EditProfileModal } from "../../../../../packages/components/src/profile/EditProfileModal";

vi.mock("@tbe/constants", async () => {
  const { COUNTRY_CODES, USER_ROLE_OPTIONS } = await import(
    "../../../../../packages/constants/src/global"
  );
  return { COUNTRY_CODES, USER_ROLE_OPTIONS };
});

vi.mock("@tbe/hooks", () => ({
  useUsername: () => ({
    message: "",
    isUsernameAvailable: true,
    isChecking: false,
  }),
}));

vi.mock("@tbe/utils", async () => {
  const { isPossibleMobileNumber, splitContactNumber } = await import(
    "../../../../../packages/utils/src/phoneNumber"
  );
  const { normalizeContactNoForForm } = await import(
    "../../../../../packages/utils/src/userProfileForm"
  );
  const { normalizeOptionalProfileUrl } = await import(
    "../../../../../packages/utils/src/profileUrl"
  );
  return {
    cn: (...values: unknown[]) =>
      values.filter((value) => typeof value === "string").join(" "),
    isPossibleMobileNumber,
    splitContactNumber,
    normalizeContactNoForForm,
    normalizeOptionalProfileUrl,
  };
});

const renderProfile = (contactNo: string) => {
  const onSave = vi.fn().mockResolvedValue(undefined);
  render(
    <EditProfileModal
      isOpen
      currentUser={{ name: "Phone Tester", userName: "phone-tester", contactNo }}
      onSave={onSave}
      onClose={vi.fn()}
    />,
  );
  return {
    onSave,
    phone: screen.getByPlaceholderText("9876543210"),
    save: screen.getByRole("button", { name: "Save Profile" }),
    country: screen.getByRole("combobox"),
  };
};

describe("profile international phone regression", () => {
  it.each([
    ["+86 13800138000", "+86", "13800138000"],
    ["+4915123456789", "+49", "15123456789"],
    ["+447700900123", "+44", "7700900123"],
    ["+44 07700 900123", "+44", "07700900123"],
    ["+12025550123", "+1", "2025550123"],
    ["+47 41234567", "+47", "41234567"],
    ["+3197012345678", "+31", "97012345678"],
    ["+91 09876543210", "+91", "09876543210"],
  ])("saves %s without losing digits", async (contact, code, number) => {
    const { onSave, save, country } = renderProfile(contact);
    expect(country).toHaveValue(code);
    expect(save).toBeEnabled();
    fireEvent.click(save);
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ contactNo: `${code} ${number}` }),
      ),
    );
  });

  it("preserves a pasted long number and revalidates when country changes", async () => {
    const { onSave, phone, country, save } = renderProfile("+91");
    expect(phone).not.toHaveAttribute("maxlength");
    fireEvent.change(phone, { target: { value: "138 0013-8000" } });
    expect(phone).toHaveValue("13800138000");
    expect(save).toBeDisabled();
    fireEvent.change(country, { target: { value: "+86" } });
    expect(phone).toHaveValue("13800138000");
    expect(save).toBeEnabled();
    fireEvent.change(country, { target: { value: "+91" } });
    expect(phone).toHaveValue("13800138000");
    expect(save).toBeDisabled();
    fireEvent.change(country, { target: { value: "+86" } });
    fireEvent.click(save);
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ contactNo: "+86 13800138000" }),
      ),
    );
  });

  it("leaves overlong input visible and blocks saving rather than truncating", () => {
    const { onSave, phone, save } = renderProfile("+86");
    fireEvent.change(phone, { target: { value: "1380013800012345" } });
    expect(phone).toHaveValue("1380013800012345");
    expect(save).toBeDisabled();
    fireEvent.click(save);
    expect(onSave).not.toHaveBeenCalled();
  });

  it.each([
    "+999 1234567890",
    "+44 abc7700900123",
    "+44 ---",
    "+86 138001380001",
  ])("does not treat invalid stored contact %s as optional", (contact) => {
    const { onSave, save } = renderProfile(contact);
    expect(save).toBeDisabled();
    fireEvent.click(save);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("keeps the profile phone optional", async () => {
    const { onSave, save } = renderProfile("+91");
    expect(save).toBeEnabled();
    fireEvent.click(save);
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ contactNo: "+91" }),
      ),
    );
  });
});
