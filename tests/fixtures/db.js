const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../../src/models/user.model");
const Task = require("../../src/models/task.model");

const userId = new mongoose.Types.ObjectId();
const userOne = {
	_id: userId,
	name: "Mike",
	email: "mike@gmail.com",
	password: "mike1234",
	tokens: [{ token: jwt.sign({ _id: userId }, "secret") }],
};

const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
	_id: userTwoId,
	name: "andrew",
	email: "andrew@example.com",
	password: "mike1234",
	tokens: [{ token: jwt.sign({ _id: userTwoId }, "secret") }],
};

const taskOne = {
	_id: new mongoose.Types.ObjectId(),
	description: "First task",
	completed: false,
	owner: userId,
};

const taskTwo = {
	_id: new mongoose.Types.ObjectId(),
	description: "Second task",
	completed: true,
	owner: userId,
};

const taskThree = {
	_id: new mongoose.Types.ObjectId(),
	description: "Third task",
	completed: false,
	owner: userTwoId,
};

const configureDatabase = async () => {
	await User.deleteMany();
	await Task.deleteMany();
	await new User(userOne).save();
	await new User(userTwo).save();
	await new Task(taskOne).save();
	await new Task(taskTwo).save();
	await new Task(taskThree).save();
};

module.exports = {
	userId,
	userOne,
	configureDatabase,
	taskOne,
	userTwo,
};
