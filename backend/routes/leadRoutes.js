const express = require("express");
const {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  updateLeadStage,
  assignLead,
  deleteLead,
} = require("../controllers/leadController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Sab routes ke liye login zaroori hai
router.use(protect);

router.route("/").get(getLeads).post(createLead);

router.patch("/:id/stage", updateLeadStage);
router.patch("/:id/assign", authorize("admin", "manager"), assignLead);

router
  .route("/:id")
  .get(getLeadById)
  .put(updateLead)
  .delete(authorize("admin", "manager"), deleteLead);

module.exports = router;