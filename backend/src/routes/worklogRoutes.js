const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const { submitWorklogs, getRecentWorklogs } = require("../controllers/worklogController");

// protect this route with JWT; we need name & team from token
router.post("/", authenticateToken, submitWorklogs);
router.get("/recent", authenticateToken, getRecentWorklogs);

module.exports = router;
