const mongoose = require("mongoose");

const STAGES = ["Prospect", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];
const SOURCES = ["Website", "Social Media", "Email", "Referral", "Cold Call", "Other"];

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Lead name is required"],
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      enum: SOURCES,
      default: "Other",
    },
    stage: {
      type: String,
      enum: STAGES,
      default: "Prospect",
    },
    dealValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    followUpDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
    },
    closedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Stage "Closed Won/Lost" hone par closedAt set hota hai
leadSchema.pre("save", async function () {
  if (this.isModified("stage")) {
    this.closedAt = ["Closed Won", "Closed Lost"].includes(this.stage) ? new Date() : null;
  }
});

leadSchema.statics.STAGES = STAGES;
leadSchema.statics.SOURCES = SOURCES;

module.exports = mongoose.model("Lead", leadSchema);
