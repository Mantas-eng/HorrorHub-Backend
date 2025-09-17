const express = require("express");
const next = require("next");
const mongoose = require("mongoose");
const movieRoutes = require("./routes/Movies");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 8080;
const MONGO_URL = process.env.MONGO_URL;

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://mantas-eng-horror-hub-front-end.vercel.app",
  "https://horrorhub.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed for this origin: " + origin));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.prepare().then(() => {
  const server = express();

  server.use(cors(corsOptions)); // 👈 labai svarbu: prieš routes
  server.use(express.json());

  // ✅ visi API keliai turi /api prefix
  server.use("/api", movieRoutes);

  // ✅ kiti keliai eina į Next.js
  server.all("*", (req, res) => {
    return handle(req, res);
  });

  mongoose
    .connect(MONGO_URL)
    .then(() => {
      console.log("✅ Connected to MongoDB");
      server.listen(PORT, (err) => {
        if (err) throw err;
        console.log(`🚀 Server is running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("❌ Error connecting to MongoDB:", error.message);
      process.exit(1);
    });

  server.use((err, req, res, next) => {
    console.error("Unhandled error:", err.stack);
    res.status(500).send("Internal Server Error");
  });
});
