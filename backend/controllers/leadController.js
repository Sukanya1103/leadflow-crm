const Lead = require("../models/Lead");
const User = require("../models/User");

// Sales rep sirf apni assigned leads dekh/edit kar sakta hai.
// Admin aur manager sabhi leads access kar sakte hain.
const canAccessLead = (user, lead) => {
  if (user.role === "admin" || user.role === "manager") return true;
  return lead.assignedTo && lead.assignedTo._id
    ? lead.assignedTo._id.equals(user._id)
    : lead.assignedTo && lead.assignedTo.equals(user._id);
};

const populateLead = (query) =>
  query.populate("assignedTo", "name email role").populate("createdBy", "name email");

// @route   POST /api/leads
const createLead = async (req, res) => {
  try {
    const { name, company, email, phone, source, stage, dealValue, assignedTo, followUpDate, notes } =
      req.body;

    if (!name) {
      return res.status(400).json({ message: "Lead name is required" });
    }

    // Sales rep ki lead automatically usi ko assign hoti hai
    let assignee = assignedTo || null;
    if (req.user.role === "sales_rep") assignee = req.user._id;

    const lead = await Lead.create({
      name,
      company,
      email,
      phone,
      source,
      stage,
      dealValue,
      followUpDate,
      notes,
      assignedTo: assignee,
      createdBy: req.user._id,
    });

    const populated = await populateLead(Lead.findById(lead._id));
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/leads?search=&stage=&source=&assignedTo=
const getLeads = async (req, res) => {
  try {
    const { search, stage, source, assignedTo } = req.query;
    const filter = {};

    if (req.user.role === "sales_rep") {
      filter.assignedTo = req.user._id;
    } else if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    if (stage) filter.stage = stage;
    if (source) filter.source = source;

    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: regex }, { company: regex }, { email: regex }, { phone: regex }];
    }

    const leads = await populateLead(Lead.find(filter).sort({ createdAt: -1 }));
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/leads/:id
const getLeadById = async (req, res) => {
  try {
    const lead = await populateLead(Lead.findById(req.params.id));

    if (!lead) return res.status(404).json({ message: "Lead not found" });
    if (!canAccessLead(req.user, lead)) {
      return res.status(403).json({ message: "You can't access this lead" });
    }

    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/leads/:id
const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) return res.status(404).json({ message: "Lead not found" });
    if (!canAccessLead(req.user, lead)) {
      return res.status(403).json({ message: "You can't edit this lead" });
    }

    // Assign aur createdBy yahan se change nahi honge
    const allowed = ["name", "company", "email", "phone", "source", "stage", "dealValue", "followUpDate", "notes"];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) lead[field] = req.body[field];
    });

    await lead.save();
    const populated = await populateLead(Lead.findById(lead._id));
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PATCH /api/leads/:id/stage   (drag-and-drop ke liye)
const updateLeadStage = async (req, res) => {
  try {
    const { stage } = req.body;

    if (!Lead.STAGES.includes(stage)) {
      return res.status(400).json({ message: `Stage must be one of: ${Lead.STAGES.join(", ")}` });
    }

    const lead = await Lead.findById(req.params.id);

    if (!lead) return res.status(404).json({ message: "Lead not found" });
    if (!canAccessLead(req.user, lead)) {
      return res.status(403).json({ message: "You can't update this lead" });
    }

    lead.stage = stage;
    await lead.save();

    const populated = await populateLead(Lead.findById(lead._id));
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PATCH /api/leads/:id/assign   (admin, manager)
const assignLead = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    const assignee = await User.findById(assignedTo);
    if (!assignee || !assignee.isActive) {
      return res.status(400).json({ message: "Assigned user not found or inactive" });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    lead.assignedTo = assignee._id;
    await lead.save();

    const populated = await populateLead(Lead.findById(lead._id));
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/leads/:id   (admin, manager)
const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    await lead.deleteOne();
    res.json({ message: "Lead deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  updateLeadStage,
  assignLead,
  deleteLead,
};