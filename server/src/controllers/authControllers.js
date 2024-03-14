const User = require("../models/userModel");
const { Role } = require("../models/roleModel");
require("dotenv").config({ path: ".env" });
const jwt = require('jsonwebtoken'); // Import the jwt library
const bcrypt = require("bcryptjs");

const sendConfirmationEmailFunction = require("../libs/sendConfirmationEmail");
const sendResetPasswordEmailFunction = require("../libs/sendResetPasswordEmail");
const { getCookieValueByName } = require("../utils/getCookieValueByName");



// Signup function for user registration
async function signUp(req, res) {
    const { email, password, mobile, roles } = req.body;
    try {
        // Check if the user exists in the temporal database
        const foundUser = await User.findOne({ email });
        // Create a temporal user if not found or update an existing one
        const newUser =
            foundUser ||
            new User({
                name: req.userName,
                email,
                mobile,
                password,
            });
        // Assign roles to the user
        if (req.body.roles) {
            const foundRoles = await Role.find({ name: { $in: roles } });
            User.roles = foundRoles.map((role) => role._id);
        } else {
            const role = await Role.findOne({ name: "user" });
            newUser.roles = [role._id];
        }
        const hashedPassword = await bcrypt.hash(newUser.password, 10);
        newUser.password = hashedPassword;
        // Generate a confirmation token for email verification
        const token = jwt.sign({ id: newUser.id, }, process.env.JWT_EMAIL_CONFIRMATION_KEY);
        newUser.emailToken = token;
        await newUser.save();
        // Respond with success message
        return res.status(200).json({
            successful: true,
            message: "Successful sign-up",
            email: newUser.email,
        });
    } catch (error) {
        // Respond with an error message
        console.log(error);
        return res
            .status(500)
            .json({ successful: false, message: "Internal Server Error, something went wrong on the server" });
    }
};


// User login function
async function login(req, res) {
    try {
        const userFound = await User.findOne({ email: req.body.email }).populate(
            "roles"
        );

        if (!userFound) return res.status(400).json({ message: "User Not Found" });

        // Check if the provided password matches the stored password
        const matchPassword = await User.comparePassword(
            req.body.password,
            userFound.password
        );

        if (!matchPassword)
            return res.status(401).json({
                token: null,
                message: "Invalid Password",
            });

        const oneDayInSeconds = 86400;

        // Generate a JWT token for the user's session
        const token = jwt.sign({ id: userFound._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: oneDayInSeconds,
        });

        // Set the token as a cookie
        res.cookie("delivery-app-session-token", token, {
            expire: oneDayInSeconds + Date.now(),
        });

        // Respond with user information, roles, and token
        return res
            .status(200)
            .json({ token: token, roles: userFound.roles, user: userFound });
    } catch (error) {
        console.log(error);

        // Respond with an error message
        return res.status(500).json({ message: error });
    }
};
// Get user session information
async function getSession(req, res) {
    try {
        const cookieToken = getCookieValueByName(
            req.cookies,
            "delivery-app-session-token"
        );

        if (!cookieToken)
            return res
                .status(404)
                .json({ successful: false, message: "No session token was found" });

        // Check if the session token is valid
        const decoded = jwt.verify(cookieToken, process.env.JWT_SECRET_KEY);
        const user = await User.findById(decoded.id, { password: 0 }).populate(
            "roles"
        );

        if (!user) return res.status(404).json({ message: "No user found" });

        // Respond with user information and token
        return res.status(200).json({ successful: true, user, token: cookieToken });
    } catch (error) {
        console.log(error);

        // Respond with an error message
        return res.status(401).json({ successful: false, message: "Unauthorized" });
    }
};

// Send a reset password email to the user
async function sendResetPasswordEmail(
    req,
    res
) {
    try {
        const userFound = await User.findOne({ email: req.body.email });

        if (!userFound)
            return res.status(422).json({
                successful: false,
                message: "No account linked with that email",
            });

        const id = userFound._id;

        // Generate a reset password token
        const token = jwt.sign(
            {
                id,
                expiration: Date.now() + 10 * 60 * 1000,
            },
            process.env.JWT_RESET_FORGOTTEN_PASSWORD_KEY
        );

        // Construct the reset password URL
        const url = `${process.env.HOST || "localhost:3000"
            }/#/authentication/resetPassword/${token}`;

        // Send the reset password email
        await sendResetPasswordEmailFunction(url, req.body.email);

        // Respond with a success message
        return res.status(200).json({
            success: true,
            message: "Reset password email has been sent successfully",
        });
    } catch (err) {
        console.log(err);

        // Respond with an error message
        return res.status(500).json({
            successful: false,
            message: "Something went wrong, failed to send reset password email",
        });
    }
};

async function resetPassword(req, res) {
    try {
        const { newPassword, confirmPassword } = req.body;
        const token = req.params.token;

        if (!token) { return res.status(403).json({ success: false, message: "No token provided" }); }

        // Verify the token using the correct secret key
        const decoded = jwt.verify(token, process.env.JWT_RESET_FORGOTTEN_PASSWORD_KEY);

        // Check if the token is valid
        if (!decoded) return res.status(401).json({ message: "Invalid token" });

        // Check the token expiration
        if (Date.now() > decoded.expiration)
            return res.status(422).json({ successful: false, message: "Time to reset password exceeded", });

        const id = decoded.id;

        // Check if the user exists
        const userFound = await User.findById(id);

        if (!userFound)
            return res.status(404).json({ message: "User not found" });

        // Check password match and length
        if (newPassword !== confirmPassword)
            return res.status(400).json({ successful: false, message: "Passwords don't match" });

        if (newPassword.length < 5)
            return res.status(400).json({ successful: false, message: "Passwords min length is 5" });

        // Encrypt and update the user's password
        const encodedPassword = await User.encryptPassword(newPassword);
        userFound.password = encodedPassword;
        await userFound.save();

        // Respond with a success message
        return res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (err) {
        console.error(err); // Log the error
        // Respond with an error message
        return res.status(500).json({
            successful: false,
            message: "Something went wrong, failed to update password",
        });
    }
}

// Send a confirmation email to the user
async function sendConfirmationEmail(req, res) {
    try {
        const userFound = await User.findOne({ email: req.body.email });

        const token = userFound.emailToken;

        // Construct the confirmation URL
        const url = `${process.env.HOST || "localhost:7000"
            }/api/auth/verification/${token}`;

        // Send the confirmation email
        await sendConfirmationEmailFunction(url, userFound.email);

        // Respond with success message
        return res.status(200).json({
            success: true,
            message: "Account confirmation email has been sent successfully",
        });
    } catch (error) {
        console.log(error);

        // Respond with an error message
        return res.status(500).json({ message: "something went wrong" });
    }
};

// Validate the email confirmation token and create a user
async function validateEmailToken(req, res) {
    try {
        const token = req.params.token;
        if (!token)
            console.log(req.params.token)
        return res
            .status(403)
            .json({ success: false, message: "No token provided" });
        const decoded = jwt.verify(token, process.env.JWT_EMAIL_CONFIRMATION_KEY);
        const id = decoded.id;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: "User not found" });
        // Create a new user based on the temporal user's information
        const newUser = new User({
            name: user.name,
            email: user.email,
            password: await User.encryptPassword(user.password),
            roles: user.roles,
        });
        // Save the new user and remove the temporal user
        await newUser.save();
        await User.findByIdAndRemove(user._id);
        // Redirect to login page
        res.redirect(
            `${process.env.HOST || "localhost:3000"}/#/authentication/login`
        );
    } catch (err) {
        console.log(err);
    }
};

// User logout function
async function logout(req, res) {
    try {
        // Clear the session token cookie
        res.clearCookie("delivery-app-session-token");
        // Respond with a success message
        return res
            .status(200)
            .json({ successfully: true, message: "User has logged out successfully" });
    } catch (error) {
        console.log(error);
        // Respond with an error message
        return res.status(500).json({ message: error });
    }
};

module.exports = {
    signUp,
    login,
    validateEmailToken,
    sendConfirmationEmail,
    sendResetPasswordEmail,
    resetPassword,
    logout,
    getSession,
};