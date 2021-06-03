import express from "express";
const router = express.Router();

// Import validators

// Import controllers
import {register} from "../controllers/auth"

router.post("/register", register)

module.exports = router;
