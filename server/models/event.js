import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: String,
    dateTime: Date,
    venueName: String,
    venueAddress: String,
    city: { type: String, default: "Sydney" },
    description: String,
    category: [String],
    imageUrl: String,
    sourceWebsite: String,
    originalUrl: { type: String, unique: true },

    status: {
      type: String,
      enum: ["new", "updated", "inactive", "imported"],
      default: "new",
    },

    lastScrapedAt: Date,

    importedAt: Date,
    importedBy: String,
    importNotes: String,
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;