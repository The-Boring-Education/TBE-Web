import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { apiStatusCodes } from "@/lib/constants";
import { DevRelLead, User } from "@/lib/database";
import { sendAPIResponse } from "@/lib/utils";
import { connectDB } from "@/middleware/api";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();

    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
      return res.status(apiStatusCodes.UNAUTHORIZED).json(
        sendAPIResponse({
          status: false,
          message: "Authentication required",
        }),
      );
    }

    // Check if user is DevRel Advocate
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.occupation !== "DEVREL_ADVOCATE") {
      return res.status(apiStatusCodes.FORBIDDEN).json(
        sendAPIResponse({
          status: false,
          message:
            "Access denied. Only DevRel Advocates can access this endpoint.",
        }),
      );
    }

    if (req.method === "GET") {
      return handleGetApplications(req, res);
    } else if (req.method === "PUT") {
      return handleUpdateApplication(req, res, user._id.toString());
    } else {
      return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
        sendAPIResponse({
          status: false,
          message: "Method not allowed",
        }),
      );
    }
  } catch (error) {
    console.error("Error in DevRel applications API:", error);
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        error: true,
        message: "Internal server error",
      }),
    );
  }
};

const handleGetApplications = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const { status } = req.query;

  try {
    let applications;

    if (status && typeof status === "string") {
      // Get applications by status
      applications = await DevRelLead.findByStatus(status)
        .populate("reviewedBy", "name email")
        .populate("approvedBy", "name email")
        .sort({ createdAt: -1 });
    } else {
      // Get all applications
      applications = await DevRelLead.find({})
        .populate("reviewedBy", "name email")
        .populate("approvedBy", "name email")
        .sort({ createdAt: -1 });
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data: applications,
        message: "Applications fetched successfully",
      }),
    );
  } catch (error) {
    console.error("Error fetching applications:", error);
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        error: true,
        message: "Failed to fetch applications",
      }),
    );
  }
};

const handleUpdateApplication = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
) => {
  const { applicationId, status, notes, interviewDate, interviewLink } =
    req.body;

  if (!applicationId || !status) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: "Application ID and status are required",
      }),
    );
  }

  try {
    const application = await DevRelLead.findById(applicationId);

    if (!application) {
      return res.status(apiStatusCodes.NOT_FOUND).json(
        sendAPIResponse({
          status: false,
          message: "Application not found",
        }),
      );
    }

    // Update application status
    await application.updateStatus(status, userId);

    // Update additional fields if provided
    if (notes) {
      application.rejectionReason = notes;
    }

    if (status === "interview_scheduled" && interviewDate && interviewLink) {
      application.interviewData = {
        scheduledAt: new Date(interviewDate),
        meetingLink: interviewLink,
        interviewerEmail: "", // Will be populated from session
      };
    }

    await application.save();

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        data: application,
        message: "Application status updated successfully",
      }),
    );
  } catch (error) {
    console.error("Error updating application:", error);
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        error,
        message: "Failed to update application status",
      }),
    );
  }
};

export default handler;
