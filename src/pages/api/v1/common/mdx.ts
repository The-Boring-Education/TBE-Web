import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/constant';
import { applyMultiOriginCorsHeaders, sendAPIResponse } from '@/utils';
import { getMDXContent } from '@/utils/mdx';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Apply CORS headers
  const isPreflight = applyMultiOriginCorsHeaders(req, res);
  if (isPreflight) return;

  switch (req.method) {
    case 'GET':
      return generateMDXContent(req, res);
    case 'POST':
      return generateBulkMDXContent(req, res);

    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Method ${req.method} Not Allowed`,
        })
      );
  }
};

const generateMDXContent = async (req: NextApiRequest, res: NextApiResponse) =>
  res.status(apiStatusCodes.OKAY).json(getMDXContent());

const generateBulkMDXContent = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { bulkMDPayload } = req.body;

  if (!bulkMDPayload) {
    return res.status(apiStatusCodes.BAD_REQUEST).json(
      sendAPIResponse({
        status: false,
        message: 'bulkMDPayload is required',
      })
    );
  }

  const mappedData = bulkMDPayload.map((item: any) => {
    const { name, path } = item;
    return {
      name,
      content: getMDXContent(path),
    };
  });

  return res.status(apiStatusCodes.OKAY).json(mappedData);
};

export default handler;
