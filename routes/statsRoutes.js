const express = require("express");
const {
  getAdminStats,
  getVendorStats,
} = require("../controllers/statsController");
const {
  verifyToken,
  verifyAdmin,
  verifyVendor,
} = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/admin-stats", verifyToken, verifyAdmin, getAdminStats);
router.get("/vendor-stats/:email", verifyToken, verifyVendor, getVendorStats);

module.exports = router;
