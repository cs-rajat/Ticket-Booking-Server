const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

const getApprovedTickets = async (req, res) => {
  const db = getDB();
  const ticketsCollection = db.collection("tickets");
  const query = { status: "approved" };
  const result = await ticketsCollection.find(query).toArray();
  res.send(result);
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
  ticket.status = "pending";
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
  const { status } = req.body;
  const db = getDB();
  const ticketsCollection = db.collection("tickets");
  const filter = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: {
      status: status,
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
};
