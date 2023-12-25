const jwt = require("jsonwebtoken");
const { ErrorCreate } = require("../Errors/createError.js");
const { ClientModel } = require("../Model/clientDetail.js");
const createUser = async (req, res, next) => {
  const { phone, email, postal } = req.body;
  console.log(phone, email, postal);

  let existuser;
  try {
    existuser = await ClientModel.findOne({
      $or: [{ phone_number: phone }],
    });

    if (existuser) {
      const token = jwt.sign({ id: existuser._id }, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });
      return res.status(200).json({ token });
    }
    const User = new ClientModel({
      email,
      phone_number: phone,
      postal,
    });
    const user = await User.save();
    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });
    return res.status(200).json({ token });
  } catch (error) {
    console.log(error);
    next(ErrorCreate(503, "Server Internal Error!"));
  }
};

const loginAdmin = async (req, res, next) => {
  const { email, password } = req.body;
  if (email == "info@rvbmuniverse" && password == "12345") {
    return res.status(200).json({ isAdminLogged: true });
  }
  return res.status(404).json({ isAdminLogged: false });
};

module.exports = { createUser, loginAdmin };
