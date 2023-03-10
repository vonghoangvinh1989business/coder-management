const { sendResponse, AppError } = require("../helpers/utils.js");
const _ = require("lodash");
const mongoose = require("mongoose");
const User = require("../models/User");
const Task = require("../models/Task");
const userController = {};

// api to get all tasks belong to user id
userController.getAllTasksByUserId = async (req, res, next) => {
  try {
    // get userId from params
    const { id: userId } = req.params;

    // find user by id
    let foundUser = await User.findOne({
      _id: userId,
      isDeleted: false,
    });

    if (!foundUser) {
      throw new AppError(
        500,
        `User With Id ${userId} Not Found Or User Was Deleted.`,
        `Get All Tasks By User Id ${userId} Failed.`
      );
    }

    // get all task belongs to userId
    let listOfTasks = await Task.find({
      assignee: userId,
      isDeleted: false,
    }).populate("assignee");

    // create response data object
    const responseData = {
      tasks: listOfTasks,
      user: foundUser,
    };

    // send response
    sendResponse(
      res,
      200,
      true,
      responseData,
      null,
      "Get All Tasks By User Successfully!"
    );
  } catch (error) {
    next(error);
  }
};

// api to get user by id
userController.getUserById = async (req, res, next) => {
  try {
    // get userId from params
    const { id: userId } = req.params;

    // find user by id
    const foundUser = await User.findOne({ _id: userId, isDeleted: false });

    if (!foundUser) {
      throw new AppError(
        500,
        `User With Id ${userId} Not Found Or User Was Deleted.`,
        `Get User By Id ${userId} Failed.`
      );
    }

    // send response
    sendResponse(res, 200, true, foundUser, null, `Get User Successfully.`);
  } catch (error) {
    next(error);
  }
};

// api to get a list of users
userController.getUsers = async (req, res, next) => {
  try {
    const allowedFilter = ["search", "page", "limit"];

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

    let totalPages = 0;
    let listOfUsers = [];

    if (filterKeys.length) {
      // just allow filter with "search" here, update code in future with more filter fields
      let filterValue = _.toLower(filterQuery["search"].trim());

      // query to get total pages
      totalPages = await User.find({
        $text: { $search: filterValue },
        isDeleted: false,
      })
        .sort({ createdAt: -1 })
        .count();
      totalPages = Math.ceil(totalPages / limit);

      // query to get list of users with search filter
      listOfUsers = await User.find({
        $text: { $search: filterValue },
        isDeleted: false,
      })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);
    } else {
      // query to get total pages
      totalPages = await User.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .count();
      totalPages = Math.ceil(totalPages / limit);

      // query to get list of users based on page and limit
      listOfUsers = await User.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);
    }

    // create response data object
    const responseData = {
      users: listOfUsers,
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
      "Get User List Successfully!"
    );
  } catch (error) {
    next(error);
  }
};

// api to create a new user
userController.createUser = async (req, res, next) => {
  try {
    const { name } = req.body;
    let nameValue = _.capitalize(name);

    // prepare request body to create
    const requestBody = {
      name: nameValue,
    };

    // create user
    const createdUser = await User.create(requestBody);

    // send response
    sendResponse(
      res,
      200,
      true,
      createdUser,
      null,
      "Create User Successfully."
    );
  } catch (error) {
    next(error);
  }
};

module.exports = userController;
