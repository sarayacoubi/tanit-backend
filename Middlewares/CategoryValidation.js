const { body, validationResult } = require("express-validator");

exports.verifAddCategory = [
  body("name", "The name should containe at least 2 characters").isLength({
    min: 2,
  }),
];

exports.CategoryValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).send(errors);
  }
  next();
};
