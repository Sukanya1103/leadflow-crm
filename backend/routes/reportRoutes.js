const express = require("express");
const { getTeamReport } = require("../controllers/reportController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/team", authorize("admin", "manager"), getTeamReport);

module.exports = router;