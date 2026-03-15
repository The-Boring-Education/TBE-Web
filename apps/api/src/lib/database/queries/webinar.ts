import type {
  AddWebinarRequestPayloadProps,
  UpdateEnrolledUsersRequestPayloadProps,
} from "@/lib/interfaces";
import { isProgramActive } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";

import { Webinar } from "../models";

// Add A Webinar
const addAWebinarToDB = async (
  webinarPayload: AddWebinarRequestPayloadProps,
) => {
  try {
    const newWebinar = new Webinar(webinarPayload);
    const savedWebinar = await newWebinar.save();
    return { data: savedWebinar };
  } catch (error) {
    logger.error("DB: addAWebinarToDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to add webinar to database", details: error };
  }
};

const getAllWebinarsFromDB = async () => {
  try {
    const webinars = await Webinar.find();
    if (!webinars) {
      return { error: "No webinars found" };
    }

    const updatedWebinars = webinars.map((webinar) => {
      const isCompleted = isProgramActive(webinar.dateAndTime);
      return { ...webinar.toObject(), isCompleted };
    });

    return { data: updatedWebinars };
  } catch (error) {
    logger.error("DB: getAllWebinarsFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to fetch webinars from database", details: error };
  }
};

const updateWebinarInDB = async (
  slug: string,
  updatedWebinar: UpdateEnrolledUsersRequestPayloadProps,
) => {
  try {
    const { users, ...otherUpdates } = updatedWebinar;

    const updatedWebinarData = await Webinar.findOneAndUpdate(
      { slug },
      { $set: otherUpdates },
      { new: true },
    );

    if (!updatedWebinarData) {
      return { error: "Webinar not found" };
    }

    // Push users into enrolledUsersList without duplicates
    if (users && users.length > 0) {
      await Webinar.updateOne(
        { slug },
        {
          $addToSet: {
            enrolledUsersList: { $each: users },
          },
        },
      );
    }

    // Fetch the updated webinar data
    const finalUpdatedWebinar = await Webinar.findOne({ slug });

    return { data: finalUpdatedWebinar };
  } catch (error) {
    logger.error("DB: updateWebinarInDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to update webinar in database", details: error };
  }
};

const checkUserRegistrationInWebinarDB = async (
  slug: string,
  email: string,
) => {
  try {
    const webinar = await Webinar.findOne({ slug });

    if (!webinar) {
      return { data: false, error: "Webinar not found" };
    }

    const isRegistered = webinar.enrolledUsersList.some(
      (user: { email: string }) => user.email === email,
    );

    return { data: isRegistered };
  } catch (error) {
    logger.error("DB: checkUserRegistrationInWebinarDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      error: "Failed to check user registration in webinar",
      details: error,
    };
  }
};

const getWebinarDetailsFromDB = async (slug: string) => {
  try {
    const webinarDetails = await Webinar.findOne({ slug }).select(
      "-enrolledUsersList",
    );

    if (!webinarDetails) {
      return {
        error: "Webinar not found",
      };
    }

    return {
      data: webinarDetails,
    };
  } catch (error) {
    logger.error("DB: getWebinarDetailsFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      error: "Failed to fetch webinar details from the database",
      details: error,
    };
  }
};

const getWebinarBySlugFromDB = async (slug: string) => {
  try {
    const webinar = await Webinar.findOne({ slug });
    if (!webinar) {
      return { error: "Webinar not found" };
    }

    return { data: webinar };
  } catch (error) {
    logger.error("DB: getWebinarBySlugFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      error: "Failed to fetch webinar by slug from database",
      details: error,
    };
  }
};

const deleteAWebinarFromDB = async (slug: string) => {
  try {
    const webinar = await Webinar.findOne({}).where("slug").equals(slug);
    if (!webinar) {
      return { error: "Webinar not found" };
    }

    await webinar.deleteOne();

    return {};
  } catch (error) {
    logger.error("DB: deleteAWebinarFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to delete webinar from database", details: error };
  }
};

export {
  addAWebinarToDB,
  checkUserRegistrationInWebinarDB,
  deleteAWebinarFromDB,
  getAllWebinarsFromDB,
  getWebinarBySlugFromDB,
  getWebinarDetailsFromDB,
  updateWebinarInDB,
};
