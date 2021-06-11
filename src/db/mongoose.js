const mongoose = require("mongoose");

const mongoUrl = process.env.MONGODB;
mongoose.connect(mongoUrl, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
	useFindAndModify: false,
})
	.then(() => {
		console.log("database established successfully");
	})
	.catch((e) => {
		console.log(e);
	});
