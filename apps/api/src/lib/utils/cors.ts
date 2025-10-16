import Cors from "cors"

import initMiddleware from "./initMiddleware"

export const cors = initMiddleware(
    Cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        credentials: false,
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "x-admin-secret",
            "cache"
        ]
    })
)
