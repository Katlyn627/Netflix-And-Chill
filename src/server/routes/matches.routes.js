import express from "express";
import { connectDB } from "../../lib/db.js";
import User from "../../models/User.js";

const router = express.Router();

router.get("/candidates/:userId", async (req, res) => {
  try {
    await connectDB();

    const { userId } = req.params;
    const me = await User.findById(userId).lean();
    if (!me) return res.status(404).json({ error: "User not found" });

    const [lng, lat] = me.location?.geo?.coordinates || [];
    if (lng === null || lat === null || lng === undefined || lat === undefined) {
      return res.status(400).json({ error: "Missing user geo" });
    }

    const maxMiles = me.datingPrefs?.distanceMiles ?? 25;
    const blocked = me.safety?.blockedUserIds || [];

    // age calc using birthdate range
    const minAge = me.datingPrefs?.ageRange?.min ?? 18;
    const maxAge = me.datingPrefs?.ageRange?.max ?? 99;

    const youngestBirthdate = new Date(); // maxAge
    youngestBirthdate.setFullYear(youngestBirthdate.getFullYear() - maxAge);

    const oldestBirthdate = new Date(); // minAge
    oldestBirthdate.setFullYear(oldestBirthdate.getFullYear() - minAge);

    const intent = me.datingPrefs?.relationshipIntent;

    const candidates = await User.find({
      _id: { $ne: me._id, $nin: blocked },
      status: "active",
      ...(intent ? { "datingPrefs.relationshipIntent": intent } : {}),
      "identity.birthdate": { $gte: youngestBirthdate, $lte: oldestBirthdate },
      "location.geo": {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: maxMiles * 1609.34
        }
      }
    })
      .select("displayName photos movieTaste.favoriteGenres movieTaste.dealbreakerGenres location")
      .limit(50)
      .lean();

    // simple overlap score
    const myGenres = new Set(me.movieTaste?.favoriteGenres || []);
    const scored = candidates.map((u) => {
      const overlap = (u.movieTaste?.favoriteGenres || []).filter((g) => myGenres.has(g)).length;
      return { ...u, overlap };
    }).sort((a, b) => b.overlap - a.overlap);

    res.json({ results: scored.slice(0, 20) });
  } catch (error) {
    console.error("Error finding candidates:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
