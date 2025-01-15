import { apiStatusCodes } from "@/constant";
import { NextApiRequest, NextApiResponse } from "next";
import { sendAPIResponse } from "@/utils";
import { connectDB } from "@/middlewares";
import { getPlaylistByIdFromDB } from "@/database";

const handler = async ( req:NextApiRequest, res:NextApiResponse ) => {
    await connectDB();

    const {query} = req;
    const {youfocusId} = query as {youfocusId:string};

    switch ( req.method ) { 
        case 'GET':
            return handleGetYoufocusById(req, res, youfocusId);
        default:
            return res.status(apiStatusCodes.BAD_REQUEST).json(
                sendAPIResponse({
                    status: false,
                    message: `Method ${req.method} Not Allowed`
                })
            );
         }
    };

const handleGetYoufocusById = async (
    req: NextApiRequest,
    res: NextApiResponse,
    playlistId: string
    ) => {
      if (!playlistId) {
        return res.status(apiStatusCodes.BAD_REQUEST).json(
          sendAPIResponse({
            status: false,
            message: 'Youfocus ID is required',
          })
        );
      }

      const { data, error } = await  getPlaylistByIdFromDB(playlistId);

      if (error) {
      console.log("Error", error);
        return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
          sendAPIResponse({
            status: false,
            message: 'Error fetching youfocus',
          })
        );
      }

      if (!data) {
        console.log("Playlist Id", playlistId);
        
        return res.status(apiStatusCodes.NOT_FOUND).json(
          sendAPIResponse({
            status: false,
            message: 'Youfocus not found',
          })
        );
      }

    console.log("Playlist data fetched successfully:", data);
      return res.status(apiStatusCodes.OKAY).json(
        sendAPIResponse({
          status: true,
          data,
        })
      );
    };

 export default handler;
      