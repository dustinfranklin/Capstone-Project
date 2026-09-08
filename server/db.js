const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGODB_URI);

let db;

async function connectToDatabase() {
  try {
    await client.connect();

    db = client.db(process.env.DB_NAME);

    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

function getDatabase() {
  return db;
}

module.exports = {
  connectToDatabase,
  getDatabase,
};