const express = require("express");
const cors = require("cors");
const path = require('path');

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const worklogRoutes = require("./routes/worklogRoutes");
const spocRoutes = require('./routes/spocRoutes');
const spocAddProjectRoutes = require('./routes/spocAddProjectRoutes');
const markShiftRoutes = require("./routes/markShiftRoutes");
const scheduledRoutes = require('./routes/scheduledJobRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adminEditWorklogRoutes = require('./routes/adminEditWorklogRoutes');
const adminHandleEmployeeRoutes = require('./routes/adminHandleEmployeeRoutes');
const adminProjectRequestRoutes = require('./routes/adminProjectRequestRoutes');
const adminAddProjectRoutes = require('./routes/adminAddProjectRoutes');
const abbreviationsRoutes = require('./routes/abbreviationsRoutes');
const adminAddAbbreviationRoutes = require('./routes/adminAddAbbreviationRoutes');
const teamWiseDropdownRoutes = require('./routes/teamWiseDropdownRoutes');
const addEntryRequestRoutes = require('./routes/addEntryRequestRoutes');
const addEntryRequestSpocRoutes = require('./routes/addEntryRequestSpocRoutes');
const spocApproveMissingRequestRoutes = require('./routes/spocApproveMissingRequestRoutes');
const adminPushMissingRequestRoutes = require('./routes/adminPushMissingRequestRoutes');
const adminAddUnitTypeRoutes = require('./routes/adminAddUnitTypeRoutes');

const { initializeScheduledJobs, stopAllScheduledJobs } = require('./services/schedulerService');


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/projects", projectRoutes);
app.use('/api/spoc', spocRoutes);~
app.use("/api/worklogs", worklogRoutes);
app.use("/api/spoc/projects",spocAddProjectRoutes);
app.use("/api/shifts", markShiftRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminEditWorklogRoutes);
app.use('/api/admin', adminHandleEmployeeRoutes);
app.use('/api/admin', scheduledRoutes);
app.use('/api/admin', adminAddProjectRoutes);
app.use('/api/admin/projects', adminProjectRequestRoutes);
app.use('/api/admin/abbreviations', abbreviationsRoutes);
app.use('/api/abbreviations', adminAddAbbreviationRoutes);
app.use('/api/teamwise-dropdowns', teamWiseDropdownRoutes);
app.use('/api/entry-requests', addEntryRequestRoutes);
app.use('/api/spoc/entry-requests', addEntryRequestSpocRoutes);
app.use('/api/spoc/request', spocApproveMissingRequestRoutes);
app.use('/api/admin/request', adminPushMissingRequestRoutes);
app.use('/api/admin/unit', adminAddUnitTypeRoutes);


const scheduledJobs = initializeScheduledJobs();

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('\nReceived SIGINT. Graceful shutdown...');
  stopAllScheduledJobs();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM. Graceful shutdown...');
  stopAllScheduledJobs();
  process.exit(0);
});
// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

module.exports = app;