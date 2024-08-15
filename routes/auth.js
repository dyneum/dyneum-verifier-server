const router = require("express").Router();
const {
  getSigninPolygonIdQR,
  singinPolygonIdQR,
  loginVerifierCallback,
  didLoginInit
} = require("../controllers/auth");

module.exports = function (wsServer) {
  // Route for getAuthQr
  router.get("/signin/polygon-id/get-qr", getSigninPolygonIdQR(wsServer));
  router.post("/signin/polygon-id/callback", singinPolygonIdQR(wsServer));
  router.post("/did/login/callback", loginVerifierCallback);
  router.get("/did/login/init", didLoginInit);
  // Add more routes as needed

  return router;
};
