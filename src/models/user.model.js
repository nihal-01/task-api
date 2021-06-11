const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./task.model");

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
		},
		password: {
			type: String,
			required: true,
			trim: true,
			minLength: 8,
			validate(value) {
				if (value.includes("password")) {
					throw new Error(
						"Don't include 'password' on you password"
					);
				}
			},
		},
		age: {
			type: Number,
			default: 0,
			validate(value) {
				if (value < 0) {
					throw new Error("Age must be grater than 0");
				}
			},
		},
		tokens: [
			{
				token: {
					type: String,
					required: true,
				},
			},
		],
		avatar: {
			type: Buffer,
		},
	},
	{
		timestamps: true,
	}
);

// A virtual ref for task model
userSchema.virtual("tasks", {
	ref: "task",
	localField: "_id",
	foreignField: "owner",
});

// Hiding password, tokens from user model
// call this automatically - learn more from document
userSchema.methods.toJSON = function () {
	const user = this;
	const userObject = user.toObject();

	delete userObject.password;
	delete userObject.tokens;
	delete userObject.avatar;

	return userObject;
};

userSchema.methods.generateAuthToken = function () {
	return new Promise(async (resolve, reject) => {
		const user = this;
		const token = jwt.sign({ _id: user._id.toString() }, "secret", { expiresIn: "7d" });

		user.tokens = [...user.tokens, { token }];
		await user.save();
		resolve(token);
	});
};

userSchema.statics.findByCredentials = (email, password) => {
	return new Promise(async (resolve, reject) => {
		const user = await User.findOne({
			email,
		});

		if (!user) {
			return reject("Unable to find your account");
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return reject("Password is incorrect");
		}
		resolve(user);
	});
};

// hashing password before saving
userSchema.pre("save", async function (next) {
	const user = this;

	if (user.isModified("password")) {
		user.password = await bcrypt.hash(user.password, 8);
	}
	next();
});

// removing tasks when user removed
userSchema.pre("remove", async function (next) {
	const user = this;
	await Task.deleteMany({ owner: user._id });
	next();
});

const User = mongoose.model("user", userSchema);

module.exports = User;
