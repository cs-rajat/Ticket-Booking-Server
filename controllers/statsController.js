const { getDB } = require("../config/db");

const getAdminStats = async (req, res) => {
  const db = getDB();
  const usersCollection = db.collection("users");
  const ticketsCollection = db.collection("tickets");
  const bookingsCollection = db.collection("bookings");

  const users = await usersCollection.estimatedDocumentCount();
  const tickets = await ticketsCollection.estimatedDocumentCount();
  const bookings = await bookingsCollection.estimatedDocumentCount();

  // best way to get sum of a field is to use aggregate
  const payments = await bookingsCollection
    .aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$price" },
        },
      },
    ])
    .toArray();

  const revenue = payments.length > 0 ? payments[0].totalRevenue : 0;

  res.send({
    users,
    tickets,
    bookings,
    revenue,
  });
};

module.exports = { getAdminStats };
