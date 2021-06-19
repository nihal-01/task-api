const request = require("supertest");
const Task = require("../src/models/task.model");
const app = require("../src/app");
const { userId, userOne, configureDatabase, taskOne, userTwo } = require("./fixtures/db");

beforeEach(configureDatabase);

// create Task
test("create Task", async () => {
	await request(app)
		.post("/tasks")
		.set("Authorization", `Bearer ${userOne.tokens[0].token}`)
		.send({
			description: "First Task",
		})
		.expect(201);
});

// get task of user-one
test("get user-one tasks", async () => {
	const response = await request(app)
		.get("/tasks")
		.set("Authorization", `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200);

	expect(response.body.length).toBe(2);
});

// Attempting to delete first task by second user
test("delete task by non-owner", async () => {
	await request(app)
		.delete(`/tasks/${taskOne._id}`)
		.set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
		.send()
		.expect(404);

	const task = await Task.findById({ _id: taskOne._id });
	expect(task).not.toBe(null);
});
