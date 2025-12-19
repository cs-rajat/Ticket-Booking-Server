const express = require("express");
const {
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
} = require("../controllers/userController");
const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/", verifyToken, verifyAdmin, getAllUsers);
router.get("/test-admin/:email", makeMeAdmin);
router.get("/admin/:email", verifyToken, checkAdmin);
router.get("/vendor/:email", verifyToken, checkVendor);
router.post("/", createUser);
router.patch("/admin/:id", verifyToken, verifyAdmin, makeAdmin);
router.patch("/vendor/:id", verifyToken, verifyAdmin, makeVendor);
router.patch("/user/:id", verifyToken, verifyAdmin, makeUser);
router.patch("/fraud/:id", verifyToken, verifyAdmin, markFraud);
router.delete("/:id", verifyToken, verifyAdmin, deleteUser);

module.exports = router;
