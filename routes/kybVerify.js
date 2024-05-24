const {
  getKYBVerificationdQR,
  kybVerificationCallback,
} = require("../controllers/KybVerify");

const router = require("express").Router();

// Route for getAuthQr

router.get("/get-qr", getKYBVerificationdQR);
router.post("/callback", kybVerificationCallback);

module.exports = router;
