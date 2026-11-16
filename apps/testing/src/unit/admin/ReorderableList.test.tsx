import { ReorderableList } from "@admin/components/ReorderableList";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type { ButtonHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/ui/button", () => ({
  Button: ({
    variant: _variant,
    size: _size,
    ...props
  }: ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: string;
    size?: string;
  }) => <button {...props} />,
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const items = [
  { id: "one", name: "First" },
  { id: "two", name: "Second" },
  { id: "three", name: "Third" },
];

const renderList = (
  onReorder = vi.fn().mockResolvedValue(undefined),
  list = items,
) =>
  render(
    <ReorderableList
      items={list}
      getId={(item) => item.id}
      getLabel={(item) => item.name}
      onReorder={onReorder}
      renderItem={(item, index, controls) => (
        <article>
          <h3>
            {index + 1}. {item.name}
          </h3>
          {controls}
          <button>Edit {item.name}</button>
        </article>
      )}
    />,
  );

describe("Admin content reordering", () => {
  beforeEach(() => vi.clearAllMocks());

  it("disables boundary arrows and saves the full ordered ID list", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    renderList(save);

    expect(
      screen.getByRole("button", { name: "Move First up" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Move Third down" }),
    ).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Move First down" }));

    await waitFor(() =>
      expect(save).toHaveBeenCalledWith({
        previousIds: ["one", "two", "three"],
        orderedIds: ["two", "one", "three"],
      }),
    );
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "First moved to position 2.",
      ),
    );
  });

  it("supports moving the final item up", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    renderList(save);
    fireEvent.click(screen.getByRole("button", { name: "Move Third up" }));
    await waitFor(() =>
      expect(save).toHaveBeenCalledWith({
        previousIds: ["one", "two", "three"],
        orderedIds: ["one", "three", "two"],
      }),
    );
  });

  it("saves drag-and-drop from the grip handle, not the edit controls", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    renderList(save);
    const handle = screen.getByRole("button", {
      name: "Drag Third to reorder",
    });
    const dataTransfer = {
      effectAllowed: "",
      dropEffect: "",
      setData: vi.fn(),
      getData: vi.fn().mockReturnValue("three"),
    };
    const target = screen
      .getByRole("heading", { name: "1. First" })
      .closest("article")!;
    fireEvent.dragStart(handle, { dataTransfer });
    fireEvent.dragOver(target, { dataTransfer });
    fireEvent.drop(target, { dataTransfer });

    expect(dataTransfer.setData).toHaveBeenCalledWith("text/plain", "three");
    await waitFor(() =>
      expect(save).toHaveBeenCalledWith({
        previousIds: ["one", "two", "three"],
        orderedIds: ["three", "one", "two"],
      }),
    );
    expect(
      screen.getByRole("button", { name: "Edit First" }),
    ).not.toHaveAttribute("draggable");
  });

  it("does not save a cancelled drag or a drop onto the same item", () => {
    const save = vi.fn();
    renderList(save);
    const handle = screen.getByRole("button", {
      name: "Drag First to reorder",
    });
    const dataTransfer = {
      setData: vi.fn(),
      getData: vi.fn().mockReturnValue("one"),
    };
    fireEvent.dragStart(handle, { dataTransfer });
    fireEvent.drop(handle.closest("article")!, { dataTransfer });
    fireEvent.dragEnd(handle);
    expect(save).not.toHaveBeenCalled();
  });

  it("blocks repeated saves and edits until persistence completes", async () => {
    let finish!: () => void;
    const save = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    renderList(save);
    const down = screen.getByRole("button", { name: "Move First down" });
    fireEvent.click(down);
    fireEvent.click(down);
    expect(save).toHaveBeenCalledTimes(1);
    expect(down).toBeDisabled();
    expect(screen.getByRole("button", { name: "Edit First" })).toBeDisabled();
    await act(async () => finish());
    expect(down).not.toBeDisabled();
  });

  it("announces server errors and keeps the original order on failure", async () => {
    renderList(
      vi.fn().mockRejectedValue(new Error("Content changed. Refresh.")),
    );
    fireEvent.click(screen.getByRole("button", { name: "Move First down" }));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Content changed. Refresh.",
      ),
    );
    expect(
      screen.getAllByRole("heading").map((heading) => heading.textContent),
    ).toEqual(["1. First", "2. Second", "3. Third"]);
  });

  it("handles empty, single-item and invalid-ID lists without allowing moves", () => {
    const { unmount } = renderList(vi.fn(), []);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    unmount();
    const single = renderList(vi.fn(), [items[0]]);
    expect(
      screen.getByRole("button", { name: "Move First down" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Drag First to reorder" }),
    ).toBeDisabled();
    single.unmount();
    renderList(vi.fn(), [items[0], { id: "", name: "Missing ID" }]);
    expect(screen.getByRole("alert")).toHaveTextContent("IDs are missing");
    expect(
      screen.getByRole("button", { name: "Move First down" }),
    ).toBeDisabled();
  });
});
