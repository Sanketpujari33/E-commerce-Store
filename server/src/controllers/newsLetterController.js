const User = require("../models/userModel");

// Subscribe a user
async function subscribeUser(req, res){
    // Extract the userEmail from the request body
    const { userEmail } = req.body;
    try {
        // Find the user by their email
        const userFound = await User.findOne({ email: userEmail });
        // If no user is found with the provided email, return a 404 error
        if (!userFound) {
            return res.status(404).json({ message: "No user found" });
        }
        // Subscribe the user and save the changes
        await userFound.subscribe().save();
        // Return a success response
        return res.status(200).json({ success: true, message: "Subscription successful" });
    } catch (err) {
        console.log(err);
        // Handle errors and return a 500 status code if the subscription fails
        return res
            .status(500)
            .json({ success: false, message: "Subscription failed" });
    }
};

module.exports = { subscribeUser };