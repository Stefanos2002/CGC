import { MongoClient, MongoClientOptions } from "mongodb";

const URI = process.env.MONGODB_URI as string;

if (!URI) throw new Error("Please add your Mongo URI to .env.local file");

const options: MongoClientOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  maxIdleTimeMS: 270000, // 4.5 min — drops idle connections before Atlas's ~5 min timeout
};

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // Reuse connection across hot reloads in dev
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(URI, options).connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production serverless, each module load gets a fresh client
  clientPromise = new MongoClient(URI, options).connect();
}

export default clientPromise;
