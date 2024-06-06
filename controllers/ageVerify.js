const { auth, resolver } = require("@iden3/js-iden3-auth");
const getRawBody = require("raw-body");
const asyncFunction = require("../utils/asyncCatch");
const { AgeCredential } = require("../utils/proofRequest");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { calculateBirthdate } = require("../utils");

// ================ UTILS ====================
const authRequests = new Map();
const sessionExpirations = new Map();

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
// ========================== UTILS  =====================

// =========================== CONTROLLER FOR AGE VERIFICATION GET QR CODE ==============================
const getAgeVerificationdQR = (wss) =>
  asyncFunction((req, res) => {
    // #swagger.tags = ['gender verificaion']
    const sessionId = req.query.sessionId ?? uuidv4();
    const age = req.query.age ?? 18;

    wss.emit(
      sessionId,
      socketMessage("getAuthQr", STATUS.IN_PROGRESS, sessionId)
    );

    const uri = `${process.env.HOSTED_SERVER_URL}/age-verification/callback?sessionId=${sessionId}`;

    console.log("env verifier did", process.env.VERIFIER_DID);

    const request = {
      id: sessionId,
      thid: sessionId,
      from: process.env.VERIFIER_DID,
      typ: "application/iden3comm-plain-json",
      type: "https://iden3-communication.io/authorization/1.0/request",
      body: {
        reason: "Must be born before this year",
        callbackUrl: uri,
        scope: [
          AgeCredential({
            dob: {
              $lt: calculateBirthdate(age),
            },
          }),
        ],
      },
    };

    authRequests.set(sessionId, request);

    const sessionTimer = setTimeout(() => {
      // if the session has not been completed, delete it
      if (authRequests.has(sessionId)) {
        authRequests.delete(sessionId);
        sessionExpirations.delete(sessionId);
        console.log("Session expired:", sessionId);
      }
    }, 5000);
    sessionExpirations.set(sessionId, sessionTimer);

    wss.emit(sessionId, socketMessage("getAuthQr", STATUS.DONE, request));

    return res.status(200).json(request);
  });
// =========================== CONTROLLER FOR AGE VERIFICATION GET QR CODE ==============================

// ====================== CONTROLLER FOR AGE VERIFICATION CALLBACK =======================================
const ageVerificationCallback = (wss) =>
  asyncFunction(async (req, res) => {
    // #swagger.tags = ['gender verificaion']
    const sessionId = req.query.sessionId;

    // get this session's auth request for verification
    const authRequest = authRequests.get(sessionId);
    console.log(`handleVerification for ${authRequest}`);

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
    const keyDIR = "../keys";

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
      const userId = authResponse.from;

      wss.emit(
        sessionId,
        socketMessage("handleVerification", STATUS.DONE, authResponse)
      );

      await postAgeVerification(sessionId, tokenStr);

      return res
        .status(200)
        .set("content-type", "application/json")
        .send("User" + userId + "successfully authenticated");
    } catch (error) {
      console.log(error);

      wss.emit(
        sessionId,
        socketMessage("handleVerification", STATUS.ERROR, error)
      );

      return res.status(500).send(error);
    }
  });

// post the session id, jwz and token body for age verification to the dyneum server
const postAgeVerification = async (sessionId, jwz) => {
  const url = `${process.env.DYNEUM_SERVER}/api/v1/vendor-auth/age-verification-callback/`;
  const data = {
    jwz: jwz,
    session_id: sessionId,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  await res.json();
};
// ==================== CONTROLLER FOR AGE VERIFICATION CALLBACK ===========================

module.exports = {
  getAgeVerificationdQR,
  ageVerificationCallback,
};
