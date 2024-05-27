const {
  getKYCVerificationdQR,
  kycVerificationCallback,
  getKYCVerificationToken,
} = require("../controllers/kycVerify");

const router = require("express").Router();

// Route for getAuthQr

router.get("/get-qr", getKYCVerificationdQR);
router.post("/callback", kycVerificationCallback);
router.get("/get-new-token", getKYCVerificationToken);

module.exports = router;
