import { createRouter } from 'next-connect';
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/database';

const router = createRouter<NextApiRequest, NextApiResponse>();

const routerHandler = router.handler({
  onError: (err: any, req, res) => {
    res.status(500).json({ err: err.message });
  },
});

// Connect to DB
const connectDB = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) => {
  await connectToDatabase();
  next();
};

export { router, routerHandler, connectDB };
