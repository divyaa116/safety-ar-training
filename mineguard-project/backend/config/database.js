// Connects to MongoDB Atlas using the address stored in the MONGODB_URI environment variable.
const mongoose = require("mongoose");

async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes("USERNAME:PASSWORD")) {
    throw new Error("MONGODB_URI is missing. Open backend/.env and paste your Atlas connection string.");
  }
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
}

module.exports = connectDatabase;
