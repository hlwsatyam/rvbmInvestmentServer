const { verifyToken } = require("../jsonwebtoken/varifytoken");

const authenticateMiddleware = async (req, res, next) => {
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ODkyZWEzMzc5MjA5NTVmZmNlZGU2ZiIsImlhdCI6MTcwMzQ5NjkyMCwiZXhwIjoxNzAzNTAwNTIwfQ.mrPB0z2wLy-JXpkH3T94O67wSoRsPA8XYiNb6lPmUqE";
  // const token = req.body.token;
  try {
    const decoded = await verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};
 
module.exports = { authenticateMiddleware };
