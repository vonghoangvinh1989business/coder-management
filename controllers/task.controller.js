const { sendResponse, AppError } = require("../helpers/utils.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const Task = require("../models/Task");
const User = require("../models/User");
const taskController = {};

// api to update status of a task
taskController.updateStatus = async (req, res, next) => {
  try {
    // get taskId from params
    const { id: taskId } = req.params;
    const { status } = req.body;

    // find task by id
    let foundTask = await Task.findOne({ _id: taskId, isDeleted: false });

    if (!foundTask) {
      throw new AppError(
        500,
        `Task With Id ${taskId} Not Found Or Task Was Deleted.`,
        `Update Status To Task With Id ${taskId} Failed.`
      );
    }

    // current status of found task
    let currentStatus = foundTask.status;

    // check logic when the status is set to done, it can’t be changed to other value except archive
    if (currentStatus === "done" && status !== "archive") {
      throw new AppError(
        500,
        `Current Status of task With Id ${taskId} is: [done]. This task only accept status [archive] to update.`,
        `Update Status To Task With Id ${taskId} Failed.`
      );
    }

    // update status to task
    foundTask.status = status;
    foundTask = await foundTask.save();

    // send response
    sendResponse(
      res,
      200,
      true,
      foundTask,
      null,
      `Update Status To Task With Id ${taskId} Successfully.`
    );
  } catch (error) {
    next(error);
  }
};

// api to assign/unassign a user to a task
taskController.updateAssignee = async (req, res, next) => {
  try {
    // get taskId from params
    const { id: taskId } = req.params;
    const { assignee } = req.body;

    let assigneeValue = "";
    if (assignee) {
      if (mongoose.Types.ObjectId.isValid(assignee)) {
        // find appropriate user with assignee value
        const foundAssignee = await User.findOne({
          _id: assignee,
          isDeleted: false,
        });

        if (!foundAssignee) {
          throw new AppError(
            500,
            `Assignee With Id ${assignee} Not Found Or Assignee Was Deleted.`,
            `Update Assignee To Task With Id ${taskId} Failed.`
          );
        }
        assigneeValue = assignee;
      } else {
        throw new AppError(
          500,
          `Assignee Id must be valid Mongo Object Id`,
          `Update Assignee To Task With Id ${taskId} Failed.`
        );
      }
    } else {
      assigneeValue = null;
    }

    // find task by id
    let foundTask = await Task.findOne({ _id: taskId, isDeleted: false });

    if (!foundTask) {
      throw new AppError(
        500,
        `Task With Id ${taskId} Not Found Or Task Was Deleted.`,
        `Update Assignee To Task With Id ${taskId} Failed.`
      );
    }

    // add assignee to task
    foundTask.assignee = assigneeValue;
    foundTask = await foundTask.save();

    // send response
    sendResponse(
      res,
      200,
      true,
      foundTask,
      null,
      `Update Assignee To Task With Id ${taskId} Successfully.`
    );
  } catch (error) {
    next(error);
  }
};

// api to get task by id
taskController.getTaskById = async (req, res, next) => {
  try {
    // get taskId from params
    const { id: taskId } = req.params;

    // find task by id
    const foundTask = await Task.findOne({ _id: taskId, isDeleted: false });

    if (!foundTask) {
      throw new AppError(
        500,
        `Task With Id ${taskId} Not Found Or Task Was Deleted.`,
        `Get Task By Id ${taskId} Failed.`
      );
    }

    // send response
    sendResponse(res, 200, true, foundTask, null, `Get Task Successfully.`);
  } catch (error) {
    next(error);
  }
};

// api to get a list of tasks
taskController.getTasks = async (req, res, next) => {
  try {
    const allowedFilter = [
      "page",
      "limit",
      "status",
      "search",
      "sort_by",
      "order_by",
    ];

    let { page, limit, ...filterQuery } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    const filterKeys = Object.keys(filterQuery);
    filterKeys.forEach((key) => {
      if (!allowedFilter.includes(key)) {
        throw new AppError(
          400,
          `Query key [${key}] is not allowed`,
          "Get User List Failed."
        );
      }
      if (!filterQuery[key]) delete filterQuery[key];
    });

    // number of items skip for selection
    let offset = limit * (page - 1);

    // define variables to send data responses
    let totalPages = 0;
    let listOfTasks = [];

    if (filterKeys.length) {
      // define query object to build query
      let queries = {};

      // always to get tasks which exist
      queries["isDeleted"] = false;

      // filter with status value
      if (filterQuery["status"]) {
        queries["status"] = filterQuery["status"];
      }

      // filter with search value (full text search, not fuzzy)
      if (filterQuery["search"]) {
        let searchValue = _.toLower(filterQuery["search"].trim());
        queries["$text"] = { $search: searchValue };
      }

      // try to get sort_by and order_by
      let sortByValue = filterQuery["sort_by"] || "";
      let orderByValue = filterQuery["order_by"] || "";

      // order_by value just have meaning when it goes along with sort_by value
      if (sortByValue) {
        // define sortObject
        let sortObject = {};

        if (orderByValue === "asc") {
          sortObject[sortByValue] = 1;
        } else if (orderByValue === "desc") {
          sortObject[sortByValue] = -1;
        } else {
          // default sort by desc
          sortObject[sortByValue] = -1;
        }

        // query to get total pages
        totalPages = await Task.find(queries).sort(sortObject).count();
        totalPages = Math.ceil(totalPages / limit);

        // query to get list of tasks based on page and limit, and filters and sort
        listOfTasks = await Task.find(queries)
          .sort(sortObject)
          .skip(offset)
          .limit(limit);
      } else {
        // query to get total pages
        totalPages = await Task.find(queries).sort({ createdAt: -1 }).count();
        totalPages = Math.ceil(totalPages / limit);

        // query to get list of tasks based on page and limit, and filters
        listOfTasks = await Task.find(queries)
          .sort({ createdAt: -1 })
          .skip(offset)
          .limit(limit);
      }
    } else {
      // query to get total pages
      totalPages = await Task.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .count();
      totalPages = Math.ceil(totalPages / limit);

      // query to get list of tasks based on page and limit
      listOfTasks = await Task.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);
    }

    // create response data object
    const responseData = {
      tasks: listOfTasks,
      page: page,
      totalPages,
    };

    // send response
    sendResponse(
      res,
      200,
      true,
      responseData,
      null,
      "Get Task List Successfully!"
    );
  } catch (error) {
    next(error);
  }
};

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
