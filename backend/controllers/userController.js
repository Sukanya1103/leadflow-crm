const User = require("../models/User");
const Team = require("../models/Team");

const ROLES = ["admin", "manager", "sales_rep"];

// @route   GET /api/users   (admin, manager)
// Lead assign karne aur team page ke liye users ki list
const getUsers = async (req, res) => {
  try {
    const users = await User.find().populate("team", "name").sort({ name: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PATCH /api/users/:id   (admin)
// Body me role, team (id ya null) aur isActive me se kuch bhi bhej sakte ho
const updateUser = async (req, res) => {
  try {
    const { role, team, isActive } = req.body;
    const updates = {};

    const isSelf = req.params.id === req.user._id.toString();
    if (isSelf && ((role !== undefined && role !== req.user.role) || isActive === false)) {
      return res.status(400).json({ message: "You can't change your own role or deactivate yourself" });
    }

    if (role !== undefined) {
      if (!ROLES.includes(role)) {
        return res.status(400).json({ message: `Role must be one of: ${ROLES.join(", ")}` });
      }
      updates.role = role;
    }

    if (team !== undefined) {
      if (team === null || team === "") {
        updates.team = null;
      } else {
        const teamExists = await Team.findById(team);
        if (!teamExists) return res.status(400).json({ message: "Team not found" });
        updates.team = team;
      }
    }

    if (isActive !== undefined) updates.isActive = Boolean(isActive);

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate("team", "name");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers, updateUser };