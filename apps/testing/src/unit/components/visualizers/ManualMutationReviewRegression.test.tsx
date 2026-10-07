import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ArrayBasicsVisualizer from "../../../../../../packages/components/src/visualizers/ArrayBasicsVisualizer";
import LinkedListBasicsVisualizer from "../../../../../../packages/components/src/visualizers/LinkedListBasicsVisualizer";
import StackOperationsVisualizer from "../../../../../../packages/components/src/visualizers/StackOperationsVisualizer";
import StringBasicsVisualizer from "../../../../../../packages/components/src/visualizers/StringBasicsVisualizer";

const click = (name: string) =>
  fireEvent.click(screen.getByRole("button", { name }));

const values = (container: HTMLElement) =>
  Array.from(
    container.querySelectorAll("div.tabular-nums"),
    (cell) => cell.textContent,
  );

const advance = (ms = 1000) => {
  act(() => vi.advanceTimersByTime(ms));
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("ArrayBasicsVisualizer immediate mutation regressions", () => {
  it("deletes before a rapid insert and logs the original shift count", () => {
    const { container } = render(<ArrayBasicsVisualizer />);

    click("Delete");
    expect(values(container)).toEqual(["12", "27", "41", "58"]);
    fireEvent.change(screen.getByLabelText("index"), {
      target: { value: "0" },
    });
    click("Insert");
    advance();

    expect(values(container)).toEqual(["99", "12", "27", "41", "58"]);
    expect(
      screen.getByText("Delete at index 2 — shifted 2 element(s) left"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Insert 99 at index 0 — shifted 4 element(s) right"),
    ).toBeInTheDocument();
  });

  it("handles repeated deletion, access, and newly invalid indices immediately", () => {
    const { container } = render(<ArrayBasicsVisualizer />);

    click("Delete");
    click("Access");
    expect(screen.getByText("arr[2] = 41 (O(1) access)")).toBeInTheDocument();
    click("Delete");
    click("Delete");
    click("Delete");
    advance();

    expect(values(container)).toEqual(["12", "27"]);
    for (const shifted of [2, 1, 0]) {
      expect(
        screen.getByText(
          `Delete at index 2 — shifted ${shifted} element(s) left`,
        ),
      ).toBeInTheDocument();
    }
    expect(screen.getByText("Invalid index")).toBeInTheDocument();
  });

  it("does not mutate or append stale logs after reset", () => {
    const { container } = render(<ArrayBasicsVisualizer />);

    click("Delete");
    click("Reset");
    advance();

    expect(values(container)).toEqual(["12", "27", "33", "41", "58"]);
    expect(screen.getByText("Reset to default array")).toBeInTheDocument();
    expect(screen.queryByText(/^Delete at index/)).not.toBeInTheDocument();
    expect(screen.getByText("33")).toHaveStyle({ background: "#374151" });
    expect(vi.getTimerCount()).toBe(0);
  });

  it("keeps a newer highlight until its own timeout expires", () => {
    render(<ArrayBasicsVisualizer />);

    click("Access");
    advance(500);
    fireEvent.change(screen.getByLabelText("index"), {
      target: { value: "1" },
    });
    click("Access");
    advance(200);
    expect(screen.getByText("27")).toHaveStyle({ background: "#fbbf24" });
    advance(500);
    expect(screen.getByText("27")).toHaveStyle({ background: "#374151" });
  });
});

describe("LinkedListBasicsVisualizer immediate mutation regressions", () => {
  it("deletes the original head before a rapid head insertion", () => {
    const { container } = render(<LinkedListBasicsVisualizer />);

    click("Delete Head");
    expect(values(container)).toEqual(["20", "30"]);
    click("Insert Head");
    advance();

    expect(values(container)).toEqual(["42", "20", "30"]);
    expect(
      screen.getByText("Delete head (10) → head = head.next"),
    ).toBeInTheDocument();
  });

  it("logs each actual head during rapid deletions and handles an empty list", () => {
    const { container } = render(<LinkedListBasicsVisualizer />);

    for (let i = 0; i < 4; i += 1) click("Delete Head");
    advance();

    expect(values(container)).toEqual([]);
    for (const value of [10, 20, 30]) {
      expect(
        screen.getByText(`Delete head (${value}) → head = head.next`),
      ).toBeInTheDocument();
    }
    expect(screen.getByText("List is empty")).toBeInTheDocument();
  });

  it("can reverse and insert at the tail immediately after deletion", () => {
    const { container } = render(<LinkedListBasicsVisualizer />);

    click("Delete Head");
    click("Reverse");
    click("Insert Tail");
    advance();

    expect(values(container)).toEqual(["30", "20", "42"]);
  });

  it("does not delete a reset head or restore stale logs/highlights", () => {
    const { container } = render(<LinkedListBasicsVisualizer />);

    click("Delete Head");
    click("Reset");
    advance();

    expect(values(container)).toEqual(["10", "20", "30"]);
    expect(screen.queryByText(/^Delete head/)).not.toBeInTheDocument();
    expect(screen.getByText("10")).toHaveStyle({ background: "#1f2937" });
    expect(vi.getTimerCount()).toBe(0);
  });

  it("does not let an older insertion clear a newer highlight", () => {
    render(<LinkedListBasicsVisualizer />);

    click("Insert Head");
    advance(500);
    fireEvent.change(screen.getByLabelText("value"), {
      target: { value: "99" },
    });
    click("Insert Tail");
    advance(300);
    expect(screen.getByText("99")).toHaveStyle({ background: "#10b981" });
    advance(500);
    expect(screen.getByText("99")).toHaveStyle({ background: "#1f2937" });
  });
});

describe("StackOperationsVisualizer immediate mutation regressions", () => {
  it("pops before the next push without removing the newly pushed value", () => {
    const { container } = render(<StackOperationsVisualizer />);

    click("Push");
    click("Pop");
    expect(values(container)).toEqual([]);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "B" } });
    click("Push");
    advance();

    expect(values(container)).toEqual(["B"]);
    expect(screen.getByText('pop() → "A"')).toBeInTheDocument();
    expect(screen.getByText('push("B") — size 1')).toBeInTheDocument();
    expect(screen.getByText("Stack size: 1")).toBeInTheDocument();
  });

  it("logs the correct LIFO values on rapid pops, then reports underflow", () => {
    const { container } = render(<StackOperationsVisualizer />);

    click("Push");
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "B" } });
    click("Push");
    click("Pop");
    click("Pop");
    click("Pop");
    advance();

    expect(values(container)).toEqual([]);
    expect(screen.getByText('pop() → "B"')).toBeInTheDocument();
    expect(screen.getByText('pop() → "A"')).toBeInTheDocument();
    expect(screen.getByText("Stack is empty — cannot pop")).toBeInTheDocument();
  });

  it("does not let a prior pop affect values pushed after clear", () => {
    const { container } = render(<StackOperationsVisualizer />);

    click("Push");
    click("Pop");
    click("Clear");
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "B" } });
    click("Push");
    advance();

    expect(values(container)).toEqual(["B"]);
    expect(screen.getAllByText('pop() → "A"')).toHaveLength(1);
    expect(screen.getByText('push("B") — size 1')).toBeInTheDocument();
  });

  it("preserves the current push highlight rather than expiring an older one", () => {
    render(<StackOperationsVisualizer />);

    click("Push");
    advance(300);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "B" } });
    click("Push");
    advance(200);
    expect(screen.getByText("B")).toHaveStyle({ background: "#fbbf24" });
    advance(300);
    expect(screen.getByText("B")).toHaveStyle({ background: "#374151" });
  });

  it("keeps manual operations settled across a mode switch", () => {
    const { container } = render(<StackOperationsVisualizer />);

    click("Push");
    click("Pop");
    click("Balanced Parens");
    advance();
    click("Push / Pop");

    expect(values(container)).toEqual([]);
    expect(screen.getAllByText('pop() → "A"')).toHaveLength(1);
  });
});

describe("manual visualizer timer cleanup", () => {
  it.each([
    ["array", ArrayBasicsVisualizer, "Insert", "Reset"],
    ["linked list", LinkedListBasicsVisualizer, "Insert Head", "Reset"],
    ["stack", StackOperationsVisualizer, "Push", "Clear"],
  ] as const)(
    "cancels %s highlights on reset and unmount in StrictMode",
    (_, Component, insert, reset) => {
      const { unmount } = render(
        <StrictMode>
          <Component />
        </StrictMode>,
      );

      click(insert);
      expect(vi.getTimerCount()).toBe(1);
      click(reset);
      expect(vi.getTimerCount()).toBe(0);
      click(insert);
      expect(vi.getTimerCount()).toBe(1);
      unmount();
      expect(vi.getTimerCount()).toBe(0);
      advance();
    },
  );
});

describe("StringBasicsVisualizer normalization regressions", () => {
  it.each(["!!!, ...?", "é你好🙂", " \t ", ""])(
    "renders no original character cells when %j normalizes to empty",
    (input) => {
      const { container } = render(<StringBasicsVisualizer />);

      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: input },
      });
      click("Load");

      expect(container.querySelectorAll("div.font-bold")).toHaveLength(0);
      expect(
        screen.getByText("Empty string — trivially a palindrome"),
      ).toBeInTheDocument();
      expect(screen.queryByText("L=R")).not.toBeInTheDocument();
      advance();
      expect(container.querySelectorAll("div.font-bold")).toHaveLength(0);
    },
  );

  it("renders the same normalized ASCII characters used by the algorithm", () => {
    const { container } = render(<StringBasicsVisualizer />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "ÉA,1!a你🙂" },
    });
    click("Load");

    expect(
      Array.from(
        container.querySelectorAll("div.font-bold"),
        (cell) => cell.textContent,
      ),
    ).toEqual(["a", "1", "a"]);
    expect(screen.getByText("Start — L=0, R=2")).toBeInTheDocument();
  });
});
