import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next"

import { logger } from "@/lib/utils/logger"

/**
 * HOF that wraps an API handler to log incoming requests and response timing.
 *
 * Usage:
 *   export default withRequestLogger(handler)
 */
const withRequestLogger = (handler: NextApiHandler): NextApiHandler => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        const start = Date.now()
        const { method = "UNKNOWN", url = "/" } = req

        logger.debug(`→ ${method} ${url}`)

        const originalEnd = res.end.bind(res)

        res.end = function (...args: Parameters<typeof res.end>) {
            const duration = Date.now() - start
            logger.request(method, url, res.statusCode, duration)
            return originalEnd(...args)
        } as typeof res.end

        return handler(req, res)
    }
}

export { withRequestLogger }
