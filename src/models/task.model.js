const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
	{
		description: {
			type: String,
			required: true,
		},
		completed: {
			type: Boolean,
			default: false,
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "user", // by using ref we can poulate all-data of owner.
		},
	},
	{
		timestamps: true,
	}
);

const Task = mongoose.model("task", taskSchema);

module.exports = Task;
