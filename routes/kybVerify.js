const {
  getKYBVerificationdQR,
  kybVerificationCallback,
  getKYBVerificationToken,
} = require("../controllers/KybVerify");

const router = require("express").Router();

// Route for getAuthQr

router.get("/get-qr", getKYBVerificationdQR);
router.post("/callback", kybVerificationCallback);
router.get("/get-new-token", getKYBVerificationToken);

module.exports = router;
