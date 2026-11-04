const express = require("express");
const { getMyReminders } = require("../controllers/reminderController");
const { sendDailyReminders } = require("../utils/reminderJob");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

// Apne reminders (navbar bell ke liye)
router.get("/", getMyReminders);

// Testing ke liye: daily email job abhi chalao (sirf admin)
router.post("/send-now", authorize("admin"), async (req, res) => {
  try {
    const summary = await sendDailyReminders();
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;