import puppeteer from "puppeteer";
import mongoose from "mongoose";
import Event from "../models/Event.js";

export async function scrapeEventbrite() {
  console.log("Scraping Eventbrite");

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(
    "https://www.eventbrite.com.au/d/australia--sydney/events/",
    { waitUntil: "networkidle2" }
  );

  const events = await page.evaluate(() => {
    const cards = document.querySelectorAll("a.event-card-link");

    return Array.from(cards).slice(0, 10).map(card => ({
      title: card.querySelector("h3")?.innerText,
      url: card.href,
      image: card.querySelector("img")?.src
    }));
  });

  for (const ev of events) {
  if (!ev.url) continue;

  const existing = await Event.findOne({
    originalUrl: ev.url,
  });

  if (!existing) {
    await Event.create({
      title: ev.title,
      city: "Sydney",
      imageUrl: ev.image,
      sourceWebsite: "Eventbrite",
      originalUrl: ev.url,
      status: "new",
      lastScrapedAt: new Date(),
    });
  } else {
    if (existing.title !== ev.title) {
      existing.status = "updated";
      existing.title = ev.title;
    }

    existing.lastScrapedAt = new Date();
    await existing.save();
  }
}
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

await Event.updateMany(
  { lastScrapedAt: { $lt: cutoff } },
  { status: "inactive" }
);

  await browser.close();
  console.log("Scraping done");
}