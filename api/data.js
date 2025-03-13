import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;
const MONGODB_DB = "teman_kampus"; // Pastikan nama database sesuai dengan URI

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  try {
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });

    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

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
      console.log("Data retrieved from MongoDB:", data); // Tambahkan logging
      res.status(200).json(data);
    } else if (req.method === "POST") {
      const data = req.body;
      console.log("Data received for insertion:", data); // Tambahkan logging
      if (!Array.isArray(data)) {
        throw new Error("Data harus berupa array");
      }
      await collection.deleteMany({}); // Clear existing data
      await collection.insertMany(data);
      console.log("Data successfully inserted into MongoDB"); // Tambahkan logging
      res.status(200).json({ message: "Data berhasil disimpan" });
    }
  } catch (error) {
    console.error("Server error:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan server: " + error.message });
  }
}
