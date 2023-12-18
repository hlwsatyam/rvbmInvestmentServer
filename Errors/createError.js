const ErrorCreate = (status, message) => {
  const error = new Error();
  error.status = status;
  error.message = message;
  return error;
};
3;

const ErrorController = (err, req, res, next) => {
  const status = err.status || 503;
  const message = err.message || "Something went worng!!";
  return res
    .status(status)
    .json({ statusCode: status, status: false, message });
};

module.exports = { ErrorCreate, ErrorController };
