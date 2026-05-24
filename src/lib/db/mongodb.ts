import mongoose from "mongoose"

declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: typeof import("mongoose") | null
    promise: Promise<typeof import("mongoose")> | null
  }
}

const MONGODB_URI = process.env.MONGODB_URI

let cached = global.mongoose
let hasLoggedWarning = false

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    if (!hasLoggedWarning) {
      console.error("MongoDB not configured")
      hasLoggedWarning = true
    }
    return null
  }

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 10000,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}
