const mongoose = require("mongoose");

const ACTIVITY_TYPES = ["call", "email", "meeting", "note"];

const activitySchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ACTIVITY_TYPES,
      required: [true, "Activity type is required"],
    },
    notes: {
      type: String,
      required: [true, "Notes are required"],
      trim: true,
    },
    // Call/meeting kab hui (default: abhi)
    date: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

activitySchema.statics.TYPES = ACTIVITY_TYPES;

module.exports = mongoose.model("Activity", activitySchema);