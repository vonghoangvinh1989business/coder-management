const { sendResponse, AppError } = require("../helpers/utils.js");
const mongoose = require("mongoose");
const User = require("../models/User");
const userController = {};
const _ = require("lodash");

// api to get user by id
// TODO: implementing, should implement isDeleted for user --> think about that tomorrow
userController.getUserById = async (req, res, next) => {
  try {
    // get userId from params
    const { id: userId } = req.params;

    // find user by id
    const foundUser = await User.findById(userId);

    if (!foundUser) {
      throw new AppError(
        401,
        `User With Id ${userId} Not Found.`,
        `Get User By Id ${userId}  Failed.`
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
          401,
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
      })
        .sort({ _id: -1 })
        .count();
      totalPages = Math.ceil(totalPages / limit);

      // query to get list of users with search filter
      listOfUsers = await User.find({
        $text: { $search: filterValue },
      })
        .sort({ _id: -1 })
        .skip(offset)
        .limit(limit);
    } else {
      // query to get total pages
      totalPages = await User.find().sort({ _id: -1 }).count();
      totalPages = Math.ceil(totalPages / limit);

      // query to get list of users based on page and limit
      listOfUsers = await User.find()
        .sort({ _id: -1 })
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
