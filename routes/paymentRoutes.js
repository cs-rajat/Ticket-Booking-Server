const express = require("express");
const {
  createPaymentIntent,
  savePayment,
  createCheckoutSession,
  paymentSuccess,
} = require("../controllers/paymentController");
const { verifyToken } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/create-payment-intent", verifyToken, createPaymentIntent);
router.post("/create-checkout-session", verifyToken, createCheckoutSession);
router.post("/payment-success", verifyToken, paymentSuccess);
router.post("/payments", verifyToken, savePayment);

module.exports = router;
