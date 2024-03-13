const User = require("../models/userModel");

// Middleware to check if the provided email already exists
async function checkDuplicatedEmail(req, res, next) {
    try {
        // Check if the email exists in the User collection
        const user = await User.findOne({ email: req.body.email });

        // If the email is found in the User collection, return a 302 response
        if (user) {
        
            return res.status(302).json({
                successful: false,
                message: "Email unverified",
                redirect: `/#/authentication/confirmation`,
                id: tempUser._id,
            });
        }

        // If the email is not found in either collection, proceed to the next middleware
        next();
    } catch (error) {
        // Handle errors and return a 500 response if something goes wrong
        res
            .status(500)
            .json({ success: false, message: "Something went wrong, signup failed" });
    }
};

module.exports = { checkDuplicatedEmail };
