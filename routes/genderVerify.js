const router = require("express").Router();
const {
  getGenderVerificationdQR,
  genderVerificationCallback,
} = require("../controllers/genderVerify");

module.exports = function (wsServer) {
  // Route for getAuthQr

  router.get("/get-qr", getGenderVerificationdQR(wsServer));
  router.post("/callback", genderVerificationCallback(wsServer));

  // Add more routes as needed
  return router;
};
