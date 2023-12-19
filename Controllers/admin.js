const { ErrorCreate } = require("../Errors/createError");
const { ClientModel } = require("../Model/clientDetail");

const { default: mongoose } = require("mongoose");

const fetchingDataFromAdmin = async (req, res, next) => {
  const client = req.user;
  const { isAdminLogged, page } = req.body;
  const pageSize = 20;
  const skip = (page - 1) * 1;
  try {
    if (isAdminLogged) {
      const user = await ClientModel.find()
        .sort({ timestampField: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate("banks_details")
        .populate({
          path: "finance_details",
          model: "clientfinance",
        })
        .exec();
      return res.status(200).send(user);
    }
  } catch (error) {
    next(ErrorCreate(error.statusCode, error.message));
  }
};
module.exports = { fetchingDataFromAdmin };
