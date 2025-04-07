import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const uri = `${process.env.DB_URI}/${DB_NAME}`;
    console.log("DB_URI:", process.env.DB_URI);
    console.log("Attempting to connect to:", uri); // Debug only

    const connection = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to the database:", connection.connection.host);
  } catch (error) {
    console.error("Error in DB connection:", error.message);
  }
};

export default connectDB;
