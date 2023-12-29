const { verifyToken } = require("../jsonwebtoken/varifytoken");

const authenticateMiddleware = async (req, res, next) => {
  const token = req.body.token;
  try {
    const decoded = await verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = { authenticateMiddleware };
