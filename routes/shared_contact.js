const express = require("express");
const auth = require("../middleware/auth");
const {
  shared_contact,
  shared_on_off,
} = require("../controllers/shared_contact");

const router = express.Router();

router.route("/").post(auth, shared_contact);
router.route("/on_off").post(auth, shared_on_off);
module.exports = router;
