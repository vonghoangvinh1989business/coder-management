const express = require("express");
const router = express.Router();

const { createTask } = require("../controllers/task.controller");

const {
  createTaskValidator,
  createTaskValidatorResult,
} = require("../validators/taskValidator");

/**
 * @route POST api/tasks
 * @description Create a new task
 * @access public
 * @requiredBody: name, description
 */
router.post("/", createTaskValidator, createTaskValidatorResult, createTask);

// export
module.exports = router;
