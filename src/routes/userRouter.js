const router = require("express").Router();
const multer = require("multer");
const sharp = require("sharp");
const User = require("../models/user.model");
const auth = require("../middleware/auth");
const sendWelcomeEmail = require("../email/connection");

// Signup new user
router.post("/", (req, res) => {
	const newUser = new User(req.body);
	newUser.save()
		.then((response) => {
			sendWelcomeEmail(response.email, response.name);
			response.generateAuthToken().then((token) => {
				res.send({ response, token });
			});
		})
		.catch((e) => {
			res.send(e);
		});
});

// login user
router.post("/login", async (req, res) => {
	User.findByCredentials(req.body.email, req.body.password)
		.then((response) => {
			response.generateAuthToken()
				.then((token) => {
					res.status(200).send({ response, token });
				})
				.catch((e) => {
					res.status(400).send(e);
				});
		})
		.catch((e) => {
			res.status(400).send(e);
		});
});

// Get own profile
router.get("/me", auth, async (req, res) => {
	res.send(req.user);
});

// logout user by removing token
router.post("/logout", auth, async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter((tokenObj) => {
			return tokenObj.token != req.token;
		});
		await req.user.save();
		res.send();
	} catch (e) {
		res.status(500).send({ error: "Internal server error" });
	}
});

// logout from all devices by removing tokens
router.post("/logout-all", auth, async (req, res) => {
	try {
		req.user.tokens = [];
		await req.user.save();
		res.send();
	} catch (e) {
		res.status(500).send();
	}
});

// Get users by ID
router.get("/:id", async (req, res) => {
	const id = req.params.id;

	try {
		const user = await User.findById(id);
		if (!user) {
			return res.status(404).send("user not found");
		}
		res.status(200).send(user);
	} catch (e) {
		res.status(500).send(e);
	}
});

// updating own profile
router.patch("/update-me", auth, async (req, res) => {
	const updates = Object.keys(req.body);
	const allowedUpdates = ["name", "age", "email", "password"];
	if (!updates.every((update) => allowedUpdates.includes(update))) {
		return res.status(400).send("You can only update name, age, email-id and password");
	}
	try {
		updates.forEach((update) => {
			req.user[update] = req.body[update];
		});

		await req.user.save();

		// findByIdAndUpdate this changed for working middlewares. Middleware works only when saving
		// const user = await User.findByIdAndUpdate(req.params.id, req.body, {
		//   new: true,
		//   runValidators: true,
		// });

		res.status(200).send(req.user);
	} catch (e) {
		res.status(500).send(e.message);
	}
});

// delete own profile
router.delete("/me", auth, async (req, res) => {
	try {
		await req.user.remove();
		res.send(req.user);
	} catch (e) {
		res.status(500).send({ error: "Internal server problem" });
	}
});

const upload = multer({
	// dest: "avatars",  -  Removed for returning file
	limits: {
		fileSize: 1000000,
	},
	fileFilter: (req, file, db) => {
		const allowed = ["jpg", "jpeg", "png"];
		if (!allowed.includes(file.originalname.split(".")[1])) {
			return db(new Error("Please upload jpg, jpeg, or png"));
		}
		db(undefined, true);
	},
});

// upload profile picture
router.post(
	"/me/avatar",
	auth,
	upload.single("avatar"),
	async (req, res) => {
		const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
		req.user.avatar = buffer;
		await req.user.save();
		res.send();
	},
	(error, req, res, next) => {
		res.status(400).send({ error: error.message });
	}
);

// delete own avatar
router.delete("/me/avatar", auth, async (req, res) => {
	try {
		if (!req.user.avatar) {
			return res.status(400).send({ error: "You have no avatar" });
		}
		req.user.avatar = undefined;
		await req.user.save();
		res.send();
	} catch (e) {
		res.status(500).send(e.message);
	}
});

// get avatar
router.get("/:id/avatar", async (req, res) => {
	try {
		const user = await User.findById(req.params.id);

		if (!user || !user.avatar) {
			throw new Error();
		}

		res.set("Content-Type", "image/jpg");
		res.send(user.avatar);
	} catch (e) {
		res.status(400).send({ error: e.message });
	}
});

module.exports = router;
