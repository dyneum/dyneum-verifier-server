const router = require("express").Router();
const {
  getSigninPolygonIdQR,
  singinPolygonIdQR,
} = require("../controllers/auth");

module.exports = function (wsServer) {
  // Route for getAuthQr
  router.get("/signin/polygon-id", getSigninPolygonIdQR(wsServer));
  router.post("/signin/polygon-id/callback", singinPolygonIdQR(wsServer));

  // Add more routes as needed

  return router;
};
