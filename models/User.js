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

// create text index for all fields
userSchema.index({ "$**": "text" });

// create User model and export
const User = mongoose.model("User", userSchema);
module.exports = User;
