const express = require("express");
const {
  getApprovedTickets,
  getAllTicketsAdmin,
  getVendorTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  updateTicketStatus,
  advertiseTicket,
  getTicketLocations,
} = require("../controllers/ticketController");
const {
  verifyToken,
  verifyAdmin,
  verifyVendor,
  verifyAdminOrVendor,
} = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/locations", getTicketLocations);
router.get("/", getApprovedTickets);
router.get("/admin", verifyToken, verifyAdmin, getAllTicketsAdmin);
router.get("/vendor/:email", verifyToken, verifyVendor, getVendorTickets);
router.get("/:id", getTicketById);
router.post("/", verifyToken, verifyVendor, createTicket);
router.patch("/:id", verifyToken, verifyVendor, updateTicket);
router.delete("/:id", verifyToken, verifyAdminOrVendor, deleteTicket);
router.patch("/status/:id", verifyToken, verifyAdmin, updateTicketStatus);
router.patch("/advertise/:id", verifyToken, verifyAdmin, advertiseTicket);

module.exports = router;
