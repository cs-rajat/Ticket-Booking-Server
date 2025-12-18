const express = require("express");
const { getAdminStats } = require("../controllers/statsController");
const {
  verifyToken,
  verifyAdmin,
} = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/admin-stats", verifyToken, verifyAdmin, getAdminStats);

module.exports = router;
