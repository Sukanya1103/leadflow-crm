const express = require("express");
const {
  getLeadActivities,
  addActivity,
  deleteActivity,
} = require("../controllers/activityController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.route("/lead/:leadId").get(getLeadActivities).post(addActivity);
router.delete("/:id", deleteActivity);

module.exports = router;