const CredentailCreater = (
  id,
  circuitId,
  allowedIssuers,
  type,
  context,
  credentialSubject
) => ({
  id: id,
  circuitId: circuitId,
  query: {
    allowedIssuers: allowedIssuers,
    type: type,
    context: context,
    credentialSubject,
  },
});

const KYCAgeCredential = (credentialSubject) =>
  CredentailCreater(
    1703835396,
    "credentialAtomicQuerySigV2",
    ["did:polygonid:polygon:mumbai:2qF7hkxwVNjVruYMo1nVDEGkVNBJ6BnFBW7abEjLxA"],
    "AgeLimitVerifier",
    "ipfs://Qmb363qQVD22hLrtovowjtwsQc32vuh5RPoFiZsM3YQXFB",
    credentialSubject
  );

module.exports = {
  CredentailCreater,
  KYCAgeCredential,
};
