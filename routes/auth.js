const router = require("express").Router();
const {
  getSigninPolygonIdQR,
  singinPolygonIdQR,
  loginVerifierCallback,
  didLoginInit,
loginTokenRequest
} = require("../controllers/auth");

module.exports = function (wsServer) {
  // Route for getAuthQr
  router.get("/signin/polygon-id/get-qr", getSigninPolygonIdQR(wsServer));
  router.post("/signin/polygon-id/callback", singinPolygonIdQR(wsServer));
  router.post("/did/login/callback", loginVerifierCallback);
  router.get("/did/login/init", didLoginInit);
router.get("/did/login/token", loginTokenRequest);
  // Add more routes as needed

  return router;
};
