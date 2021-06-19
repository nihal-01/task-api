const express = require("express");
require("dotenv").config();
require("./db/mongoose");
const userRouter = require("./routes/userRouter");
const taskRouter = require("./routes/taskRouter");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());
app.use("/users", userRouter);
app.use("/tasks", taskRouter);

module.exports = app;
