const { sendResponse, AppError } = require("../helpers/utils.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const Task = require("../models/Task");
const taskController = {};

// api to create a new task
taskController.createTask = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    let nameValue = _.capitalize(name);
    let descriptionValue = _.capitalize(description);

    // validate task for existence, with task must not deleted (isDeleted: false)
    const task = await Task.findOne({
      name: nameValue,
      description: descriptionValue,
      isDeleted: false,
    });

    if (task) {
      throw new AppError(
        400,
        "This task is already existed.",
        "Create Task Failed."
      );
    }

    // prepare request body to create
    const requestBody = {
      name: nameValue,
      description: descriptionValue,
    };

    // create task
    const createdTask = await Task.create(requestBody);

    // send response
    sendResponse(
      res,
      200,
      true,
      createdTask,
      null,
      "Create Task Successfully."
    );
  } catch (error) {
    next(error);
  }
};

module.exports = taskController;
