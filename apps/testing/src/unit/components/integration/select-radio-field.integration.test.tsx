import { RadioInputField, SelectInput } from "@tbe/components";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

function RegionTierForm() {
  const [region, setRegion] = useState("IN");
  const [tier, setTier] = useState<"free" | "pro">("free");

  return (
    <div>
      <SelectInput
        className="w-40"
        list={["IN", "US", "EU"]}
        selectedItem={region}
        onChange={setRegion}
      />
      <RadioInputField
        label="Free"
        value="free"
        selected={tier === "free"}
        onChange={(v) => setTier(v as "free" | "pro")}
      />
      <RadioInputField
        label="Pro"
        value="pro"
        selected={tier === "pro"}
        onChange={(v) => setTier(v as "free" | "pro")}
      />
      <p data-testid="summary">{`${region}-${tier}`}</p>
    </div>
  );
}

describe("SelectInput + RadioInputField integration", () => {
  it("keeps select and custom radios in sync for a small form", async () => {
    const user = userEvent.setup();
    render(<RegionTierForm />);

    expect(screen.getByTestId("summary")).toHaveTextContent("IN-free");

    await user.click(screen.getByRole("button", { name: /in/i }));
    await user.click(await screen.findByRole("option", { name: "US" }));
    expect(screen.getByTestId("summary")).toHaveTextContent("US-free");

    fireEvent.click(screen.getByText("Pro"));
    expect(screen.getByTestId("summary")).toHaveTextContent("US-pro");
    expect(
      screen.getByRole("img", { name: "developer activities" }),
    ).toBeInTheDocument();
  });
});
