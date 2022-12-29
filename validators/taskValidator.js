const { AppError } = require("../helpers/utils");
const Task = require("../models/Task");
const _ = require("lodash");
const { query, param, check, validationResult } = require("express-validator");

// validate for create task
const createTaskValidator = [
  check("name")
    .isString()
    .withMessage("Name value must be a string")
    .bail()
    .trim()
    .escape()
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage("Name value is required.")
    .bail(),
  check("description")
    .isString()
    .withMessage("Description value must be a string")
    .bail()
    .trim()
    .escape()
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage("Description value is required.")
    .bail(),
];

const createTaskValidatorResult = (req, res, next) => {
  const errors = validationResult(req);
  const hasError = !errors.isEmpty();

  if (hasError) {
    const errorMessage = errors.array()[0].msg;
    throw new AppError(400, errorMessage, "Create Task Failed.");
  }

  next();
};

// export
module.exports = {
  createTaskValidator,
  createTaskValidatorResult,
};
