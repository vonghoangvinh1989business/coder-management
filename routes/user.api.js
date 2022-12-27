const express = require("express");
const router = express.Router();
const {
  createUser,
  getUsers,
  getUserById,
} = require("../controllers/user.controller");

const {
  userValidator,
  userValidatorResult,
  getAllUsersValidator,
  getAllUsersValidatorResult,
  getUserByIdValidator,
  getUserByIdValidatorResult,
} = require("../validators/userValidator");

/**
 * @route GET api/users
 * @description Get a list of users
 * @access private
 * @allowedQueries: name
 */
router.get("/", getAllUsersValidator, getAllUsersValidatorResult, getUsers);

/**
 * @route GET api/users/:id
 * @description Get user by id
 * @access public
 */
router.get(
  "/:id",
  getUserByIdValidator,
  getUserByIdValidatorResult,
  getUserById
);

/**
 * @route POST api/users
 * @description Create a new user
 * @access private, manager
 * @requiredBody: name
 */
router.post("/", userValidator, userValidatorResult, createUser);

// export
module.exports = router;
