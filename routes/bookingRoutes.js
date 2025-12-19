const express = require("express");
const {
  createBooking,
  getUserBookings,
  getVendorBookings,
  updateBookingStatus,
} = require("../controllers/bookingController");
const { verifyToken, verifyVendor } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", verifyToken, createBooking);
router.get("/user/:email", verifyToken, getUserBookings);
router.get("/vendor/:email", verifyToken, verifyVendor, getVendorBookings);
router.patch("/:id", verifyToken, updateBookingStatus);

module.exports = router;
