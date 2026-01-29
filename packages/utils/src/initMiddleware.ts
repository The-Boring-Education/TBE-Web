// Conditional imports to avoid issues when Next.js is not available
/* eslint-disable @typescript-eslint/no-require-imports */
let _NextApiRequestType: any;
let _NextApiResponseType: any;

try {
  const next = require("next");
  _NextApiRequestType = next.NextApiRequest;
  _NextApiResponseType = next.NextApiResponse;
} catch {
  // Next.js not available, define fallback types
  _NextApiRequestType = class {};
  _NextApiResponseType = class {};
}
/* eslint-enable @typescript-eslint/no-require-imports */

// Export types for use in function signatures
type NextApiRequest = typeof _NextApiRequestType;
type NextApiResponse = typeof _NextApiResponseType;

export default function initMiddleware(middleware: any) {
  return (req: NextApiRequest, res: NextApiResponse) =>
    new Promise((resolve, reject) => {
      middleware(req, res, (result: any) => {
        if (result instanceof Error) return reject(result);
        return resolve(result);
      });
    });
}
