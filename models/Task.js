const mongoose = require("mongoose");

const taskSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "working", "review", "done", "archive"],
      required: true,
      default: "pending",
    },
    assignee: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
    isDeleted: { type: Boolean, default: false, required: true },
  },
  {
    timestamps: true,
  }
);

// create Task model and export
const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
