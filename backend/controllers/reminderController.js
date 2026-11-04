const Lead = require("../models/Lead");

const CLOSED_STAGES = ["Closed Won", "Closed Lost"];
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

// India time ke hisaab se aaj ki shuruaat aur ant
const getTodayBounds = () => {
  const ist = new Date(Date.now() + IST_OFFSET_MS);
  const startOfToday = new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate()) - IST_OFFSET_MS);
  const endOfToday = new Date(startOfToday.getTime() + DAY_MS - 1);
  return { startOfToday, endOfToday };
};

// Ek user ko assigned wo leads jinka follow-up aaj hai ya nikal chuka hai
const getDueLeads = async (userId) => {
  const { startOfToday, endOfToday } = getTodayBounds();

  const leads = await Lead.find({
    assignedTo: userId,
    stage: { $nin: CLOSED_STAGES },
    followUpDate: { $ne: null, $lte: endOfToday },
  })
    .sort({ followUpDate: 1 })
    .select("name company stage followUpDate dealValue");

  return {
    overdue: leads.filter((lead) => lead.followUpDate < startOfToday),
    today: leads.filter((lead) => lead.followUpDate >= startOfToday),
  };
};

// @route   GET /api/reminders
// Logged-in user ke apne reminders (jo leads uske naam assign hain)
const getMyReminders = async (req, res) => {
  try {
    const { overdue, today } = await getDueLeads(req.user._id);
    res.json({ overdue, today, count: overdue.length + today.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDueLeads, getMyReminders };