const express = require("express");
const { getTeams, createTeam, updateTeam, deleteTeam } = require("../controllers/teamController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.route("/").get(authorize("admin", "manager"), getTeams).post(authorize("admin"), createTeam);

router.route("/:id").put(authorize("admin"), updateTeam).delete(authorize("admin"), deleteTeam);

module.exports = router;