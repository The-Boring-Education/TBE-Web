import { type NextApiRequest, type NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';

import { apiStatusCodes } from '@tbe/constants';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { sendAPIResponse } from '@tbe/utils';

const ADMIN_EMAIL = 'theboringeducation@gmail.com';

export const withAdminAuth =
  (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const session = await getServerSession(req, res, authOptions);

      if (!session || !session.user) {
        return res.status(apiStatusCodes.UNAUTHORIZED).json(
          sendAPIResponse({
            success: false,
            status: apiStatusCodes.UNAUTHORIZED,
            error: true,
            message: 'Authentication required',
          })
        );
      }

      if (session.user.email !== ADMIN_EMAIL) {
        return res.status(apiStatusCodes.FORBIDDEN).json(
          sendAPIResponse({
            success: false,
            status: apiStatusCodes.FORBIDDEN,
            error: true,
            message: 'Admin access required',
          })
        );
      }

      return handler(req, res);
    } catch (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          success: false,
          status: apiStatusCodes.INTERNAL_SERVER_ERROR,
          error: true,
          message: 'Admin authentication error',
          data: error,
        })
      );
    }
  };
