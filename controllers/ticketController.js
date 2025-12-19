const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

const getApprovedTickets = async (req, res) => {
  const db = getDB();
  const ticketsCollection = db.collection("tickets");

  const { from, to, type, sort, page, limit } = req.query;

  const query = { status: "approved" };

  if (from) query.from = { $regex: from, $options: "i" };
  if (to) query.to = { $regex: to, $options: "i" };
  if (type) query.transportType = type;

  let sortOptions = {};
  if (sort === "asc") sortOptions.price = 1;
  if (sort === "desc") sortOptions.price = -1;

  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 0;
  const skip = (pageNumber - 1) * limitNumber;

  const total = await ticketsCollection.countDocuments(query);

  let cursor = ticketsCollection.find(query).sort(sortOptions);

  if (limitNumber > 0) {
    cursor = cursor.skip(skip).limit(limitNumber);
  }

  const result = await cursor.toArray();

  // Check if it's a simple request (like from Home.jsx without params)
  // To maintain backward compatibility for now, or just update Home.jsx
  // Let's return a standard structure
  res.send({ tickets: result, total });
};

const getTicketLocations = async (req, res) => {
  console.log("getTicketLocations called");
  try {
    const db = getDB();
    const ticketsCollection = db.collection("tickets");

    // Use aggregation instead of distinct because distinct is not supported in API V1 strict mode
    const fromResult = await ticketsCollection
      .aggregate([
        { $group: { _id: "$from" } },
        { $project: { _id: 0, location: "$_id" } },
      ])
      .toArray();

    const toResult = await ticketsCollection
      .aggregate([
        { $group: { _id: "$to" } },
        { $project: { _id: 0, location: "$_id" } },
      ])
      .toArray();

    const fromLocations = fromResult
      .map((item) => item.location)
      .filter(Boolean);
    const toLocations = toResult.map((item) => item.location).filter(Boolean);

    console.log("Fetched Locations (All Status):", {
      from: fromLocations,
      to: toLocations,
    });

    res.send({ from: fromLocations, to: toLocations });
  } catch (error) {
    console.error("Error in getTicketLocations:", error);
    res
      .status(500)
      .send({ message: "Internal Server Error", error: error.message });
  }
};

const getAllTicketsAdmin = async (req, res) => {
  const db = getDB();
  const ticketsCollection = db.collection("tickets");
  const result = await ticketsCollection.find().toArray();
  res.send(result);
};

const getVendorTickets = async (req, res) => {
  const email = req.params.email;
  const db = getDB();
  const ticketsCollection = db.collection("tickets");
  if (email !== req.decoded.email) {
    return res.status(403).send({ message: "forbidden access" });
  }
  const query = { vendorEmail: email };
  const result = await ticketsCollection.find(query).toArray();
  res.send(result);
};

const getTicketById = async (req, res) => {
  const id = req.params.id;
  const db = getDB();
  const ticketsCollection = db.collection("tickets");
  const query = { _id: new ObjectId(id) };
  const result = await ticketsCollection.findOne(query);
  res.send(result);
};

const createTicket = async (req, res) => {
  const ticket = req.body;
  const db = getDB();
  const ticketsCollection = db.collection("tickets");
  // Ensure verificationStatus is set if not provided, though frontend sends it
  if (!ticket.verificationStatus) {
    ticket.verificationStatus = "pending";
  }
  // 'status' might be used for other things or legacy, keeping it consistent
  ticket.status = ticket.status || "pending";
  ticket.advertised = false;
  const result = await ticketsCollection.insertOne(ticket);
  res.send(result);
};

const updateTicket = async (req, res) => {
  const id = req.params.id;
  const ticket = req.body;
  const db = getDB();
  const ticketsCollection = db.collection("tickets");
  const filter = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: {
      ...ticket,
    },
  };
  const result = await ticketsCollection.updateOne(filter, updatedDoc);
  res.send(result);
};

const deleteTicket = async (req, res) => {
  const id = req.params.id;
  const db = getDB();
  const ticketsCollection = db.collection("tickets");
  const query = { _id: new ObjectId(id) };
  const result = await ticketsCollection.deleteOne(query);
  res.send(result);
};

const updateTicketStatus = async (req, res) => {
  const id = req.params.id;
  const { status } = req.body; // Expecting 'approved' or 'rejected'
  const db = getDB();
  const ticketsCollection = db.collection("tickets");
  const filter = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: {
      status: status,
      verificationStatus: status,
    },
  };
  const result = await ticketsCollection.updateOne(filter, updatedDoc);
  res.send(result);
};

const advertiseTicket = async (req, res) => {
  const id = req.params.id;
  const { advertised } = req.body;
  const db = getDB();
  const ticketsCollection = db.collection("tickets");

  if (advertised) {
    // Check count of currently advertised tickets
    const count = await ticketsCollection.countDocuments({ advertised: true });
    if (count >= 6) {
      return res.send({
        modifiedCount: 0,
        message: "Maximum 6 tickets can be advertised at a time.",
      });
    }
  }

  const filter = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: {
      advertised: advertised,
    },
  };
  const result = await ticketsCollection.updateOne(filter, updatedDoc);
  res.send(result);
};

module.exports = {
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
};
