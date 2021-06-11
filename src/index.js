const express = require("express");
require("dotenv").config();
require("./db/mongoose");
const userRouter = require("./routes/userRouter");
const taskRouter = require("./routes/taskRouter");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/users", userRouter);
app.use("/tasks", taskRouter);

app.listen(port, () => {
	console.log(`Server started on port ${port}`);
});

// bcrypt-js
// const myFunction = async () => {
//   mypassword = await bcrypt.hash("1234", 8);
//   console.log(mypassword);
//   isThismy = await bcrypt.compare("1234", mypassword);
//   console.log(isThismy);
// };

// myFunction();

// json web token
// const jwt = require("jsonwebtoken");

// const myFunction = async () => {
//   const token = jwt.sign({ _id: 123 }, "secret", { expiresIn: "7d" });
//   console.log(token);

//   const verify = jwt.verify(token, "secret");
//   console.log(verify);
// };

// myFunction();

// Populate methods

// const Task = require("./models/task.model");
// const User = require("./models/user.model");

// const myFunction = async () => {
// 	// const task = await Task.findById("60c2cdb69f427e1ca0b70e92");
// 	// await task.populate("owner").execPopulate();
// 	// console.log(task.owner);

// 	const user = await User.findById("60c02fad81db10120f9b37bf");
// 	await user.populate("tasks").execPopulate();
// 	console.log(user.tasks);
// };

// myFunction();
