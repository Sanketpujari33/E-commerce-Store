const User = require("../models/userModel");

// Middleware to check if the provided email already exists
async function checkDuplicatedEmail(req, res, next) {
    try {
        // Check if the email exists in the User collection
        const userEmail = await User.findOne({ email: req.body.email });
        const userMobile= await User.findOne({ mobile: req.body.mobile });
        // If the email is found in the User collection, return a 302 response

        if (userEmail &&  userMobile) {
            return res.status(409).json({
                successful: false,
                message: "Email and Mobile unverified",
                redirect: `/#/authentication/confirmation`,
                id: userMobile._id,
            });
        }else if (userEmail ) {
            return res.status(409).json({
                successful: false,
                message: "Email unverified",
                redirect: `/#/authentication/confirmation`,
                id: userEmail._id,
            });
        }else if(userMobile){
            return res.status(409).json({
                successful: false,
                message: "Mobile unverified",
                redirect: `/#/authentication/confirmation`,
                id: userMobile._id,
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
