import { SelectInput } from "@tbe/components";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

describe("SelectInput", () => {
  it("shows placeholder when no item is selected", () => {
    render(
      <SelectInput
        list={["Alpha", "Beta"]}
        selectedItem=""
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /select/i })).toBeInTheDocument();
  });

  it("displays the selected item on the trigger", () => {
    render(
      <SelectInput
        list={["Alpha", "Beta"]}
        selectedItem="Beta"
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /beta/i })).toBeInTheDocument();
  });

  it("calls onChange when choosing a different option", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SelectInput
        list={["Alpha", "Beta"]}
        selectedItem="Alpha"
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: /alpha/i }));
    await user.click(await screen.findByRole("option", { name: "Beta" }));
    expect(onChange).toHaveBeenCalledWith("Beta");
  });
});
