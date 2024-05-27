const CredentailCreater = (
  id,
  circuitId,
  allowedIssuers,
  type,
  context,
  credentialSubject
) => {
  return {
    id: id,
    circuitId: circuitId,
    query: {
      allowedIssuers: allowedIssuers,
      type: type,
      context: context,
      credentialSubject: credentialSubject,
    },
  };
};

const CredentailCreaterNOX = (id, circuitId, allowedIssuers, type, context) => {
  return {
    id: id,
    circuitId: circuitId,
    query: {
      allowedIssuers: allowedIssuers,
      type: type,
      context: context,
    },
  };
};

const AgeCredential = (credentialSubject) =>
  CredentailCreater(
    1710071699,
    "credentialAtomicQuerySigV2",
    ["*"],
    "AgeLimitVerifier",
    "ipfs://QmRdrZwqTLwpkDHEnkuxifJGvZfovuTerJrRf6dWnZ7wkm",
    credentialSubject
  );

const KYBCredential = () =>
  CredentailCreaterNOX(
    1716534821,
    "credentialAtomicQuerySigV2",
    ["*"],
    "EcommerceKYC",
    "ipfs://QmavVepeN3Qijvfq7ieyER6sUAWTyBLVeaxyR9SjYCKJgK"
  );

const KYCCredential = () =>
  CredentailCreaterNOX(
    1716534821,
    "credentialAtomicQuerySigV2",
    ["*"],
    "EcommerceKYC",
    "ipfs://QmavVepeN3Qijvfq7ieyER6sUAWTyBLVeaxyR9SjYCKJgK"
  );

const GenderCredential = () =>
  CredentailCreater(
    1710225101,
    "credentialAtomicQuerySigV2",
    ["did:polygonid:polygon:mumbai:2qMLpQ5py1YzBTTuLEeX2yr6pDGQ7gyXAfygaPakzq"],
    "GenderDisclose",
    "ipfs://Qmf1vBLNtBp9Ki7pS3HnqVHqzW7WzBWRfP4rQcByX6ALxP",
    {
      gender: {},
    }
  );

module.exports = {
  CredentailCreater,
  AgeCredential,
  GenderCredential,
  KYBCredential,
  KYCCredential,
};
