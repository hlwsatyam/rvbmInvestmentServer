const { AdviceModel } = require("../Model/adviceModel");

const Advice = async (req, res, next) => {
    console.log()
  const { message, name, phone } = req.body;
console.log(req.body)
  try {
    const adviseMessage = new AdviceModel({
      message,
      name,
      phone,
    });
    await adviseMessage.save();
    return res.status(200).send("Thanks For Your Advice!");
  } catch (error) {
    next(ErrorCreate(error.statusCode, error.message));
  }
};

module.exports = { Advice };
