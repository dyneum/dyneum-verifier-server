const router = require("express").Router();
const {
  getAgeVerificationdQR,
  ageVerificationCallback,
} = require("../controllers/ageVerify");

module.exports = function (wsServer) {
  // Route for getAuthQr

  router.get("/get-qr", getAgeVerificationdQR(wsServer));
  router.post("/callback", ageVerificationCallback(wsServer));

  // Add more routes as needed
  return router;
};
