import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import { app } from "./app";

const start = async () => {
  console.log("Backend starting...");
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY not set.");
  }
  try {
    await mongoose.connect(
      `mongodb+srv://jinyongnan:${process.env.MONGO_PWD}@cluster0.xk5om.gcp.mongodb.net/electron-full-demo?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
      }
    );
    console.log("DB connected.");
  } catch (error) {
    console.log(error);
  }

  app.listen(5000, async () => {
    console.log("Backend listening on port 5000.");
  });
};

start();
