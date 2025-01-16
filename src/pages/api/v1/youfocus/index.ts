import { apiStatusCodes } from "@/constant";
import { NextApiRequest, NextApiResponse } from "next";
import { sendAPIResponse } from "@/utils";
import { connectDB } from "@/middlewares";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();

  switch (req.method) {
    case 'POST' : 
    return handleAddPlaylist(req, res);
    default:
        return res.status(apiStatusCodes.BAD_REQUEST).json(
          sendAPIResponse({
            status: false,
            message: `Method ${req.method} Not Allowed`,
          })
        );
    }
};

const handleAddPlaylist = async (req: NextApiRequest, res: NextApiResponse) => {
}