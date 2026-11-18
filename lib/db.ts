import mongoose from "mongoose";

type ConnectionCache = { promise: Promise<typeof mongoose> | null };
const globalDB = globalThis as typeof globalThis & {
  __mongoose?: ConnectionCache;
};
const cache = (globalDB.__mongoose ??= { promise: null });

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured");
  if (!cache.promise) {
    cache.promise = mongoose
      .connect(uri, { bufferCommands: false, serverSelectionTimeoutMS: 8000 })
      .catch((error: unknown) => {
        cache.promise = null;
        throw error;
      });
  }
  return cache.promise;
}
