// const jwt = require("jsonwebtoken");
// const User = require("../Models/User");

// exports.IsAuth = async (req, res, next) => {
//   try {
//     const token = req.header("Authorization");

//     if (!token) {
//       return res.status(401).send({
//         errors: [{ msg: "Token missing" }],
//       });
//     }

//     const decoded = jwt.verify(token, process.env.privateKey);

//     const user = await User.findById(decoded.id);

//     if (!user) {
//       return res.status(401).send({
//         errors: [{ msg: "User not found" }],
//       });
//     }

//     req.user = user;

//     next();
//   } catch (error) {
//     console.log("Authentication error:", error.message);

//     return res.status(401).send({
//       errors: [{ msg: "Not authorized" }],
//     });
//   }
// };

const jwt = require("jsonwebtoken");
const User = require("../Models/User");

exports.IsAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(401).send({
        errors: [{ msg: "Token missing" }],
      });
    }

    // Extraire le JWT sans le mot Bearer
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    const decoded = jwt.verify(token, process.env.privateKey);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).send({
        errors: [{ msg: "User not found" }],
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Authentication error:", error.message);

    return res.status(401).send({
      errors: [{ msg: "Not authorized" }],
    });
  }
};
