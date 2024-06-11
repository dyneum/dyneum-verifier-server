const router = require("express").Router();
const { ageVerifiyController } = require("../controllers/ageVerify");

module.exports = function (wsServer) {
  // Route for getAuthQr

  router.get(
    "/get-qr",
    ageVerifiyController(wsServer).getAgeVerificationdQR(wsServer)
  );
  router.post(
    "/callback",
    ageVerifiyController(wsServer).ageVerificationCallback(wsServer)
  );

  // Add more routes as needed
  return router;
};
