const { sendResponse, AppError } = require("../helpers/utils.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const Task = require("../models/Task");
const taskController = {};

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
