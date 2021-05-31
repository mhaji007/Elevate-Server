import express from "express";
const morgan = require("morgan");
import cors from "cors";
require("dotenv").config();

// Import routes


// Initialize app
const app = express();


// Global middlewares (to be used on all routes)
app.use(morgan("dev"));


// Wildcard cors - anyone domain has access
// to the application
app.use(cors());
app.use(express.json())

// Restrict cors - only specified domains
// have access to the application
// app.use(cors({ origin: process.env.CLIENT_URL }));

// Route middlewares

const port = process.env.PORT || 8000;

app.listen(port, () => console.log(`Server is running on port ${port}`));
