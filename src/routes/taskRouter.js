const router = require("express").Router();
const Task = require("../models/task.model");
const auth = require("../middleware/auth");

// Get user tasks
router.get("/", auth, async (req, res) => {
	const match = {};
	const sort = {};

	// ?completed=true
	if (req.query.completed) {
		match.completed = req.query.completed === "true";
	}

	// ?sortBy=createdAt:desc
	if (req.query.sortBy) {
		const parts = req.query.sortBy.split(":");
		sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
	}

	try {
		// created a virtual in user-model for ref Task.
		await req.user
			.populate({
				path: "tasks",
				match,
				options: {
					limit: parseInt(
						req
							.query
							.limit
					),
					skip: parseInt(
						req
							.query
							.skip
					),
					sort,
				},
			})
			.execPopulate();
		res.status(200).send(req.user.tasks);
	} catch (e) {
		res.send(e.message);
	}
});

// post new task
router.post("/", auth, (req, res) => {
	const tasks = new Task({
		...req.body,
		owner: req.user._id,
	});
	tasks.save()
		.then((response) => {
			res.status(201).send(response);
		})
		.catch((e) => res.status(400).send(e.message));
});

// update excisting task
router.patch("/:id", auth, async (req, res) => {
	const updates = Object.keys(req.body);
	const allowedUpdates = ["description", "completed"];
	if (!updates.every((update) => allowedUpdates.includes(update))) {
		return res.status(400).send("You can only update description and completed");
	}
	try {
		const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });

		if (!task) {
			return res.status(400).send({ error: "no task found" });
		}

		updates.forEach((update) => (task[update] = req.body[update]));
		await task.save();
		res.status(200).send(task);
	} catch (e) {
		res.send(500).send(e.message);
	}
});

// Delete a Task
router.delete("/:id", auth, async (req, res) => {
	try {
		const task = await Task.findOneAndRemove({
			_id: req.params.id,
			owner: req.user._id,
		});

		if (!task) {
			return res.status(404).send();
		}

		res.status(200).send();
	} catch (e) {
		res.status(500).send(e.message);
	}
});

module.exports = router;
