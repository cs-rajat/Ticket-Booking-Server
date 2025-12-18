const express = require("express");
const {
  getAllUsers,
  checkAdmin,
  checkVendor,
  createUser,
  makeAdmin,
  makeVendor,
  deleteUser,
} = require("../controllers/userController");
const {
  verifyToken,
  verifyAdmin,
} = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/", verifyToken, verifyAdmin, getAllUsers);
router.get("/admin/:email", verifyToken, checkAdmin);
router.get("/vendor/:email", verifyToken, checkVendor);
router.post("/", createUser);
router.patch("/admin/:id", verifyToken, verifyAdmin, makeAdmin);
router.patch("/vendor/:id", verifyToken, verifyAdmin, makeVendor);
router.delete("/:id", verifyToken, verifyAdmin, deleteUser);

module.exports = router;
