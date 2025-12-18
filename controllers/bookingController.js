const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

const createBooking = async (req, res) => {
  const booking = req.body;
  const db = getDB();
  const bookingsCollection = db.collection("bookings");
  booking.status = "pending";
  const result = await bookingsCollection.insertOne(booking);
  res.send(result);
};

const getUserBookings = async (req, res) => {
  const email = req.params.email;
  const db = getDB();
  const bookingsCollection = db.collection("bookings");
  if (email !== req.decoded.email) {
    return res.status(403).send({ message: "forbidden access" });
  }
  const query = { userEmail: email };
  const result = await bookingsCollection.find(query).toArray();
  res.send(result);
};

const getVendorBookings = async (req, res) => {
  const email = req.params.email;
  const db = getDB();
  const bookingsCollection = db.collection("bookings");
  const ticketsCollection = db.collection("tickets");

  if (email !== req.decoded.email) {
    return res.status(403).send({ message: "forbidden access" });
  }
  // Find tickets by this vendor
  const tickets = await ticketsCollection
    .find({ vendorEmail: email })
    .toArray();
  const ticketIds = tickets.map((ticket) => ticket._id.toString());

  // Find bookings for these tickets
  // Note: booking should store ticketId
  const query = { ticketId: { $in: ticketIds } };
  const result = await bookingsCollection.find(query).toArray();
  res.send(result);
};

const updateBookingStatus = async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;
  const db = getDB();
  const bookingsCollection = db.collection("bookings");
  const filter = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: {
      status: status,
    },
  };
  const result = await bookingsCollection.updateOne(filter, updatedDoc);
  res.send(result);
};

module.exports = {
  createBooking,
  getUserBookings,
  getVendorBookings,
  updateBookingStatus,
};
