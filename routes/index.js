const express = require("express");
const { createUser } = require("../Controllers/processInitialization");
const authenticateMiddleware = require("../Controllers/authentication");
const {
  bankVerification,
  pandVerification,
  personalVerification,
  financeVerification,
  userDetails,
} = require("../Controllers/Process");

const router = express.Router();

router.post("/inialization", createUser);

router.post("/panverification", authenticateMiddleware, pandVerification);
router.post(
  "/personalverification",
  authenticateMiddleware,
  personalVerification
);
router.post("/bankverification", authenticateMiddleware, bankVerification);
router.post("/bankverification", authenticateMiddleware, bankVerification);
router.post(
  "/financeverification",
  authenticateMiddleware,
  financeVerification
);
router.post("/", authenticateMiddleware, userDetails);

module.exports = router;
