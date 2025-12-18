const express = require("express");
const { createPaymentIntent } = require("../controllers/paymentController");
const { verifyToken } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/create-payment-intent", verifyToken, createPaymentIntent);

module.exports = router;
