import type {
  AddNotificationRequestPayloadProps,
  UpdateNotificationRequestPayloadProps,
} from "@/lib/interfaces";
import { logger } from "@/lib/utils/logger";

import { Notification } from "../models";

const addANotificationToDB = async (
  notificationPayload: AddNotificationRequestPayloadProps,
) => {
  try {
    const notification = new Notification(notificationPayload);
    await notification.save();
    return { data: notification };
  } catch (error) {
    logger.error("DB: addANotificationToDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to add notification", details: error };
  }
};

const getAllNotificationsFromDB = async () => {
  try {
    const notifications = await Notification.find();

    return { data: notifications };
  } catch (error) {
    logger.error("DB: getAllNotificationsFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to fetch notifications", details: error };
  }
};

const updateANotificationInDB = async (
  payload: UpdateNotificationRequestPayloadProps,
) => {
  try {
    const { notificationId, ...updatedNotification } = payload;

    const updatedNotificationData = await Notification.findOneAndUpdate(
      { _id: notificationId },
      { $set: updatedNotification },
      { new: true },
    );

    return { data: updatedNotificationData };
  } catch (error) {
    logger.error("DB: updateANotificationInDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to update notification", details: error };
  }
};

const deleteANotificationsFromDB = async (notificationId: string) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
    });

    if (!notification) {
      return { error: "Notification not found" };
    }

    return { data: notification };
  } catch (error) {
    logger.error("DB: deleteANotificationsFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to delete notification", details: error };
  }
};

export {
  addANotificationToDB,
  deleteANotificationsFromDB,
  getAllNotificationsFromDB,
  updateANotificationInDB,
};
