import express from "express";
import redoc from "redoc-express";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

// __dirname fix for ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get("/openapi.json", (req, res) => {
    res.sendFile(path.join(__dirname, "openapi.json"));
  });
  

// Serve the Redoc API documentation
router.get("/ourapi-docs", redoc({
  title: "API Documentation",
  specUrl: "/openapi.json" // Yeh correct path hai
}));

export default router;