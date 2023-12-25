const { ErrorCreate } = require("../Errors/createError");
const { ClientModel } = require("../Model/clientDetail");
const { ClientFinanceModel } = require("../Model/clientFinanceDetail");
const { ClientBankModel } = require("../Model/clientBankDetail");
const crypto = require("crypto");
const aadhaarVerification = async (req, res, next) => {
  const client = req.user;
  const { pan_number, aadhaar, otp, session_id } = req.body;
  console.log(req.body);
  try {
    const consent = process.env.CONSENT;
    const purpose = process.env.PURPOSE;
    const headers = {
      "client-id": process.env.CLIENT_ID,
      "x-api-key": process.env.X_API_KEY,
    };
    function convertToUpperCaseWithNumbers(pan_number) {
      let result = "";

      for (let i = 0; i < pan_number.length; i++) {
        const char = pan_number[i];
        if (/[a-z]/.test(char)) {
          result += char.toUpperCase();
        } else {
          result += char;
        }
      }

      return result;
    }
    function generateUniqueCode(aadhaarNumber, uniqueCode) {
      const inputString = `${aadhaarNumber}-${uniqueCode}`;
      const hash = crypto
        .createHash("sha256")
        .update(inputString)
        .digest("hex");
      return hash.substr(0, 20);
    }

    await fetch(
      `https://production.deepvue.tech/v1/ekyc/aadhaar/verify-otp?otp=${otp}&session_id=${session_id}&consent=${consent}&purpose=${purpose}`,
      {
        method: "POST",
        headers: headers,
      }
    )
      .then((data) => data.json())
      .then(async (data) => {
        if (data.code == 200) {
          try {
            const user = await ClientModel.findByIdAndUpdate(
              client.id,
              {
                pan_number: convertToUpperCaseWithNumbers(pan_number),
                fd_number: generateUniqueCode(aadhaar, process.env.FD_CODE),
                aadhaar,
                is_KYC_completed: true,
                step: 1,
                aadhaar_details: data.data,
              },
              { new: true }
            );
            return res.status(200).json({ message: "KYC done!", code: 200 });
          } catch (error) {
            next(ErrorCreate(error.statusCode, error.message));
          }
        } else {
          next(ErrorCreate(404, "otp itp is invalid!"));
        }
      });
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
          step: 1,
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
const getAadhaarFromUser = async (req, res, next) => {
  const client = req.user;
  const { aadhaar, captcha, session_id } = req.body;
  console.log(req.body);
  try {
    const consent = process.env.CONSENT;
    const purpose = process.env.PURPOSE;
    const headers = {
      "client-id": process.env.CLIENT_ID,
      "x-api-key": process.env.X_API_KEY,
    };
    await fetch(
      `https://production.deepvue.tech/v1/ekyc/aadhaar/generate-otp?aadhaar_number=${aadhaar}&captcha=${captcha}&session_id=${session_id}&consent=${consent}&purpose=${purpose}`,
      {
        method: "POST",
        headers: headers,
      }
    )
      .then((data) => data.json())
      .then((data) => {
        if (data.code == 200) {
          return res.status(200).send(data);
        } else {
          next(ErrorCreate(503, "Server Internal Error"));
        }
      });
  } catch (error) {
    next(ErrorCreate(error.statusCode, error.message));
  }
};
const aadhaarKycInitialization = async (req, res, next) => {
  const client = req.user;

  try {
    const consent = process.env.CONSENT;
    const purpose = process.env.PURPOSE;
    const headers = {
      "client-id": process.env.CLIENT_ID,
      "x-api-key": process.env.X_API_KEY,
    };
    const url = `https://production.deepvue.tech/v1/ekyc/aadhaar/connect?consent=${consent}&purpose=${purpose}`;

    await fetch(url, {
      method: "GET",
      headers: headers,
    })
      .then((data) => data.json())
      .then(async (data) => {
        if (data.code == 200) {
          return res.status(200).send(data);
        } else {
          next(ErrorCreate(503, "Server Internal Error"));
        }
      });
  } catch (error) {
    next(ErrorCreate(error.statusCode, error.message));
  }
};
const getRelodedCaptcha = async (req, res, next) => {
  const client = req.user;
  const { session_id } = req.body;

  try {
    const consent = process.env.CONSENT;
    const purpose = process.env.PURPOSE;
    const headers = {
      "client-id": process.env.CLIENT_ID,
      "x-api-key": process.env.X_API_KEY,
    };
    const url = `https://production.deepvue.tech/v1/ekyc/aadhaar/reload-captcha?consent=${consent}&purpose=${purpose}&session_id=${session_id}`;

    await fetch(url, {
      method: "GET",
      headers: headers,
    })
      .then((data) => data.json())
      .then(async (data) => {
        if (data.code == 200) {
          return res.status(200).send(data);
        } else {
          next(ErrorCreate(503, "Server Internal Error"));
        }
      });
  } catch (error) {
    next(ErrorCreate(error.statusCode, error.message));
  }
};
module.exports = {
  getRelodedCaptcha,
  financeVerification,
  bankVerification,
  aadhaarVerification,
  personalVerification,
  userDetails,
  getAadhaarFromUser,
  aadhaarKycInitialization,
};
