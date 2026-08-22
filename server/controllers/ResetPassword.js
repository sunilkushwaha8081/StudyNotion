const User = require("../models/User");
const OTP = require("../models/OTP");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const otpGenerator = require("otp-generator");

// 1. Send Forgot Password OTP
exports.sendForgotPasswordOtp = async (req, res) => {
	try {
		const { email } = req.body;
		if (!email) {
			return res.status(400).json({
				success: false,
				message: "Please enter your registered email address",
			});
		}

		// Check if user is registered
		const user = await User.findOne({ email: email });
		if (!user) {
			return res.status(400).json({
				success: false,
				message: `This Email (${email}) is not registered with us. Please enter a valid registered email.`,
			});
		}

		// Generate 6-digit OTP
		let otp = otpGenerator.generate(6, {
			upperCaseAlphabets: false,
			lowerCaseAlphabets: false,
			specialChars: false,
		});

		// Ensure OTP is unique
		let result = await OTP.findOne({ otp: otp });
		while (result) {
			otp = otpGenerator.generate(6, {
				upperCaseAlphabets: false,
				lowerCaseAlphabets: false,
				specialChars: false,
			});
			result = await OTP.findOne({ otp: otp });
		}

		// Save OTP to DB (valid for 5 minutes)
		await OTP.create({ email, otp });
		console.log(`[OTP LOG] Forgot Password OTP for ${email}: ${otp}`);

		res.status(200).json({
			success: true,
			message: "OTP sent successfully to your registered email address.",
		});
	} catch (error) {
		console.error("Error in sendForgotPasswordOtp:", error);
		return res.status(500).json({
			success: false,
			message: error.message || "Failed to send OTP",
		});
	}
};

// 2. Verify Forgot Password OTP
exports.verifyForgotPasswordOtp = async (req, res) => {
	try {
		const { email, otp } = req.body;
		if (!email || !otp) {
			return res.status(400).json({
				success: false,
				message: "Please provide both Email and OTP",
			});
		}

		// Fetch latest OTP for email
		const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);

		if (recentOtp.length === 0) {
			return res.status(400).json({
				success: false,
				message: "OTP has expired or is invalid. Please request a new OTP.",
			});
		}

		if (otp !== recentOtp[0].otp) {
			return res.status(400).json({
				success: false,
				message: "Invalid OTP. Please enter the correct verification code.",
			});
		}

		// Generate resetToken for password reset session
		const resetToken = crypto.randomBytes(20).toString("hex");

		await User.findOneAndUpdate(
			{ email: email },
			{
				token: resetToken,
				resetPasswordExpires: Date.now() + 10 * 60 * 1000, // 10 mins expiry
			},
			{ new: true }
		);

		return res.status(200).json({
			success: true,
			message: "OTP verified successfully",
			resetToken: resetToken,
		});
	} catch (error) {
		console.error("Error in verifyForgotPasswordOtp:", error);
		return res.status(500).json({
			success: false,
			message: error.message || "Error verifying OTP",
		});
	}
};

// 3. Reset Password With OTP/Token
exports.resetPasswordWithOtp = async (req, res) => {
	try {
		const { password, confirmPassword, resetToken } = req.body;

		if (!password || !confirmPassword || !resetToken) {
			return res.status(400).json({
				success: false,
				message: "All fields are required",
			});
		}

		if (confirmPassword !== password) {
			return res.status(400).json({
				success: false,
				message: "New Password and Confirm Password do not match",
			});
		}

		const userDetails = await User.findOne({ token: resetToken });
		if (!userDetails) {
			return res.status(400).json({
				success: false,
				message: "Reset Session Token is Invalid or Expired",
			});
		}

		if (!(userDetails.resetPasswordExpires > Date.now())) {
			return res.status(403).json({
				success: false,
				message: "Reset Session Expired. Please request a new OTP.",
			});
		}

		const encryptedPassword = await bcrypt.hash(password, 10);

		await User.findOneAndUpdate(
			{ token: resetToken },
			{
				password: encryptedPassword,
				token: null,
				resetPasswordExpires: null,
			},
			{ new: true }
		);

		res.status(200).json({
			success: true,
			message: "Password Reset Successful! Please login with your new password.",
		});
	} catch (error) {
		console.error("Error in resetPasswordWithOtp:", error);
		return res.status(500).json({
			success: false,
			message: error.message || "Some error in updating the password",
		});
	}
};

exports.resetPasswordToken = exports.sendForgotPasswordOtp;
exports.resetPassword = exports.resetPasswordWithOtp;