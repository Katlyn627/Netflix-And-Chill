import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "../lib/db.js";

import matchesRouter from "./routes/matches.routes.js";
import debatesRouter from "./routes/debates.routes.js";

const app = express();
app.use(cors({ origin: process.env.WEB_ORIGIN || true, credentials: true }));
app.use(express.json());

app.get("/health", async (_req, res) => {
  try {
    await connectDB();
    res.json({ ok: true, message: "Server is healthy" });
  } catch (error) {
    res.status(503).json({ ok: false, error: "Database connection failed" });
  }
});

app.use("/api/matches", matchesRouter);
app.use("/api/debates", debatesRouter);

const port = process.env.PORT || 4000;
app.listen(port, async () => {
  await connectDB();
  console.log(`Express API running on http://localhost:${port}`);
});

export default app;
