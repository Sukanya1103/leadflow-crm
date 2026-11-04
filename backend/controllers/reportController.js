const Lead = require("../models/Lead");
const User = require("../models/User");
const Team = require("../models/Team");

const emptyStats = () => ({ total: 0, active: 0, won: 0, lost: 0, revenue: 0, pipelineValue: 0 });

const addStats = (a, b) => ({
  total: a.total + b.total,
  active: a.active + b.active,
  won: a.won + b.won,
  lost: a.lost + b.lost,
  revenue: a.revenue + b.revenue,
  pipelineValue: a.pipelineValue + b.pipelineValue,
});

const withRate = (stats) => ({
  ...stats,
  conversionRate: stats.won + stats.lost > 0 ? Math.round((stats.won / (stats.won + stats.lost)) * 100) : 0,
});

const parseDate = (value, endOfDay = false) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  if (endOfDay) date.setUTCHours(23, 59, 59, 999);
  return date;
};

// @route   GET /api/reports/team?from=YYYY-MM-DD&to=YYYY-MM-DD   (admin, manager)
// Date range leads ki created date par lagti hai.
// Team wala manager sirf apni team ka report dekhta hai, admin sabka.
const getTeamReport = async (req, res) => {
  try {
    const from = parseDate(req.query.from);
    const to = parseDate(req.query.to, true);

    const match = {};
    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = from;
      if (to) match.createdAt.$lte = to;
    }

    const restrictToTeam = req.user.role === "manager" && req.user.team ? req.user.team : null;

    const [users, teams] = await Promise.all([
      User.find(restrictToTeam ? { team: restrictToTeam } : {}).populate("team", "name"),
      Team.find(restrictToTeam ? { _id: restrictToTeam } : {}).populate("manager", "name"),
    ]);

    if (restrictToTeam) match.assignedTo = { $in: users.map((u) => u._id) };

    // Har user ki leads ka hisaab
    const rawStats = await Lead.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$assignedTo",
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $in: ["$stage", ["Closed Won", "Closed Lost"]] }, 0, 1] } },
          won: { $sum: { $cond: [{ $eq: ["$stage", "Closed Won"] }, 1, 0] } },
          lost: { $sum: { $cond: [{ $eq: ["$stage", "Closed Lost"] }, 1, 0] } },
          revenue: { $sum: { $cond: [{ $eq: ["$stage", "Closed Won"] }, "$dealValue", 0] } },
          pipelineValue: {
            $sum: { $cond: [{ $in: ["$stage", ["Closed Won", "Closed Lost"]] }, 0, "$dealValue"] },
          },
        },
      },
    ]);

    const statsByUser = {};
    let unassigned = null;
    rawStats.forEach(({ _id, ...stats }) => {
      if (_id) statsByUser[_id.toString()] = stats;
      else unassigned = stats;
    });

    // User-wise rows (jinke paas leads hain ya jo active sales rep hain)
    const userRows = users
      .filter((u) => statsByUser[u._id.toString()] || (u.isActive && u.role === "sales_rep"))
      .map((u) => ({
        userId: u._id,
        name: u.name,
        role: u.role,
        team: u.team?.name || "No team",
        ...withRate(statsByUser[u._id.toString()] || emptyStats()),
      }));

    // Team-wise rows
    const teamMap = {};
    teams.forEach((t) => {
      teamMap[t._id.toString()] = {
        teamId: t._id,
        name: t.name,
        manager: t.manager?.name || "No manager",
        members: users.filter((u) => u.team && u.team._id.equals(t._id)).length,
        stats: emptyStats(),
      };
    });

    const noTeamUsers = users.filter((u) => !u.team);
    if (!restrictToTeam && noTeamUsers.length > 0) {
      teamMap.none = {
        teamId: null,
        name: "No team",
        manager: "-",
        members: noTeamUsers.length,
        stats: emptyStats(),
      };
    }

    users.forEach((u) => {
      const stats = statsByUser[u._id.toString()];
      const key = u.team ? u.team._id.toString() : "none";
      if (stats && teamMap[key]) teamMap[key].stats = addStats(teamMap[key].stats, stats);
    });

    const teamRows = Object.values(teamMap)
      .map(({ stats, ...info }) => ({ ...info, ...withRate(stats) }))
      .sort((a, b) => b.revenue - a.revenue);

    // Poora total (unassigned leads bhi count hoti hain, sirf poore report me)
    let totals = Object.values(teamMap).reduce((sum, t) => addStats(sum, t.stats), emptyStats());
    if (unassigned) totals = addStats(totals, unassigned);

    res.json({
      range: { from: from || null, to: to || null },
      restrictedToTeam: Boolean(restrictToTeam),
      summary: withRate(totals),
      teams: teamRows,
      users: userRows.sort((a, b) => b.revenue - a.revenue),
      unassigned: unassigned ? withRate(unassigned) : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTeamReport };