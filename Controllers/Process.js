const { ErrorCreate } = require("../Errors/createError");
const { ClientModel } = require("../Model/clientDetail");
const { ClientFinanceModel } = require("../Model/clientFinanceDetail");
const { ClientBankModel } = require("../model/clientBankDetail");
const pandVerification = async (req, res, next) => {
  const client = req.user;
  const { pan_details, aadhaar } = req.body;

  try {
    const user = await ClientModel.findByIdAndUpdate(
      client.id,
      {
        pan_details,
        aadhaar,
        step: 1,
      },
      { new: true }
    );
    return res.status(200).send(user);
  } catch (error) {
    next(ErrorCreate(error.statusCode, error.message));
  }
};
const personalVerification = async (req, res, next) => {
  const client = req.user;
  const { full_name, email, phone_number, current_address, permanent_address } =
    req.body;

  try {
    const user = await ClientModel.findByIdAndUpdate(
      client.id,
      {
        full_name,
        email,
        phone_number,
        current_address,
        permanent_address,
        step: 2,
      },
      { new: true }
    );
    return res.status(200).send(user);
  } catch (error) {
    next(ErrorCreate(error.statusCode, error.message));
  }
};

const bankVerification = async (req, res, next) => {
  const client = req.user;
  const {
    accountHolder,
    accountHolderAccount,
    accountHolderBranch,
    accountHolderBank,
    accountHolderIfsc,
    accountHolderCheck,
  } = req.body;

  try {
    const ClientBank = new ClientBankModel({
      accountHolder,
      accountHolderAccount,
      accountHolderBranch,
      accountHolderBank,
      accountHolderIfsc,
      accountHolderCheck,
      client_details: client.id,
    });
    await ClientBank.save();
    const user = await ClientModel.findByIdAndUpdate(
      client.id,
      {
        step: 3,
        banks_details: await ClientBank.save(),
      },
      { new: true }
    );
    return res.status(200).send(user);
  } catch (error) {
    console.log(error);
    next(ErrorCreate(error.statusCode, error.message));
  }
};
const financeVerification = async (req, res, next) => {
  const client = req.user;

  const { initialAmount, maturity_time, CAGR, returnedAmount, totalEarnings } =
    req.body;
  
  try { 
    const ClientFinance = new ClientFinanceModel({
      initialAmount,
      maturity_time,  
      CAGR,
      returnedAmount,
      totalEarnings,
      client_details: client.id,
    });
    const finace = await ClientFinance.save();
    const user = await ClientModel.findByIdAndUpdate(
      client.id,
      {
        $set: {
          step: 4,
        },
        $push: {
          finance_details: finace,
        },
      },
      { new: true }
    );
    return res.status(200).send(user);
  } catch (error) {
    console.log(error);
    next(ErrorCreate(error.statusCode, error.message));
  }
};
const userDetails = async (req, res, next) => {
  const client = req.user;

  try {
    const user = await ClientModel.findById(client.id)
      .populate({
        path: "finance_details",
        model: "clientfinance",
      })
      .populate("banks_details")
      .exec();
    return res.status(200).send(user);
  } catch (error) {
    next(ErrorCreate(error.statusCode, error.message));
  }
};
module.exports = {
  financeVerification,
  bankVerification,
  pandVerification,
  personalVerification,
  userDetails,
};
