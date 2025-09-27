// Conditional imports to avoid issues when Next.js is not available
let NextApiRequest: any
let NextApiResponse: any

try {
    const next = require("next")
    NextApiRequest = next.NextApiRequest
    NextApiResponse = next.NextApiResponse
} catch (error) {
    NextApiRequest = class {}
    NextApiResponse = class {}
}

export default function initMiddleware(middleware: any) {
    return (req: typeof NextApiRequest, res: typeof NextApiResponse) =>
        new Promise((resolve, reject) => {
            middleware(req, res, (result: any) => {
                if (result instanceof Error) return reject(result)
                return resolve(result)
            })
        })
}
