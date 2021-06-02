import express from "express";
const morgan = require("morgan");
import cors from "cors";
import {readdirSync} from "fs";
import mongoose from "mongoose";
require("dotenv").config();

// Initialize app
const app = express();

// Connect to Database
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Successfully connected to the Database"))
  .catch((err) => console.log("Database connection error", err));

// Wildcard cors - anyone domain has access
// to the application
app.use(cors());
app.use(express.json());

// Global middlewares (to be used on all routes)
app.use(morgan("dev"));

// Restrict cors - only specified domains
// have access to the application
// app.use(cors({ origin: process.env.CLIENT_URL }));

// Auto load route middlewares
// Import and apply routes
readdirSync("./routes").map((route) =>
  app.use("/api", require(`./routes/${route}`))
);

const port = process.env.PORT || 8000;

app.listen(port, () => console.log(`Server is running on port ${port}`));
