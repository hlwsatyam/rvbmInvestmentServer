const { ErrorCreate } = require("../Errors/createError");
const { ClientModel } = require("../Model/clientDetail");
const { ClientFinanceModel } = require("../Model/clientFinanceDetail");
const { ClientBankModel } = require("../Model/clientBankDetail");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const {
  generateUniqueCode,
  convertToUpperCaseWithNumbers,
  headers,
} = require("../SupportiveJsFunction/ControllersSupport");
// const aadhaarVerification = async (req, res, next) => {
//   const client = req.user;
//   const { pan_number, aadhaar, otp, session_id } = req.body;
//   console.log(req.body);
//   let existUser;

//   try {
//     existUser = await ClientModel.findOne({
//       $or: [{ aadhaar: aadhaar }, { pan_number: pan_number }],
//     });

//     if (existUser) {
//       if (existUser._id == client.id) {
//         console.log("existUser", existUser);
//         await ClientModel.findByIdAndUpdate(client.id, {
//           step: 1,
//         });
//         return res
//           .status(200)
//           .json({ message: "already KYC done!", code: 200 });
//       }
//       if (existUser._id !== client.id) {
//         return res
//           .status(400)
//           .json({ message: "not authrized preson", code: 400 });
//       }
//     }
//   } catch (error) {
//     console.log("error in first tyry", error);
//     next(ErrorCreate(error.statusCode, error.message));
//   }

//   try {
//     const consent = process.env.CONSENT;
//     const purpose = process.env.PURPOSE;

//     await fetch(
//       `https://production.deepvue.tech/v1/ekyc/aadhaar/verify-otp?otp=${otp}&session_id=${session_id}&consent=${consent}&purpose=${purpose}`,
//       {
//         method: "POST",
//         headers: headers,
//       }
//     )
//       .then((data) => data.json())
//       .then(async (data) => {
//         console.log(data);
//         if (data.code == 200) {
//           let checkUser;
//           checkUser = await ClientModel.findById(client.id);
//           try {
//             if (checkUser) {
//               if (!checkUser.is_KYC_completed) {
//                 const user = await ClientModel.findByIdAndUpdate(
//                   client.id,
//                   {
//                     pan_number: convertToUpperCaseWithNumbers(pan_number),
//                     customer_id: generateUniqueCode(
//                       aadhaar,
//                       process.env.FD_CODE
//                     ),
//                     aadhaar,
//                     is_KYC_completed: true,
//                     step: 1,
//                     aadhaar_details: data.data,
//                   },
//                   { new: true }
//                 );
//                 return res
//                   .status(200)
//                   .json({ message: "KYC done!", code: 200 });
//               }
//             } else {
//               try {
//                 const ChildUser = new ClientModel({
//                   full_name: data.data.name,
//                   email: data.data.email,
//                   postal: parseInt(data.data.address.pin, 10),
//                   pan_number: convertToUpperCaseWithNumbers(pan_number),
//                   client_id: generateUniqueCode(
//                     aadhaar,
//                     process.env.FD_CODE,
//                     0
//                   ),
//                   aadhaar,
//                   is_KYC_completed: true,
//                   step: 1,
//                   aadhaar_details: data.data,
//                 });
//                 const newuser = await ChildUser.save();
//                 checkUser.familyfd_details.push(newuser);
//                 await checkUser.save();
//                 const token = jwt.sign(
//                   { id: newuser._id },
//                   process.env.SECRET_KEY,
//                   {
//                     expiresIn: "1h",
//                   }
//                 );
//                 return res
//                   .status(200)
//                   .json({ message: "KYC done!", code: 200, token });
//               } catch (error) {
//                 console.log(" error from new saving :", error);
//                 next(ErrorCreate(error.statusCode, error.message));
//               }
//             }
//           } catch (error) {
//             console.log(" error from inner :", error);
//             next(ErrorCreate(error.statusCode, error.message));
//           }
//         } else {
//           next(ErrorCreate(404, "otp itp is invalid!"));
//         }
//       });
//   } catch (error) {
//     console.log(" error from top :", error);
//     next(ErrorCreate(error.statusCode, error.message));
//   }
// };

const aadhaarVerification = async (req, res, next) => {
  try {
    const client = req.user;
    const { pan_number, aadhaar, otp, session_id } = req.body;

    // Check if user already exists
    const existUser = await checkIfUserExists(client, aadhaar, pan_number);
    if (existUser) {
      if (existUser._id == client.id) {
        await ClientModel.findByIdAndUpdate(client.id, { step: 1 });
        return res
          .status(200)
          .json({ message: "already KYC done!", code: 200 });
      } else {
        return res
          .status(400)
          .json({ message: "not authorized person", code: 400 });
      }
    }

    // Perform Aadhaar verification
    const verificationResult = await verifyAadhaarOTP(otp, session_id);
    if (verificationResult.code === 200) {
      let token = await handleKYCCompletion(
        client,
        aadhaar,
        pan_number,
        verificationResult.data
      );
      console.log(token);
      return res.status(200).json({ message: "KYC done!", code: 200, token });
    } else {
      next(ErrorCreate(404, "OTP or session is invalid!"));
    }
  } catch (error) {
    console.error("Error in Aadhaar verification:", error);
    next(ErrorCreate(error.statusCode, error.message));
  }
};

const checkIfUserExists = async (client, aadhaar, pan_number) => {
  return await ClientModel.findOne({
    $or: [{ aadhaar: aadhaar }, { pan_number: pan_number }],
  });
};

const verifyAadhaarOTP = async (otp, session_id) => {
  const consent = process.env.CONSENT;
  const purpose = process.env.PURPOSE;

  const response = await fetch(
    `https://production.deepvue.tech/v1/ekyc/aadhaar/verify-otp?otp=${otp}&session_id=${session_id}&consent=${consent}&purpose=${purpose}`,
    { method: "POST", headers: headers }
  );

  return await response.json();
};

const handleKYCCompletion = async (
  client,
  aadhaar,
  pan_number,
  aadhaarDetails
) => {
  const checkUser = await ClientModel.findById(client.id);
  if (checkUser && !checkUser.is_KYC_completed) {
    // Update existing user
    await ClientModel.findByIdAndUpdate(client.id, {
      pan_number: convertToUpperCaseWithNumbers(pan_number),
      customer_id: generateUniqueCode(aadhaar, process.env.FD_CODE),
      aadhaar,
      is_KYC_completed: true,
      step: 1,
      aadhaar_details: aadhaarDetails,
    });
  } else {
    // Create new user
    const childUser = new ClientModel({
      full_name: aadhaarDetails.name,
      email: aadhaarDetails.email,
      postal: parseInt(aadhaarDetails.address.pin, 10),
      pan_number: convertToUpperCaseWithNumbers(pan_number),
      client_id: generateUniqueCode(aadhaar, process.env.FD_CODE, 0),
      aadhaar,
      is_KYC_completed: true,
      step: 1,
      aadhaar_details: aadhaarDetails,
    });

    const newUser = await childUser.save();
    checkUser.familyfd_details.push(newUser);
    await checkUser.save();
    const token = jwt.sign({ id: newUser._id }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });
    return token;
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
    const numberOfClientFinances =
      await ClientFinanceModel.find().countDocuments();
    const ClientFinance = new ClientFinanceModel({
      initialAmount,
      maturity_time,
      CAGR,
      returnedAmount,
      fd_number: numberOfClientFinances + 1,
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
