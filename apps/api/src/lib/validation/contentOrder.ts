import type { ContentOrderRequest } from "@tbe/types";
import { z } from "zod";

const idsSchema = z
  .array(z.string().min(1))
  .refine(
    (ids) => new Set(ids).size === ids.length,
    "Content IDs must be unique",
  );

export const contentOrderSchema: z.ZodType<ContentOrderRequest> = z
  .object({
    contentType: z.enum([
      "course-chapters",
      "interview-questions",
      "project-sections",
    ]),
    parentId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid parent ID"),
    previousIds: idsSchema,
    orderedIds: idsSchema,
  })
  .strict()
  .refine(({ previousIds, orderedIds }) => {
    const previous = new Set(previousIds);
    return (
      previousIds.length === orderedIds.length &&
      orderedIds.every((id) => previous.has(id))
    );
  }, "The new order must contain exactly the existing content IDs");

export const contentOrderValidationMessage = (error: z.ZodError): string =>
  error.issues[0]?.message || "Invalid content order";
