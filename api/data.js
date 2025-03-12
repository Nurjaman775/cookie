import { MongoClient } from 'mongodb';
import path from 'path';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
}

let cachedClient = null;

async function connectToDatabase() {
    if (cachedClient) {
        return cachedClient;
    }
    const client = await MongoClient.connect(MONGODB_URI);
    cachedClient = client;
    return client;
}

// This is a serverless function example for Vercel/Next.js
export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const client = await connectToDatabase();
        const db = client.db(MONGODB_DB);
        const collection = db.collection('friends');

        if (req.method === 'GET') {
            const data = await collection.find({}).toArray();
            res.status(200).json(data);
        } else if (req.method === 'POST') {
            const data = req.body;
            if (!Array.isArray(data)) {
                throw new Error('Data harus berupa array');
            }
            await collection.deleteMany({}); // Clear existing data
            await collection.insertMany(data);
            res.status(200).json({ message: 'Data berhasil disimpan' });
        }
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server: ' + error.message });
    }
}
