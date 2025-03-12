import { MongoClient } from "mongodb";
import path from "path";

const MONGODB_URI =
  "mongodb+srv://Tevxion:Zerxen1122@tevxion.ulfcw.mongodb.net/teman_kampus?retryWrites=true&w=majority";
const MONGODB_DB = "friends_db";

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI environment variable");
}

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  try {
    const client = await MongoClient.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverApi: {
        version: "1",
        strict: true,
        deprecationErrors: true,
      },
    });

    console.log("Connected to MongoDB successfully");
    cachedClient = client;
    return client;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

// This is a serverless function example for Vercel/Next.js
export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const client = await connectToDatabase();
    const db = client.db(MONGODB_DB);
    const collection = db.collection("friends");

    if (req.method === "GET") {
      const data = await collection.find({}).toArray();
      res.status(200).json(data);
    } else if (req.method === "POST") {
      const data = req.body;
      if (!Array.isArray(data)) {
        throw new Error("Data harus berupa array");
      }
      await collection.deleteMany({}); // Clear existing data
      await collection.insertMany(data);
      res.status(200).json({ message: "Data berhasil disimpan" });
    }
  } catch (error) {
    console.error("Server error:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan server: " + error.message });
  }
}
