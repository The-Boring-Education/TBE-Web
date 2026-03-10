// Export all database functionality
export * from "./models";
export * from "./queries";

// Export MongoDB utilities from local utils
export {
  connectToDatabase,
  createObjectId,
  disconnectFromDatabase,
} from "@/lib/utils";
