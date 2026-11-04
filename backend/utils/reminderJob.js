const cron = require("node-cron");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const { getDueLeads } = require("../controllers/reminderController");

const emailConfigured = () =>
  Boolean(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS);

const createTransporter = () => {
  const port = Number(process.env.EMAIL_PORT) || 587;
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
};

const escapeHtml = (text = "") =>
  String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const leadList = (title, leads) =>
  leads.length === 0
    ? ""
    : `<h3>${title} (${leads.length})</h3><ul>${leads
        .map(
          (l) =>
            `<li><b>${escapeHtml(l.name)}</b>${l.company ? ` (${escapeHtml(l.company)})` : ""} - ${escapeHtml(
              l.stage
            )}, follow-up: ${formatDate(l.followUpDate)}</li>`
        )
        .join("")}</ul>`;

const buildEmail = (user, { overdue, today }) => ({
  subject: `LeadFlow CRM: ${overdue.length + today.length} follow-up(s) need your attention`,
  html: `<p>Hi ${escapeHtml(user.name)},</p>
         <p>Here are your follow-up reminders for today:</p>
         ${leadList("Overdue", overdue)}
         ${leadList("Due today", today)}
         <p>Log in to LeadFlow CRM to update these leads.</p>`,
});

// Sabhi active users ko unke due follow-ups ka daily email bhejo
const sendDailyReminders = async () => {
  const summary = { usersWithReminders: 0, emailsSent: 0, emailConfigured: emailConfigured() };

  const users = await User.find({ isActive: true });
  const transporter = summary.emailConfigured ? createTransporter() : null;

  for (const user of users) {
    const due = await getDueLeads(user._id);
    const total = due.overdue.length + due.today.length;
    if (total === 0) continue;

    summary.usersWithReminders += 1;

    if (!transporter) {
      console.log(`[reminders] ${user.email}: ${total} follow-up(s) due (email not configured, skipped)`);
      continue;
    }

    try {
      const { subject, html } = buildEmail(user, due);
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: user.email,
        subject,
        html,
      });
      summary.emailsSent += 1;
    } catch (error) {
      console.error(`[reminders] Failed to email ${user.email}: ${error.message}`);
    }
  }

  console.log(`[reminders] Done: ${JSON.stringify(summary)}`);
  return summary;
};

// Server start hote hi call karo. Default: roz subah 9 baje (IST)
const startReminderJob = () => {
  const schedule = process.env.REMINDER_CRON || "0 9 * * *";

  if (!cron.validate(schedule)) {
    console.error(`[reminders] Invalid REMINDER_CRON "${schedule}", job not started`);
    return;
  }

  cron.schedule(
    schedule,
    () => {
      sendDailyReminders().catch((error) => console.error(`[reminders] Job failed: ${error.message}`));
    },
    { timezone: "Asia/Kolkata" }
  );

  console.log(`Reminder job scheduled: "${schedule}" (IST)`);
};

module.exports = { startReminderJob, sendDailyReminders };