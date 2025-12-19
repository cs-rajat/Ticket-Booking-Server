const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { connectDB } = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const statsRoutes = require("./routes/statsRoutes");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/", authRoutes);
app.use("/users", userRoutes);
app.use("/tickets", ticketRoutes);
app.use("/bookings", bookingRoutes);
app.use("/", paymentRoutes);
app.use("/", statsRoutes);

app.get("/", (req, res) => {
  res.send("Ticket Booking Server is running");
});

// Connect to DB and start server
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Ticket Booking Server is running on port ${port}`);
  });
});
// Server is running
