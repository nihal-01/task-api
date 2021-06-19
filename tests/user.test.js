const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user.model");
const { userId, userOne, configureDatabase } = require("./fixtures/db");

// this will run before each of test function
beforeEach(configureDatabase);

// signup as user
test("signup user", async () => {
	const response = await request(app)
		.post("/users")
		.send({
			name: "Nihal N",
			email: "nihaln0066@gmail.com",
			password: "012345678",
		})
		.expect(201);

	const user = await User.findById(response.body.response._id);
	expect(user).not.toBeNull();

	// cheching password stored as hashed
	expect(user.password).not.toBe("012345678");
});

// Login as user
test("Login user", async () => {
	const response = await request(app)
		.post("/users/login")
		.send({
			email: userOne.email,
			password: userOne.password,
		})
		.expect(200);

	const user = await User.findById(userId);
	expect(response.body.token).toBe(user.tokens[1].token);
});

test("Login user with nonexisting credentials", async () => {
	await request(app)
		.post("/users/login")
		.send({
			email: userOne.email,
			password: "MypassWord",
		})
		.expect(400);
});

// Get user profile
test("get user profile", async () => {
	await request(app)
		.get("/users/me")
		.set("Authorization", `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200);
});

test("get user profile - without authentication", async () => {
	await request(app).get("/users/me").send().expect(401);
});

// delete user account
test("delete user account", async () => {
	const response = await request(app)
		.delete("/users/me")
		.set("Authorization", `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200);

	const user = await User.findById(response.body._id);
	expect(user).toBeNull();
});

test("delete user account without auth", async () => {
	await request(app).delete("/users/me").send().expect(401);
});

// upload avatar
test("upload avatar", async () => {
	await request(app)
		.post("/users/me/avatar")
		.set("Authorization", `Bearer ${userOne.tokens[0].token}`)
		.attach("avatar", "tests/fixtures/profile-pic.jpg")
		.expect(200);

	const user = await User.findById(userId);
	expect(user.avatar).toEqual(expect.any(Buffer));
});

// Update user
test("update user", async () => {
	await request(app)
		.patch("/users/update-me")
		.set("Authorization", `Bearer ${userOne.tokens[0].token}`)
		.send({
			name: "Jess",
		})
		.expect(200);

	const user = await User.findById(userId);
	expect(user.name).toEqual("Jess");
});

test("don't update user with invalid field", async () => {
	await request(app)
		.patch("/users/update-me")
		.set("Authorization", `Bearer ${userOne.tokens[0].token}`)
		.send({
			location: "calicut",
		})
		.expect(400);
});
