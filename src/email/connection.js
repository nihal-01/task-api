const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: "nihaln0077@gmail.com",
		pass: "123",
	},
});

const sendWelcomeEmail = (email, name) => {
	const mailOptions = {
		from: "nihaln0077@gmail.com",
		to: email,
		subject: "Welcome to Task app",
		text: `I ma glad to see you mr ${name}`,
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.log(error);
		} else {
			console.log("Email sent: " + info.response);
		}
	});
};

module.exports = sendWelcomeEmail;
