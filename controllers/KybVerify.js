const { auth, resolver } = require("@iden3/js-iden3-auth");
const getRawBody = require("raw-body");
const asyncFunction = require("../utils/asyncCatch");
const { KYBCredential } = require("../utils/proofRequest");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// ================ UTILS ====================
const authRequests = new Map();
const sessionExpirations = new Map();
const authSessions = new Map();

const responseSessions = new Map();
const responseSessionExpirations = new Map();

// ========================== UTILS  =====================

// =========================== CONTROLLER FOR AGE VERIFICATION GET QR CODE ==============================
const getKYBVerificationdQR = asyncFunction((req, res) => {
  // #swagger.tags = ['gender verificaion']
  const sessionId = req.query.sessionId ?? uuidv4();
  const tenant_id = req.query.tenant_id;
  const authorization = req.headers["authorization"];

  const uri = `${process.env.HOSTED_SERVER_URL}/kyb-verification/callback?sessionId=${sessionId}&tenant_id=${tenant_id}`;

  const request = {
    id: sessionId,
    thid: sessionId,
    from: process.env.VERIFIER_DID,
    typ: "application/iden3comm-plain-json",
    type: "https://iden3-communication.io/authorization/1.0/request",
    body: {
      reason: "KYB Verification",
      callbackUrl: uri,
      scope: [KYBCredential()],
    },
  };

  authRequests.set(sessionId, request);
  authSessions.set(sessionId, authorization);
  responseSessions.set(authorization, "");

  const sessionTimer = setTimeout(() => {
    // if the session has not been completed, delete it
    if (authRequests.has(sessionId)) {
      authRequests.delete(sessionId);
      authSessions.delete(sessionId);
      sessionExpirations.delete(sessionId);
      responseSessions.delete(authorization);
      responseSessionExpirations.delete(authorization);
      console.log("Session expired:", sessionId);
    }
  }, 300000);
  sessionExpirations.set(sessionId, sessionTimer);

  return res.status(200).json(request);
});
// =========================== CONTROLLER FOR AGE VERIFICATION GET QR CODE ==============================

// ====================== CONTROLLER FOR AGE VERIFICATION CALLBACK =======================================
const kybVerificationCallback = asyncFunction(async (req, res) => {
  // #swagger.tags = ['gender verificaion']
  const sessionId = req.query.sessionId;
  const authorization = authSessions.get(sessionId);
  const tenant_id = req.query.tenant_id;

  console.log(sessionId, authorization, tenant_id);

  // get this session's auth request for verification
  const authRequest = authRequests.get(sessionId);

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

    const authResponse = await verifier.fullVerify(tokenStr, authRequest, opts);
    console.log("tala");
    const userId = authResponse.from;

    const response = await postKYBVerification(
      sessionId,
      tokenStr,
      authorization,
      tenant_id
    );

    if (responseSessions.has(authorization)) {
      responseSessions.set(authorization, response);

      authRequests.delete(sessionId);
      authSessions.delete(sessionId);
      sessionExpirations.delete(sessionId);
    }

    return res
      .status(200)
      .set("content-type", "application/json")
      .send("User" + userId + "successfully authenticated");
  } catch (error) {
    console.log(error, "k error aako hora");

    return res.status(500).send("catch bata ayo");
  }
});

// post the session id, jwz and token body for age verification to the dyneum server
const postKYBVerification = async (
  sessionId,
  jwz,
  authorization,
  tenant_id
) => {
  const url = `${process.env.DYNEUM_SERVER}/api/v1/vendor-auth/kyb-verification-callback/`;
  const data = {
    jwz_token: jwz,
    session_id: sessionId,
    tenant_id: tenant_id,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: authorization,
      "Ngrok-Skip-Browser-Warning": "true",
    },
    body: JSON.stringify(data),
  });

  // console.log(getRawBody(res));
  console.log(res.status);

  const returnData = await res.json();

  return returnData;
};
// ==================== CONTROLLER FOR AGE VERIFICATION CALLBACK ===========================

const getKYBVerificationToken = asyncFunction(async (req, res) => {
  const authorization = req.headers.authorization;

  if (responseSessions.has(authorization)) {
    const data = responseSessions.get(authorization);

    if (data) {
      res.status(200).json({
        status: "success",
        data: data,
      });

      responseSessions.delete(authorization);
      responseSessionExpirations.delete(authorization);
    } else {
      res.status(200).json({
        status: "pending",
        data: null,
      });
    }
  } else {
    res.status(400).json({
      status: "Not Found",
      data: null,
    });
  }
});

module.exports = {
  getKYBVerificationdQR,
  kybVerificationCallback,
  getKYBVerificationToken,
};
