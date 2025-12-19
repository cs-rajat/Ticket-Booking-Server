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

const getVendorStats = async (req, res) => {
  const email = req.params.email;
  const db = getDB();
  const ticketsCollection = db.collection("tickets");
  const bookingsCollection = db.collection("bookings");

  if (email !== req.decoded.email) {
    return res.status(403).send({ message: "forbidden access" });
  }

  // Find tickets by this vendor
  const vendorTickets = await ticketsCollection
    .find({ vendorEmail: email })
    .project({ _id: 1 })
    .toArray();

  const ticketIds = vendorTickets.map((ticket) => ticket._id.toString());

  // Find all bookings for these tickets
  const allBookings = await bookingsCollection
    .find({ ticketId: { $in: ticketIds } })
    .toArray();

  // Stats
  const newBookings = allBookings.length;

  // Calculate stats based on PAID bookings for revenue/sales
  // But maybe "New Bookings" implies recent activity.
  // For charts, we usually show confirmed sales.
  const paidBookings = allBookings.filter((b) => b.status === "paid");

  const totalSales = paidBookings.reduce(
    (sum, b) => sum + (b.quantity || 0),
    0
  );
  const totalRevenue = paidBookings.reduce((sum, b) => sum + (b.price || 0), 0);

  // Monthly Data
  const monthlyData = {};
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  paidBookings.forEach((booking) => {
    const date = new Date(booking.date);
    if (!isNaN(date)) {
      const monthIndex = date.getMonth();
      const monthName = monthNames[monthIndex];

      if (!monthlyData[monthName]) {
        monthlyData[monthName] = {
          name: monthName,
          sales: 0,
          revenue: 0,
          order: monthIndex,
        };
      }

      monthlyData[monthName].sales += booking.quantity || 0;
      monthlyData[monthName].revenue += booking.price || 0;
    }
  });

  // Convert to array and sort
  const chartData = Object.values(monthlyData).sort(
    (a, b) => a.order - b.order
  );

  res.send({
    totalSales,
    newBookings,
    totalRevenue,
    chartData,
  });
};

module.exports = { getAdminStats, getVendorStats };
