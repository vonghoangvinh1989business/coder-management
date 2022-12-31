const { AppError } = require("../helpers/utils");
const Task = require("../models/Task");
const _ = require("lodash");
const {
  body,
  query,
  param,
  check,
  validationResult,
} = require("express-validator");

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

// validate for get tasks
const getTasksValidator = [
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
  query("status")
    .optional()
    .trim()
    .escape()
    .isIn(["pending", "working", "review", "done", "archive"])
    .withMessage(
      "Status value must belong to one of these values: [pending, working, review, done, archive]."
    )
    .bail(),
  query("sort_by")
    .optional()
    .trim()
    .escape()
    .isIn(["createdAt", "updatedAt"])
    .withMessage(
      "Sort value must belong to one of these values: [createdAt, updatedAt]."
    )
    .bail(),
  query("order_by")
    .optional()
    .trim()
    .escape()
    .isIn(["asc", "desc"])
    .withMessage(
      "Order By value must belong to one of these values: [asc, desc]"
    ),
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

const getTasksValidatorResult = (req, res, next) => {
  const errors = validationResult(req);
  const hasError = !errors.isEmpty();

  if (hasError) {
    const errorMessage = errors.array()[0].msg;
    throw new AppError(400, errorMessage, "Get Task List Failed.");
  }

  next();
};

// validate for get task by id
const getTaskByIdValidator = [
  param("id")
    .trim()
    .escape()
    .isMongoId()
    .withMessage("Task Id must be valid Mongo Object Id"),
];

const getTaskByIdValidatorResult = (req, res, next) => {
  const errors = validationResult(req);
  const hasError = !errors.isEmpty();

  if (hasError) {
    const errorMessage = errors.array()[0].msg;
    throw new AppError(400, errorMessage, "Get Task By Id Failed.");
  }

  next();
};

// validate for add user to a specific task
const updateAssigneeValidator = [
  param("id")
    .trim()
    .escape()
    .isMongoId()
    .withMessage("Task Id must be valid Mongo Object Id"),
  body("assignee").trim().escape(),
];

const updateAssigneeValidatorResult = (req, res, next) => {
  const errors = validationResult(req);
  const hasError = !errors.isEmpty();

  if (hasError) {
    const errorMessage = errors.array()[0].msg;
    throw new AppError(400, errorMessage, "Update Assignee To Task Failed.");
  }

  next();
};

// export
module.exports = {
  createTaskValidator,
  createTaskValidatorResult,
  getTasksValidator,
  getTasksValidatorResult,
  getTaskByIdValidator,
  getTaskByIdValidatorResult,
  updateAssigneeValidator,
  updateAssigneeValidatorResult,
};
