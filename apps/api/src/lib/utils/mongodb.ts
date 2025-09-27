import mongoose, { type Model } from "mongoose"

export interface DatabaseQueryResponseType {
    data?: any
    error?: string
}

let isConnected = false

/**
 * Connect to MongoDB database
 */
export const connectToDatabase = async (): Promise<void> => {
    if (isConnected) return

    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI

    if (!mongoUri) {
        throw new Error(
            "MONGODB_URI or MONGO_URI environment variable is required"
        )
    }

    try {
        await mongoose.connect(mongoUri)
        isConnected = true
        console.log("Connected to MongoDB")
    } catch (error) {
        console.error("MongoDB connection error:", error)
        throw error
    }
}

/**
 * Disconnect from MongoDB
 */
export const disconnectFromDatabase = async (): Promise<void> => {
    if (!isConnected) return

    await mongoose.disconnect()
    isConnected = false
    console.log("Disconnected from MongoDB")
}

/**
 * General utility to get total count of documents for any Mongoose model
 */
export const getTotalCountFromModel = async (
    model: Model<any>
): Promise<DatabaseQueryResponseType> => {
    try {
        const count = await model.countDocuments()
        return { data: count }
    } catch (error) {
        return { error: "Error while counting documents" }
    }
}

/**
 * General utility to get paginated documents for any Mongoose model
 */
export const getAllDocumentsFromModel = async (
    model: Model<any>,
    page = 1,
    limit = 100,
    populateOptions: any = null,
    sortOptions: Record<string, 1 | -1> = { createdAt: -1 }
): Promise<DatabaseQueryResponseType> => {
    try {
        const skip = (page - 1) * limit
        let query = model.find().skip(skip).limit(limit).sort(sortOptions)

        if (populateOptions) {
            query = query.populate(populateOptions)
        }

        const documents = await query.exec()
        return { data: documents }
    } catch (error) {
        return { error: "Error while fetching documents" }
    }
}

/**
 * Create a new ObjectId
 */
export const createObjectId = (id?: string): mongoose.Types.ObjectId => {
    return id ? new mongoose.Types.ObjectId(id) : new mongoose.Types.ObjectId()
}
