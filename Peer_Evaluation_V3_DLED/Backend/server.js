import express from "express";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import teachRoutes from "./routes/teachRoutes.js";
import taRoutes from "./routes/taRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

fs.mkdirSync(path.join(__dirname, 'uploads', 'avatars'), { recursive: true });

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("API is running...");
});
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/teacher", teachRoutes);
app.use("/api/ta", taRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/user", userRoutes);
app.use("/api/announcements", announcementRoutes);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

startServer();
