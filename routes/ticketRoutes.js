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
} = require("../controllers/ticketController");
const {
  verifyToken,
  verifyAdmin,
  verifyVendor,
} = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/", getApprovedTickets);
router.get("/admin", verifyToken, verifyAdmin, getAllTicketsAdmin);
router.get("/vendor/:email", verifyToken, verifyVendor, getVendorTickets);
router.get("/:id", getTicketById);
router.post("/", verifyToken, verifyVendor, createTicket);
router.patch("/:id", verifyToken, verifyVendor, updateTicket);
router.delete("/:id", verifyToken, verifyVendor, deleteTicket);
router.patch("/status/:id", verifyToken, verifyAdmin, updateTicketStatus);
router.patch("/advertise/:id", verifyToken, verifyAdmin, advertiseTicket);

module.exports = router;
