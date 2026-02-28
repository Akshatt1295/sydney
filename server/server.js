import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import cron from "node-cron";
import { scrapeEventbrite } from "./scraper/eventbrite.js";
import Event from "./models/Event.js";


cron.schedule("*/10 * * * *", async () => {
  console.log("Running scheduled scrape");
  await scrapeEventbrite();
});
const app = express();

// middleware
app.use(cors());
app.use(express.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../public")));

// MongoDB connect
mongoose.connect("mongodb://127.0.0.1:27017/sydneyEvents")
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));


// TEST DATA (seed) 
app.get("/api/seed", async (req, res) => {
  await Event.deleteMany({});

  await Event.create({
    title: "Sedney Music Festival",
    dateTime: new Date(),
    venueName: "Sydney Opera House",
    city: "Sydney",
    description: "Live music event in Sydney.",
    imageUrl: "https://picsum.photos/400/200",
    sourceWebsite: "Eventbrite",
    originalUrl: "https://eventbrite.com",
    status: "new",
    lastScrapedAt: new Date()
  });

  res.json({ message: "Seeded!" });
});

// TEST DATA 
app.get("/api/seed", async (req, res) => {
  await Event.deleteMany({});

  await Event.create({
    title: "Sydney Music Festival",
    dateTime: new Date(),
    venueName: "Sydney Opera House",
    city: "Sydney",
    description: "Live music event in Sydney.",
    imageUrl: "https://picsum.photos/400/200",
    sourceWebsite: "Eventbrite",
    originalUrl: "https://eventbrite.com",
    status: "new",
    lastScrapedAt: new Date()
  });

  res.json({ message: "Seeded!" });
});

//GET EVENTS API
app.get("/api/events", async (req, res) => {
  const events = await Event.find({ city: "Sydney" });
  res.json(events);
});

// EMAIL CAPTURE 
const emailSchema = new mongoose.Schema({
  email: String,
  consent: Boolean,
  eventId: mongoose.Schema.Types.ObjectId
});

const EmailCapture = mongoose.model("EmailCapture", emailSchema);

app.post("/api/lead", async (req, res) => {
  const { email, consent, eventId } = req.body;

  await EmailCapture.create({ email, consent, eventId });

  res.json({ success: true });
});
app.post("/api/events/:id/import", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    event.status = "imported";
    event.importedAt = new Date();
    event.importedBy = "admin"; // later from OAuth
    event.importNotes = req.body?.notes || "";

    await event.save();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Import failed" });
  }
});
app.get("/api/run-scraper", async (req, res) => {
  await scrapeEventbrite();
  res.json({ message: "Scraper executed" });
});

// START SERVER 
app.listen(8080, () => {
  console.log("Server running on port 8080");
});