import { isAxiosError } from "axios";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import { type ReactNode, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface ReorderableListProps<T> {
  items: T[];
  getId: (item: T) => string;
  getLabel: (item: T) => string;
  onReorder?: (order: {
    previousIds: string[];
    orderedIds: string[];
  }) => Promise<unknown>;
  renderItem: (item: T, index: number, controls: ReactNode) => ReactNode;
  disabled?: boolean;
}

export const ReorderableList = <T,>({
  items,
  getId,
  getLabel,
  onReorder,
  renderItem,
  disabled = false,
}: ReorderableListProps<T>) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const saving = useRef(false);
  const busy = disabled || isSaving;
  const ids = items.map(getId);
  const invalidIds = ids.some((id) => !id) || new Set(ids).size !== ids.length;
  const locked = busy || invalidIds;

  const move = async (id: string, targetId: string) => {
    if (!onReorder || locked || saving.current || id === targetId) return;
    const from = ids.indexOf(id);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;

    const orderedIds = [...ids];
    orderedIds.splice(from, 1);
    orderedIds.splice(to, 0, id);
    saving.current = true;
    setIsSaving(true);
    setDraggedId(null);
    setDropTarget(null);
    setAnnouncement("Saving order...");
    try {
      await onReorder({ previousIds: ids, orderedIds });
      const message = `${getLabel(items[from])} moved to position ${to + 1}.`;
      setAnnouncement(message);
      toast.success("Content order saved");
    } catch (error) {
      const message =
        (isAxiosError<{ message?: string }>(error) &&
          error.response?.data?.message) ||
        (error instanceof Error
          ? error.message
          : "Could not save content order");
      setAnnouncement(message);
      toast.error(message);
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
  };

  if (!onReorder) {
    return (
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={getId(item)}>{renderItem(item, index, null)}</div>
        ))}
      </div>
    );
  }

  return (
    <div aria-busy={isSaving}>
      <p className="mb-3 text-xs text-gray-500">
        Drag the handle or use the arrows to reorder. Changes save
        automatically.
      </p>
      {invalidIds && (
        <p role="alert" className="mb-3 text-sm text-red-600">
          Some content IDs are missing or duplicated. Refresh before reordering.
        </p>
      )}
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
      <fieldset disabled={busy} className="min-w-0 space-y-3">
        {items.map((item, index) => {
          const id = getId(item);
          const label = getLabel(item);
          const controls = (
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-grab active:cursor-grabbing"
                aria-label={`Drag ${label} to reorder`}
                title="Drag to reorder, or use the arrow buttons"
                draggable={!locked && items.length > 1}
                disabled={locked || items.length < 2}
                onDragStart={(event) => {
                  if (locked) {
                    event.preventDefault();
                    return;
                  }
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", id);
                  setDraggedId(id);
                }}
                onDragEnd={() => {
                  setDraggedId(null);
                  setDropTarget(null);
                }}
              >
                <GripVertical className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label={`Move ${label} up`}
                title="Move up"
                disabled={locked || index === 0}
                onClick={() => void move(id, ids[index - 1])}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label={`Move ${label} down`}
                title="Move down"
                disabled={locked || index === items.length - 1}
                onClick={() => void move(id, ids[index + 1])}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
          );
          return (
            <div
              key={id}
              className={
                dropTarget === id
                  ? "rounded-lg ring-2 ring-blue-400"
                  : undefined
              }
              onDragOver={(event) => {
                if (!locked && draggedId && draggedId !== id) {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  setDropTarget(id);
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                if (
                  draggedId &&
                  event.dataTransfer.getData("text/plain") === draggedId
                ) {
                  void move(draggedId, id);
                }
                setDraggedId(null);
                setDropTarget(null);
              }}
            >
              {renderItem(item, index, controls)}
            </div>
          );
        })}
      </fieldset>
    </div>
  );
};
