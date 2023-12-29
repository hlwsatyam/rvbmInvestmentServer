const express = require("express");
const {
  createUser,
  loginAdmin,
} = require("../Controllers/processInitialization");
const { authenticateMiddleware } = require("../Controllers/authentication");
const {
  bankVerification,
  aadhaarVerification,
  personalVerification,
  financeVerification,
  userDetails,
  getAadhaarFromUser,
  aadhaarKycInitialization,
  getRelodedCaptcha,
} = require("../Controllers/Process");
const { fetchingDataFromAdmin } = require("../Controllers/admin");
const { Advice } = require("../Controllers/advice");

const router = express.Router();
router.post("/admininialization", loginAdmin);
router.post("/getuserdatafromAdminReq", fetchingDataFromAdmin);

router.post("/inialization", createUser);

router.post(
  "/aadhaarkycinitialization",
  authenticateMiddleware,
  aadhaarKycInitialization
);
router.post(
  "/getaadhaarnumberforkyc",
  authenticateMiddleware,
  getAadhaarFromUser
);
router.post("/reloadkyccaptcha", authenticateMiddleware, getRelodedCaptcha);

router.post(
  "/aadhaarverification",
  authenticateMiddleware,
  aadhaarVerification
);
router.post(
  "/personalverification",
  authenticateMiddleware,
  personalVerification
);
router.post("/bankverification", authenticateMiddleware, bankVerification);
router.post(
  "/financeverification",
  authenticateMiddleware,
  financeVerification
);
router.post("/", authenticateMiddleware, userDetails);
router.post("/advice", Advice);

module.exports = router;
