const { query, param, check, validationResult } = require("express-validator");
const { AppError } = require("../helpers/utils");
const User = require("../models/User");
const _ = require("lodash");

// validate for create user
const userValidator = [
  check("name")
    .isString()
    .withMessage("Name value must be a string.")
    .trim()
    .escape()
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage("Name value is required.")
    .bail()
    .custom(async (nameValue) => {
      // check for existence of name in database, default role is employee (just only you are the manager was defined in Mongo Compass)
      const user = await User.findOne({
        name: _.capitalize(nameValue),
        role: "employee",
        isDeleted: false,
      });
      if (user) {
        throw new AppError(
          400,
          "Name value is already existed. Choose another name.",
          "Create User Failed."
        );
      }
    }),
];

const userValidatorResult = (req, res, next) => {
  const errors = validationResult(req);
  const hasError = !errors.isEmpty();

  if (hasError) {
    const errorMessage = errors.array()[0].msg;
    throw new AppError(400, errorMessage, "Create User Failed.");
  }

  next();
};

// validate for getting all tasks by user id
const getAllTasksByUserIdValidator = [
  param("id")
    .trim()
    .escape()
    .isMongoId()
    .withMessage("User Id must be valid Mongo Object Id"),
];

const getAllTasksByUserIdValidatorResult = (req, res, next) => {
  const errors = validationResult(req);
  const hasError = !errors.isEmpty();

  if (hasError) {
    const errorMessage = errors.array()[0].msg;
    throw new AppError(400, errorMessage, "Get All Tasks By User Id Failed.");
  }

  next();
};

// validate for getting user by id
const getUserByIdValidator = [
  param("id")
    .trim()
    .escape()
    .isMongoId()
    .withMessage("User Id must be valid Mongo Object Id"),
];

const getUserByIdValidatorResult = (req, res, next) => {
  const errors = validationResult(req);
  const hasError = !errors.isEmpty();

  if (hasError) {
    const errorMessage = errors.array()[0].msg;
    throw new AppError(400, errorMessage, "Get User By Id Failed.");
  }

  next();
};

// validate for getting all users
const getAllUsersValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page value must be a number larger than 0")
    .bail(),
  query("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Limit value must be a number larger than 0")
    .bail(),
  query("search")
    .optional()
    .isString()
    .withMessage("Search value must be a string")
    .trim()
    .escape()
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage("Search value is required.")
    .bail(),
];

const getAllUsersValidatorResult = (req, res, next) => {
  const errors = validationResult(req);
  const hasError = !errors.isEmpty();

  if (hasError) {
    const errorMessage = errors.array()[0].msg;
    throw new AppError(400, errorMessage, "Get User List Failed.");
  }

  next();
};

// export
module.exports = {
  userValidator,
  userValidatorResult,
  getAllUsersValidator,
  getAllUsersValidatorResult,
  getUserByIdValidator,
  getUserByIdValidatorResult,
  getAllTasksByUserIdValidator,
  getAllTasksByUserIdValidatorResult,
};
