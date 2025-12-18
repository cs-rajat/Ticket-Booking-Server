const express = require("express");
const { createToken } = require("../controllers/authController");
const router = express.Router();

router.post("/jwt", createToken);

module.exports = router;
