const router = require("express").Router();
const {
  getSignupPolygonIdQR,
  singupPolygonIdQR,
} = require("../controllers/ageVerify");

module.exports = function (wsServer) {
  // Route for getAuthQr
  router.get("/age-verification", getSignupPolygonIdQR(wsServer));
  router.post("/age-verification", singupPolygonIdQR(wsServer));

  // Add more routes as needed
  return router;
};
