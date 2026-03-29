import { InputFieldContainer, RadioButton } from "@tbe/components";
import { fireEvent, render, screen } from "@testing-library/react";
import type { FormEvent } from "react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

function MiniProfileForm() {
  const [name, setName] = useState("");
  const [role, setRole] = useState<"student" | "pro">("student");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <InputFieldContainer
        label="Display name"
        type="text"
        value={name}
        onChange={setName}
      />
      <fieldset>
        <legend>Role</legend>
        <RadioButton
          label="Student"
          value="student"
          isSelected={role === "student"}
          onClick={() => setRole("student")}
        />
        <RadioButton
          label="Professional"
          value="pro"
          isSelected={role === "pro"}
          onClick={() => setRole("pro")}
        />
      </fieldset>
    </form>
  );
}

describe("Form fields integration (InputFieldContainer + RadioButton)", () => {
  it("keeps text and radio selection in sync through user input", () => {
    render(<MiniProfileForm />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Ada" } });
    expect(input).toHaveValue("Ada");

    expect(screen.getByRole("radio", { name: "Student" })).toBeChecked();
    fireEvent.click(screen.getByRole("radio", { name: "Professional" }));
    expect(screen.getByRole("radio", { name: "Professional" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Student" })).not.toBeChecked();
  });

  it("submits without throwing when fields are filled", () => {
    const onSubmit = vi.fn((e: FormEvent) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <InputFieldContainer
          label="Email"
          type="email"
          value="u@t.be"
          onChange={() => {}}
        />
        <RadioButton label="Yes" value="y" isSelected onClick={() => {}} />
        <button type="submit">Save</button>
      </form>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onSubmit).toHaveBeenCalled();
  });
});
