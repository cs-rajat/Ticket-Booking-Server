const jwt = require("jsonwebtoken");
const { getDB } = require("../config/db");

const verifyToken = (req, res, next) => {
  console.log("inside verify token", req.headers.authorization);
  if (!req.headers.authorization) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = req.headers.authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};

const verifyAdmin = async (req, res, next) => {
  const email = req.decoded.email;
  const db = getDB();
  const usersCollection = db.collection("users");
  const query = { email: email };
  const user = await usersCollection.findOne(query);
  const isAdmin = user?.role === "admin";
  if (!isAdmin) {
    return res.status(403).send({ message: "forbidden access" });
  }
  next();
};

const verifyVendor = async (req, res, next) => {
  const email = req.decoded.email;
  const db = getDB();
  const usersCollection = db.collection("users");
  const query = { email: email };
  const user = await usersCollection.findOne(query);
  const isVendor = user?.role === "vendor";
  if (!isVendor) {
    return res.status(403).send({ message: "forbidden access" });
  }
  next();
};

const verifyAdminOrVendor = async (req, res, next) => {
  const email = req.decoded.email;
  const db = getDB();
  const usersCollection = db.collection("users");
  const query = { email: email };
  const user = await usersCollection.findOne(query);
  const isAllowed = user?.role === "admin" || user?.role === "vendor";
  if (!isAllowed) {
    return res.status(403).send({ message: "forbidden access" });
  }
  next();
};

module.exports = {
  verifyToken,
  verifyAdmin,
  verifyVendor,
  verifyAdminOrVendor,
};
