const { body, validationResult } = require("express-validator");

exports.verifAddProduct = [
  body("name", "the name must contain at least 2 characters").isLength({
    min: 2,
  }),
  body(
    "description",
    "the description must contain at least 10 characters",
  ).isLength({ min: 10 }),
  // body('price', "The price must be a positive number").isFloat({min:0}),
  // body('weight', "The weight of each product must be a positive number").isFloat({min :0}),
  // body('stock', "The stock of each product must be a positive number").isFloat({min: 0}),
  // body('discount', "The discount must be a positive number").isFloat({min:0}),
  // body('discount', "the discount must not be greater than 100%").isFloat({max:100}),
];

exports.ProductValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).send(errors);
  }
  next();
};
