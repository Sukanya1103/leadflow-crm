const Activity = require("../models/Activity");
const Lead = require("../models/Lead");

// Admin/manager sab leads dekh sakte hain, sales rep sirf apni assigned leads
const canAccessLead = (user, lead) => {
  if (user.role === "admin" || user.role === "manager") return true;
  return Boolean(lead.assignedTo && lead.assignedTo.equals(user._id));
};

// @route   GET /api/activities/lead/:leadId
const getLeadActivities = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.leadId);

    if (!lead) return res.status(404).json({ message: "Lead not found" });
    if (!canAccessLead(req.user, lead)) {
      return res.status(403).json({ message: "You can't access this lead" });
    }

    const activities = await Activity.find({ lead: lead._id })
      .populate("createdBy", "name role")
      .sort({ date: -1, createdAt: -1 });

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/activities/lead/:leadId
const addActivity = async (req, res) => {
  try {
    const { type, notes, date } = req.body;

    if (!Activity.TYPES.includes(type)) {
      return res.status(400).json({ message: `Type must be one of: ${Activity.TYPES.join(", ")}` });
    }
    if (!notes || !notes.trim()) {
      return res.status(400).json({ message: "Notes are required" });
    }

    const lead = await Lead.findById(req.params.leadId);

    if (!lead) return res.status(404).json({ message: "Lead not found" });
    if (!canAccessLead(req.user, lead)) {
      return res.status(403).json({ message: "You can't add activity to this lead" });
    }

    const activity = await Activity.create({
      lead: lead._id,
      type,
      notes,
      date: date || undefined,
      createdBy: req.user._id,
    });

    const populated = await Activity.findById(activity._id).populate("createdBy", "name role");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/activities/:id
// Sirf activity banane wala ya admin/manager delete kar sakta hai
const deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: "Activity not found" });

    const isOwner = activity.createdBy.equals(req.user._id);
    const isPrivileged = req.user.role === "admin" || req.user.role === "manager";

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ message: "You can't delete this activity" });
    }

    await activity.deleteOne();
    res.json({ message: "Activity deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLeadActivities, addActivity, deleteActivity };