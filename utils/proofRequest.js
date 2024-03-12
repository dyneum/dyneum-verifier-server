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

const AgeCredential = (credentialSubject) =>
  CredentailCreater(
    1710071699,
    "credentialAtomicQuerySigV2",
    ["*"],
    "AgeLimitVerifier",
    "ipfs://QmRdrZwqTLwpkDHEnkuxifJGvZfovuTerJrRf6dWnZ7wkm",
    credentialSubject
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
};
