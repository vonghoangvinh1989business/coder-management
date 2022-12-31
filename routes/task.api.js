const express = require("express");
const router = express.Router();

const {
  createTask,
  getTasks,
  getTaskById,
} = require("../controllers/task.controller");

const {
  createTaskValidator,
  createTaskValidatorResult,
  getTasksValidator,
  getTasksValidatorResult,
  getTaskByIdValidator,
  getTaskByIdValidatorResult,
} = require("../validators/taskValidator");

/**
 * @route GET api/tasks
 * @description Get a list of tasks
 * @access public
 * @allowedQueries: page, limit, status, sort, order_by, search
 * search by "name, description, status",
 * sort by "createdAt, updatedAt"
 * order by "asc, desc"
 */
router.get("/", getTasksValidator, getTasksValidatorResult, getTasks);

/**
 * @route GET api/tasks/:id
 * @description Get a single task by id
 * @access public
 */
router.get(
  "/:id",
  getTaskByIdValidator,
  getTaskByIdValidatorResult,
  getTaskById
);

/**
 * @route POST api/tasks
 * @description Create a new task
 * @access public
 * @requiredBody: name, description
 */
router.post("/", createTaskValidator, createTaskValidatorResult, createTask);

// export
module.exports = router;
