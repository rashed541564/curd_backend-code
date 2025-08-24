// config/db.js
const { MongoClient, ServerApiVersion } = require("mongodb");

// Replace <db_password> with your Atlas password
const uri =
  "mongodb+srv://mtei_db_473162:MteiDb473163@cluster0.65nkhex.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

async function connectDB() {
  try {
    if (!db) {
      await client.connect();
      db = client.db("userDB"); // use/create database called "userDB"
      console.log("✅ MongoDB Connected to Atlas Cluster");
    }
    return db;
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
