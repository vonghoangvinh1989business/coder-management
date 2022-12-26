const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, enum: ["employee", "manager"], default: "employee" },
  },
  {
    timestamps: true,
  }
);

// create User model and export
const User = mongoose.Model("User", userSchema);
module.exports = User;
