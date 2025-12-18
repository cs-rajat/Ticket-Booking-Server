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

const deleteUser = async (req, res) => {
  const id = req.params.id;
  const db = getDB();
  const usersCollection = db.collection("users");
  const query = { _id: new ObjectId(id) };
  const result = await usersCollection.deleteOne(query);
  res.send(result);
};

module.exports = {
  getAllUsers,
  checkAdmin,
  checkVendor,
  createUser,
  makeAdmin,
  makeVendor,
  deleteUser,
};
