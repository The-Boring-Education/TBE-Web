import { Notification } from '@/database';

import type {
  AddNotificationRequestPayloadProps,
  UpdateNotificationRequestPayloadProps,
} from '@/interfaces';

const addANotificationToDB = async (
  notificationPayload: AddNotificationRequestPayloadProps
) => {
  try {
    const notification = new Notification(notificationPayload);
    await notification.save();
    return { data: notification };
  } catch (error) {
    return { error };
  }
};

const getAllNotificationsFromDB = async () => {
  try {
    const notifications = await Notification.find();

    return { data: notifications };
  } catch (error) {
    return { error };
  }
};

const updateANotificationInDB = async (
  payload: UpdateNotificationRequestPayloadProps
) => {
  try {
    const { notificationId, ...updatedNotification } = payload;

    const updatedNotificationData = await Notification.findOneAndUpdate(
      { _id: notificationId },
      { $set: updatedNotification },
      { new: true }
    );

    return { data: updatedNotificationData };
  } catch (error) {
    return { error };
  }
};

const deleteANotificationsFromDB = async (notificationId: string) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
    });

    if (!notification) {
      return { error: 'Notification not found' };
    }

    return { data: notification };
  } catch (error) {
    return { error };
  }
};

export {
  addANotificationToDB,
  deleteANotificationsFromDB,
  getAllNotificationsFromDB,
  updateANotificationInDB,
};
