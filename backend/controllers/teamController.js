const Team = require("../models/Team");
const User = require("../models/User");

// Manager sirf manager ya admin role wala user ho sakta hai
const validateManager = async (managerId) => {
  const manager = await User.findById(managerId);
  if (!manager) return { error: "Manager user not found" };
  if (!["manager", "admin"].includes(manager.role)) {
    return { error: "Team manager must have the manager or admin role" };
  }
  return { manager };
};

const duplicateNameMessage = (error) =>
  error.code === 11000 ? "A team with this name already exists" : null;

// @route   GET /api/teams   (admin, manager)
const getTeams = async (req, res) => {
  try {
    const [teams, counts] = await Promise.all([
      Team.find().populate("manager", "name email").sort({ name: 1 }).lean(),
      User.aggregate([{ $match: { team: { $ne: null } } }, { $group: { _id: "$team", count: { $sum: 1 } } }]),
    ]);

    const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));
    res.json(teams.map((team) => ({ ...team, memberCount: countMap[team._id.toString()] || 0 })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/teams   (admin)
const createTeam = async (req, res) => {
  try {
    const { name, manager } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Team name is required" });
    }

    if (manager) {
      const result = await validateManager(manager);
      if (result.error) return res.status(400).json({ message: result.error });
    }

    const team = await Team.create({ name, manager: manager || null });

    // Manager automatically us team ka member ban jata hai
    if (manager) await User.findByIdAndUpdate(manager, { team: team._id });

    const populated = await Team.findById(team._id).populate("manager", "name email");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: duplicateNameMessage(error) || error.message });
  }
};

// @route   PUT /api/teams/:id   (admin)
const updateTeam = async (req, res) => {
  try {
    const { name, manager } = req.body;

    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ message: "Team name can't be empty" });
      team.name = name;
    }

    if (manager !== undefined) {
      if (manager === null || manager === "") {
        team.manager = null;
      } else {
        const result = await validateManager(manager);
        if (result.error) return res.status(400).json({ message: result.error });
        team.manager = manager;
        await User.findByIdAndUpdate(manager, { team: team._id });
      }
    }

    await team.save();

    const populated = await Team.findById(team._id).populate("manager", "name email");
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: duplicateNameMessage(error) || error.message });
  }
};

// @route   DELETE /api/teams/:id   (admin)
// Team delete hone par uske members "no team" ho jate hain
const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    await User.updateMany({ team: team._id }, { team: null });
    await team.deleteOne();

    res.json({ message: "Team deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTeams, createTeam, updateTeam, deleteTeam };