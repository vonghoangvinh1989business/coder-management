var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.status(200).send("Welcome to CoderManagement Backend Api");
});

const userRouter = require("./user.api.js");
router.use("/users", userRouter);

module.exports = router;
