const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

const createPaymentIntent = async (req, res) => {
  const { price } = req.body;

  if (!price || price <= 0) {
    return res.status(400).send({ error: "Invalid price" });
  }

  const amount = parseInt(price * 100);
  console.log(amount, "amount inside the intent");

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: "bdt",
    payment_method_types: ["card"],
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
};

const createCheckoutSession = async (req, res) => {
  const { booking } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: booking.title || booking.busName,
              description: `Booking for ${booking.from} to ${booking.to} on ${booking.journeyDate}`,
            },
            unit_amount: parseInt(booking.price * 100), // Total price
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${
        process.env.CLIENT_URL || "http://localhost:5173"
      }/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${
        process.env.CLIENT_URL || "http://localhost:5173"
      }/dashboard/myBookings`,
      metadata: {
        bookingId: booking._id,
        ticketId: booking.ticketId,
        quantity: booking.quantity,
        email: booking.userEmail,
        price: booking.price,
      },
    });

    res.send({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).send({ error: "Failed to create checkout session" });
  }
};

const paymentSuccess = async (req, res) => {
  const { sessionId } = req.body;
  const db = getDB();
  const paymentsCollection = db.collection("payments");
  const bookingsCollection = db.collection("bookings");
  const ticketsCollection = db.collection("tickets");

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const bookingId = session.metadata.bookingId;
      const ticketId = session.metadata.ticketId;
      const quantity = parseInt(session.metadata.quantity);
      const price = parseFloat(session.metadata.price);
      const email = session.metadata.email;
      const transactionId = session.payment_intent;

      // Check if already paid
      const existingPayment = await paymentsCollection.findOne({
        transactionId,
      });
      if (existingPayment) {
        return res.send({ message: "Already processed", success: true });
      }

      const payment = {
        email,
        price,
        transactionId,
        date: new Date(),
        bookingId,
        ticketId,
        quantity,
        status: "paid",
      };

      const paymentResult = await paymentsCollection.insertOne(payment);

      // Update booking status
      const bookingResult = await bookingsCollection.updateOne(
        { _id: new ObjectId(bookingId) },
        {
          $set: {
            status: "paid",
            transactionId: transactionId,
          },
        }
      );

      // Reduce ticket quantity
      const ticketResult = await ticketsCollection.updateOne(
        { _id: new ObjectId(ticketId) },
        { $inc: { quantity: -quantity } }
      );

      res.send({ success: true, paymentResult, bookingResult, ticketResult });
    } else {
      res.status(400).send({ success: false, message: "Payment not paid" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, error: error.message });
  }
};

const savePayment = async (req, res) => {
  const payment = req.body;
  const db = getDB();
  const paymentsCollection = db.collection("payments");
  const bookingsCollection = db.collection("bookings");
  const ticketsCollection = db.collection("tickets");

  const paymentResult = await paymentsCollection.insertOne(payment);

  // Update booking status
  const query = { _id: new ObjectId(payment.bookingId) };
  const updateDoc = {
    $set: {
      status: "paid",
      transactionId: payment.transactionId,
    },
  };
  const bookingResult = await bookingsCollection.updateOne(query, updateDoc);

  // Reduce ticket quantity
  const ticketQuery = { _id: new ObjectId(payment.ticketId) };
  const ticketUpdateDoc = {
    $inc: { quantity: -payment.quantity },
  };
  const ticketResult = await ticketsCollection.updateOne(
    ticketQuery,
    ticketUpdateDoc
  );

  res.send({ paymentResult, bookingResult, ticketResult });
};

module.exports = {
  createPaymentIntent,
  savePayment,
  createCheckoutSession,
  paymentSuccess,
};
