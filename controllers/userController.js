const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

const getAllUsers = async (req, res) => {
  const db = getDB();
  const usersCollection = db.collection("users");
  const result = await usersCollection.find().toArray();
  res.send(result);
};

const checkAdmin = async (req, res) => {
  const email = req.params.email;
  const db = getDB();
  const usersCollection = db.collection("users");

  if (email !== req.decoded.email) {
    return res.status(403).send({ message: "forbidden access" });
  }

  const query = { email: email };
  const user = await usersCollection.findOne(query);
  let admin = false;
  if (user) {
    admin = user?.role === "admin";
  }
  res.send({ admin });
};

const checkVendor = async (req, res) => {
  const email = req.params.email;
  const db = getDB();
  const usersCollection = db.collection("users");

  if (email !== req.decoded.email) {
    return res.status(403).send({ message: "forbidden access" });
  }

  const query = { email: email };
  const user = await usersCollection.findOne(query);
  let vendor = false;
  if (user) {
    vendor = user?.role === "vendor";
  }
  res.send({ vendor });
};

const createUser = async (req, res) => {
  const user = req.body;
  const db = getDB();
  const usersCollection = db.collection("users");
  const query = { email: user.email };
  const existingUser = await usersCollection.findOne(query);
  if (existingUser) {
    return res.send({ message: "user already exists", insertedId: null });
  }
  const result = await usersCollection.insertOne(user);
  res.send(result);
};

const makeAdmin = async (req, res) => {
  const id = req.params.id;
  const db = getDB();
  const usersCollection = db.collection("users");
  const filter = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: {
      role: "admin",
    },
  };
  const result = await usersCollection.updateOne(filter, updatedDoc);
  res.send(result);
};

const makeMeAdmin = async (req, res) => {
  const email = req.params.email;
  const db = getDB();
  const usersCollection = db.collection("users");
  const filter = { email: email };
  const updatedDoc = {
    $set: {
      role: "admin",
    },
  };
  const result = await usersCollection.updateOne(filter, updatedDoc);
  res.send(result);
};

const makeVendor = async (req, res) => {
  const id = req.params.id;
  const db = getDB();
  const usersCollection = db.collection("users");
  const filter = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: {
      role: "vendor",
    },
  };
  const result = await usersCollection.updateOne(filter, updatedDoc);
  res.send(result);
};

const markFraud = async (req, res) => {
  const id = req.params.id;
  const db = getDB();
  const usersCollection = db.collection("users");
  const ticketsCollection = db.collection("tickets");

  const filter = { _id: new ObjectId(id) };

  // 1. Get user to find email
  const user = await usersCollection.findOne(filter);
  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }

  // 2. Update user role to fraud
  const updatedDoc = {
    $set: {
      role: "fraud",
    },
  };
  const userResult = await usersCollection.updateOne(filter, updatedDoc);

  // 3. Hide/Reject all tickets from this vendor
  // We can set verificationStatus to 'rejected' or a new status 'blocked'
  // Requirement says "hidden from the platform". 'rejected' tickets are not shown in AllTickets.
  const ticketFilter = { vendorEmail: user.email };
  const ticketUpdate = {
    $set: {
      verificationStatus: "rejected",
      advertised: false, // Also unadvertise if they were advertised
    },
  };
  await ticketsCollection.updateMany(ticketFilter, ticketUpdate);

  res.send(userResult);
};

const deleteUser = async (req, res) => {
  const id = req.params.id;
  const db = getDB();
  const usersCollection = db.collection("users");
  const query = { _id: new ObjectId(id) };
  const result = await usersCollection.deleteOne(query);
  res.send(result);
};

const makeUser = async (req, res) => {
  const id = req.params.id;
  const db = getDB();
  const usersCollection = db.collection("users");
  const filter = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: {
      role: "user",
    },
  };
  const result = await usersCollection.updateOne(filter, updatedDoc);
  res.send(result);
};

module.exports = {
  getAllUsers,
  checkAdmin,
  checkVendor,
  createUser,
  makeAdmin,
  makeMeAdmin,
  makeVendor,
  makeUser,
  markFraud,
  deleteUser,
};
