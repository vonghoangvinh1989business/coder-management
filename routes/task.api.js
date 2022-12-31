const express = require("express");
const router = express.Router();

const {
  createTask,
  getTasks,
  getTaskById,
  updateAssignee,
  updateStatus,
  deleteTask,
} = require("../controllers/task.controller");

const {
  createTaskValidator,
  createTaskValidatorResult,
  getTasksValidator,
  getTasksValidatorResult,
  getTaskByIdValidator,
  getTaskByIdValidatorResult,
  updateAssigneeValidator,
  updateAssigneeValidatorResult,
  updateStatusValidator,
  updateStatusValidatorResult,
  deleteTaskValidator,
  deleteTaskValidatorResult,
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
 * @route PUT api/tasks
 * @description Update status of a task
 * @access public
 * @requiredBody: status (only accept: pending/working/review/done/archive)
 */
router.put(
  "/:id",
  updateStatusValidator,
  updateStatusValidatorResult,
  updateStatus
);

/**
 * @route PUT api/tasks
 * @description Assign a user to a specific task by user id
 * @access public
 * @requiredBody: assignee (accept: null value or mongo Object Id)
 */
router.put(
  "/:id",
  updateAssigneeValidator,
  updateAssigneeValidatorResult,
  updateAssignee
);

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

/**
 * @route DELETE api/tasks
 * @description Delete a task by id
 * @access public
 */
router.delete(
  "/:id",
  deleteTaskValidator,
  deleteTaskValidatorResult,
  deleteTask
);

// export
module.exports = router;
