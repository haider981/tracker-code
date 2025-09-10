const express = require("express");
const { manualTriggerAutoLeave } = require("../controllers/scheduledJobController");
const authMiddleware = require("../middleware/auth"); // Optional: if you want to protect the manual trigger

const router = express.Router();

// Manual trigger for testing (optional authentication)
router.post("/auto-assign-leave", authMiddleware, manualTriggerAutoLeave);

module.exports = router;