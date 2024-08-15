const { auth, resolver } = require("@iden3/js-iden3-auth");
const getRawBody = require("raw-body");
const asyncFunction = require("../utils/asyncCatch");
const { KYCAgeCredential } = require("../utils/proofRequest");
const path = require("path");

// ================ UTILS FUNCTIONS ================
const authRequests = new Map();

const STATUS = {
  IN_PROGRESS: "IN_PROGRESS",
  ERROR: "ERROR",
  DONE: "DONE",
};

const socketMessage = (fn, status, data) => ({
  fn,
  status,
  data,
});
// ================ UTILS FUNCTIONS ================

// ===================== controller for polygon signin get QR code =======================
const getSigninPolygonIdQR = (wss) =>
  asyncFunction((req, res) => {
    // #swagger.tags = ['auth']
    const sessionId = req.query.sessionId;
    console.log("getAuthQr for", sessionId);

    wss.emit(
      sessionId,
      socketMessage("getAuthQr", STATUS.IN_PROGRESS, sessionId)
    );

    const uri = `${process.env.HOSTED_SERVER_URL}/signin/polygon-id/callback/?sessionId=${sessionId}`;

    const request = auth.createAuthorizationRequest(
      "Must be born before this year",
      process.env.VERIFIER_DID,
      uri
    );

    request.id = sessionId;
    request.thid = sessionId;

    const credentialSubject = {
      dob: {
        $eq: 18,
      },
    };

    const scope = request.body.scope ?? [];
    request.body.scope = [...scope, KYCAgeCredential(credentialSubject)];

    authRequests.set(sessionId, request);

    wss.emit(sessionId, socketMessage("getAuthQr", STATUS.DONE, request));

    return res.status(200).json(request);
  });

// ===================== controller for polygon signin get QR code =======================

// ===================== controller for polygon signin callback ==========================
const singinPolygonIdQR = (wss) =>
  asyncFunction(async (req, res) => {
    // #swagger.tags = ['auth']
    const sessionId = req.query.sessionId;

    // get this session's auth request for verification
    const authRequest = authRequests.get(sessionId);
    console.log(`handleVerification for ${sessionId}`);
    authRequests.delete(sessionId);

    wss.emit(
      sessionId,
      socketMessage("handleVerification", STATUS.IN_PROGRESS, authRequest)
    );

    // get JWZ token params from the post request
    const raw = await getRawBody(req);
    const tokenStr = raw.toString().trim();

    // The CredentialAtomicQuerySigValidator contract is used to verify any credential-related zk proof
    // generated by the user using the credentialAtomicQuerySigV2OnChain circuit.
    // https://0xpolygonid.github.io/tutorials/contracts/overview/#blockchain-addresses
    const mumbaiContractAddress = "0x1a4cC30f2aA0377b0c3bc9848766D90cb4404124";
    const keyDIR = "./keys";

    const ethStateResolver = new resolver.EthStateResolver(
      process.env.RPC_URL_MUMBAI,
      mumbaiContractAddress
    );

    const resolvers = {
      ["polygon:amoy"]: ethStateResolver,
    };

    const verifier = await auth.Verifier.newVerifier({
      stateResolver: resolvers,
      circuitsDir: path.join(__dirname, keyDIR),
      ipfsGatewayURL: process.env.IPFS_GATEWAY,
    });

    try {
      const opts = {
        AcceptedStateTransitionDelay: 5 * 60 * 1000, // up to a 5 minute delay accepted by the Verifier
      };
      const authResponse = await verifier.fullVerify(
        tokenStr,
        authRequest,
        opts
      );
      const userId = authResponse.from ?? "unknown";

      wss.emit(
        sessionId,
        socketMessage("handleVerification", STATUS.DONE, authResponse)
      );

      // TODO: call python server (dyneum server)
      fetch("dyneum-server/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authResponse: authResponse,
          sessionId: sessionId,
        }),
      }).then((res) => {
        return res
          .status(200)
          .set("content-type", "application/json")
          .send("User" + userId + "successfully authenticated");
      });
    } catch (error) {
      console.log(error);

      wss.emit(
        sessionId,
        socketMessage("handleVerification", STATUS.ERROR, error)
      );

      return res.status(500).send(error);
    }
  });

// ===================== controller for polygon signin callback ==========================

// =====================
const didLoginInit = (req, res, next) => {
  // Define the verification request

  const sessionId = "0123456789"

  const verificationRequest = {
    backUrl: "http://localhost/3000",
    finishUrl: "http://localhost/3000/finish?sessionId="+sessionId,
    logoUrl: "https://my-app.org/logo.png",
    name: "Dyneum",
    zkQueries: [
      {
        circuitId: "credentialAtomicQuerySigV2",
        id: 1711399135,
        query: {
          allowedIssuers: [
            "did:iden3:privado:main:2ScrbEuw9jLXMapW3DELXBbDco5EURzJZRN1tYj7L7",
          ],
          context:
            "https://raw.githubusercontent.com/anima-protocol/claims-polygonid/main/schemas/json-ld/pol-v1.json-ld",
          type: "AnimaProofOfLife",
          credentialSubject: {
            human: {
              $eq: true,
            },
          },
        },
      },
    ],
    callbackUrl: "https://dev.api.verifier.dyneum.io/auth/did/login/callback?sessionId="+sessionId,
    verifierDid:
      "did:iden3:privado:main:28itzVLBHnMJV8sdjyffcAtWCx8HZ7btdKXxs7fJ6v",
  };

  // Encode the verification request to base64
  const base64EncodedVerificationRequest = btoa(
    JSON.stringify(verificationRequest)
  );

  // Open the Polygon ID Verification Web Wallet with the encoded verification request
  return res
    .status(200)
    .json({
      url: `https://wallet.privado.id/#${base64EncodedVerificationRequest}`
   });
};

const loginVerifierCallback = async (req, res, next) => {
  console.log(req.body)
  return res.status(200).json({
    message: "Login successful",
  });
};

module.exports = {
  getSigninPolygonIdQR,
  singinPolygonIdQR,
  loginVerifierCallback,
  didLoginInit,
};
