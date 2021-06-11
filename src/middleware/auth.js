const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const auth = async (req, res, next) => {
	try {
		const token = req.header("Authorization").split(" ")[1];
		const decoded = jwt.verify(token, "secret");
		const user = await User.findOne({ _id: decoded._id, "tokens.token": token });

		if (!user) {
			throw new Error();
		}

		req.token = token;
		req.user = user;
		next();
	} catch (e) {
		res.status(401).send({ error: "Not authenticated" });
	}
};

module.exports = auth;
