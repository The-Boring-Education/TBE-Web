import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/constant';
import { createUserInDB, getUserByEmailFromDB } from '@/database/query/user';
import { connectDB } from '@/middlewares';
import { sendAPIResponse } from '@/utils';
import { supabase } from '@/utils/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { access_token } = req.query;

    if (!access_token || typeof access_token !== 'string') {
      return res.status(400).json({ status: false, message: 'Missing access_token' });
    }

    await connectDB();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(access_token);

    if (error || !user || !user.email) {
      return res.status(401).json({ status: false, message: 'Unauthorized or missing user email', error });
    }

    const { email, user_metadata } = user;
    const { name = '', picture = '' } = user_metadata || {};

    const { data: existingUser } = await getUserByEmailFromDB(email);

    if (!existingUser) {
      await createUserInDB({
        name,
        email,
        image: picture,
        provider: 'google',
        providerAccountId: user.id,
      });
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: 'User Authenticated via Supabase',
        data: user,
      })
    );
  } catch (err: any) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Internal Server Error',
        error: err.message,
      })
    );
  }
}
