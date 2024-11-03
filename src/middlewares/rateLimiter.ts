import { NextApiRequest, NextApiResponse } from 'next';

const rateLimitMap = new Map<
  string,
  { count: number; lastRequestTime: number }
>();

const REQUEST_LIMIT = 3; // Maximum requests
const WINDOW_SIZE_IN_MS = 60 * 1000; // 1 minute

// Rate limiter middleware function that wraps a handler
const rateLimiter = (
  handler: (req: NextApiRequest, res: NextApiResponse) => void
) => {
  return (req: NextApiRequest, res: NextApiResponse) => {
    const ip =
      req.headers['x-forwarded-for']?.toString() ||
      req.socket.remoteAddress ||
      'unknown';

    const currentTime = Date.now();

    const ipData = rateLimitMap.get(ip) || {
      count: 0,
      lastRequestTime: currentTime,
    };

    if (currentTime - ipData.lastRequestTime < WINDOW_SIZE_IN_MS) {
      if (ipData.count >= REQUEST_LIMIT) {
        res
          .status(429)
          .json({ message: 'Too many requests, please try again later.' });
        return;
      }

      ipData.count += 1;
    } else {
      ipData.count = 1;
      ipData.lastRequestTime = currentTime;
    }

    rateLimitMap.set(ip, ipData);

    // Calling the original handler
    handler(req, res);
  };
};

export default rateLimiter;
