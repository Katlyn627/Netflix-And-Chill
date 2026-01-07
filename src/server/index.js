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

// Security Headers - Content Security Policy
app.use((req, res, next) => {
  // Set Content Security Policy header to prevent eval() and inline scripts
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com https://www.gstatic.com https://apis.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: http:",
      "connect-src 'self' http://localhost:* https://api.themoviedb.org https://image.tmdb.org https://*.firebaseio.com https://*.googleapis.com wss://*.firebaseio.com",
      "frame-src 'self' https://*.firebaseapp.com",
      "object-src 'none'",
      "base-uri 'self'"
    ].join('; ')
  );
  
  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
});

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
