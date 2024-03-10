const handleValidationError = (err, res) => {
  const { errors } = err;
  const errMsg = {};
  Object.keys(errors).map((i) => {
    errMsg[i] = errors[i].message;
  });
  res.status(400).json(errMsg);
};

const handleCastError = (res, err) => {
  res.status(400).json({ msg: "Invalid Id" });
};

const error = (err, req, res, next) => {
  if (err.name === "ValidationError") {
    handleValidationError(err, res);
  } else if (err.name === "CastError") {
    handleCastError(res, err);
  } else {
    res.status(500).json(err);
  }
};

module.exports = error;
