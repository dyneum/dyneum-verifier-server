const { auth, resolver } = require("@iden3/js-iden3-auth");
const getRawBody = require("raw-body");
const asyncFunction = require("../utils/asyncCatch");
const { KYBCredential } = require("../utils/proofRequest");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// ================ UTILS ====================
const authRequests = new Map();
const sessionExpirations = new Map();

// ========================== UTILS  =====================

// =========================== CONTROLLER FOR AGE VERIFICATION GET QR CODE ==============================
const getKYBVerificationdQR = asyncFunction((req, res) => {
  // #swagger.tags = ['gender verificaion']
  const sessionId = req.query.sessionId ?? uuidv4();

  const uri = `${process.env.HOSTED_SERVER_URL}/kyb-verification/callback?sessionId=${sessionId}`;

  const request = {
    id: sessionId,
    thid: sessionId,
    from: "did:polygonid:polygon:mumbai:2qDyy1kEo2AYcP3RT4XGea7BtxsY285szg6yP9SPrs",
    typ: "application/iden3comm-plain-json",
    type: "https://iden3-communication.io/authorization/1.0/request",
    body: {
      reason: "KYB Verification",
      callbackUrl: uri,
      scope: [KYBCredential()],
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

  return res.status(200).json(request);
});
// =========================== CONTROLLER FOR AGE VERIFICATION GET QR CODE ==============================

// ====================== CONTROLLER FOR AGE VERIFICATION CALLBACK =======================================
const kybVerificationCallback = asyncFunction(async (req, res) => {
  // #swagger.tags = ['gender verificaion']
  const sessionId = req.query.sessionId;

  // get this session's auth request for verification
  const authRequest = authRequests.get(sessionId);
  console.log(`handleVerification for ${sessionId}`);

  // get JWZ token params from the post request
  const raw = await getRawBody(req);
  const tokenStr = raw.toString().trim();

  // The CredentialAtomicQuerySigValidator contract is used to verify any credential-related zk proof
  // generated by the user using the credentialAtomicQuerySigV2OnChain circuit.
  // https://0xpolygonid.github.io/tutorials/contracts/overview/#blockchain-addresses
  const mumbaiContractAddress = "0x134B1BE34911E39A8397ec6289782989729807a4";
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
    ipfsGatewayURL: "https://ipfs.io",
  });

  try {
    const opts = {
      AcceptedStateTransitionDelay: 5 * 60 * 1000, // up to a 5 minute delay accepted by the Verifier
    };
    const authResponse = await verifier.fullVerify(tokenStr, authRequest, opts);
    const userId = authResponse.from;

    // await postKYBVerification(sessionId, tokenStr);

    return res
      .status(200)
      .set("content-type", "application/json")
      .send("User" + userId + "successfully authenticated");
  } catch (error) {
    console.log(error);

    return res.status(500).send(error);
  }
});

// post the session id, jwz and token body for age verification to the dyneum server
const postKYBVerification = async (sessionId, jwz) => {
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
  getKYBVerificationdQR,
  kybVerificationCallback,
};
