const Lead = require("../models/Lead");

const CLOSED_STAGES = ["Closed Won", "Closed Lost"];
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

// @route   GET /api/dashboard/stats
// Admin/manager ko sabhi leads ke stats, sales rep ko sirf apni leads ke
const getDashboardStats = async (req, res) => {
  try {
    const scope = req.user.role === "sales_rep" ? { assignedTo: req.user._id } : {};

    // India time ke hisaab se aaj ki date aur pichle 6 mahine
    const ist = new Date(Date.now() + IST_OFFSET_MS);
    const year = ist.getUTCFullYear();
    const month = ist.getUTCMonth();
    const startOfToday = new Date(Date.UTC(year, month, ist.getUTCDate()) - IST_OFFSET_MS);
    const sixMonthsStart = new Date(Date.UTC(year, month - 5, 1) - IST_OFFSET_MS);

    const [stageStats, sourceStats, monthlyStats, upcomingFollowUps, overdueFollowUps] = await Promise.all([
      Lead.aggregate([
        { $match: scope },
        { $group: { _id: "$stage", count: { $sum: 1 }, value: { $sum: "$dealValue" } } },
      ]),

      Lead.aggregate([{ $match: scope }, { $group: { _id: "$source", count: { $sum: 1 } } }]),

      // Closed Won deals, mahine ke hisaab se revenue
      Lead.aggregate([
        { $match: { ...scope, stage: "Closed Won" } },
        { $addFields: { closedDate: { $ifNull: ["$closedAt", "$updatedAt"] } } },
        { $match: { closedDate: { $gte: sixMonthsStart } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$closedDate", timezone: "Asia/Kolkata" } },
            revenue: { $sum: "$dealValue" },
            deals: { $sum: 1 },
          },
        },
      ]),

      Lead.find({
        ...scope,
        stage: { $nin: CLOSED_STAGES },
        followUpDate: { $gte: startOfToday },
      })
        .sort({ followUpDate: 1 })
        .limit(5)
        .select("name company stage followUpDate assignedTo")
        .populate("assignedTo", "name"),

      Lead.countDocuments({
        ...scope,
        stage: { $nin: CLOSED_STAGES },
        followUpDate: { $lt: startOfToday, $ne: null },
      }),
    ]);

    // Funnel: har stage ke liye entry (khali stage ke liye 0)
    const stageMap = Object.fromEntries(stageStats.map((s) => [s._id, s]));
    const funnel = Lead.STAGES.map((stage) => ({
      stage,
      count: stageMap[stage]?.count || 0,
      value: stageMap[stage]?.value || 0,
    }));

    const sources = Lead.SOURCES.map((source) => ({
      source,
      count: sourceStats.find((s) => s._id === source)?.count || 0,
    }));

    // Pichle 6 mahine, jisme sale nahi hui unke liye 0
    const monthMap = Object.fromEntries(monthlyStats.map((m) => [m._id, m]));
    const monthlySales = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(Date.UTC(year, month - i, 1));
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      monthlySales.push({
        key,
        month: d.toLocaleString("en-US", { month: "short", timeZone: "UTC" }),
        revenue: monthMap[key]?.revenue || 0,
        deals: monthMap[key]?.deals || 0,
      });
    }

    const totalLeads = funnel.reduce((sum, s) => sum + s.count, 0);
    const wonDeals = funnel.find((s) => s.stage === "Closed Won").count;
    const lostDeals = funnel.find((s) => s.stage === "Closed Lost").count;
    const wonRevenue = funnel.find((s) => s.stage === "Closed Won").value;
    const activeStages = funnel.filter((s) => !CLOSED_STAGES.includes(s.stage));

    res.json({
      summary: {
        totalLeads,
        activeLeads: activeStages.reduce((sum, s) => sum + s.count, 0),
        activePipelineValue: activeStages.reduce((sum, s) => sum + s.value, 0),
        wonDeals,
        lostDeals,
        wonRevenue,
        thisMonthRevenue: monthlySales[monthlySales.length - 1].revenue,
        conversionRate: wonDeals + lostDeals > 0 ? Math.round((wonDeals / (wonDeals + lostDeals)) * 100) : 0,
        overdueFollowUps,
      },
      funnel,
      sources,
      monthlySales,
      upcomingFollowUps,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };