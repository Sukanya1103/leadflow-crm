const express = require("express");
const { getUsers, updateUser } = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", authorize("admin", "manager"), getUsers);
router.patch("/:id", authorize("admin"), updateUser);

module.exports = router;