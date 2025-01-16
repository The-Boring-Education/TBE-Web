import { apiStatusCodes } from '@/constant';
import { NextApiRequest, NextApiResponse } from 'next';
import { sendAPIResponse } from '@/utils';
import { getMDXContent } from '@/utils/mdx';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'GET':
      return generateMDXContent(req, res);

    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        })
      );
  }
};

const generateMDXContent = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  return res.status(apiStatusCodes.OKAY).json(getMDXContent());
};

export default handler;
