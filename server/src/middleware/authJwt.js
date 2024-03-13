const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { Role } = require("../models/roleModel");

// Middleware to verify the user's token
async function verifyToken(req, res, next) {
    try {
        let token;
        
        // Check if the request has an Authorization header with a Bearer token
        if ( req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1]; // Corrected the token extraction
        }
        if (!token) return res.status(401).json({ message: "No token provided" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        req.userId = decoded.id;
        
        const user = await User.findById(req.userId, { password: 0 });
        if (!user) return res.status(404).json({ message: "Expire token No user found" });
        next(); // Proceed to the next middleware
    } catch (err) {
        console.error(err);
        res.status(401).json({ message: "Unauthorized" });
    }
};

// Middleware to check if the user has a "moderator" role
async function isModerator(req, res, next) {
    try {
        const user = await User.findById(req.userId);
        const roles = await Role.find({ _id: { $in: user.roles } });
        for (let i = 0; i < roles.length; i++) {
            if (roles[i].name === "moderator") {
                next(); // Proceed to the next middleware
                return;
            }
        }
        return res.status(403).json({ message: "Require Moderator Role!" });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: "Something went wrong, can't verify role" });
    }
};

// Middleware to check if the user has an "admin" role
async function isAdmin(req, res, next) {
    try {
        const user = await User.findById(req.userId);
        const roles = await Role.find({ _id: { $in: user.roles } });
        for (let i = 0; i < roles.length; i++) {
            if (roles[i].name === "admin") {
                next(); // Proceed to the next middleware
                return;
            }
        }

        return res.status(403).json({ message: "Require Admin Role!" }); // Fixed the error message
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

// Middleware to check if the user has an "admin" role
async function storeOwner(req, res, next) {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        const roles = await Role.find({ _id: { $in: user.roles } });
        for (let i = 0; i < roles.length; i++) {
            if (roles[i].name === "storeOwner") {
                next(); // Proceed to the next middleware
                return;
            }
        }

        return res.status(403).json({ message: "Require StoreOwner Role!" }); // Fixed the error message
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

// Middleware to check if the user has an "admin" or "moderator" role
async function isAdminOrIsModerator(req, res, next) {
    try {
        const user = await User.findById(req.userId);
        const roles = await Role.find({ _id: { $in: user.roles } });

        for (let i = 0; i < roles.length; i++) {
            if (roles[i].name === "moderator" || roles[i].name === "admin") {
                next(); // Proceed to the next middleware
                return;
            }
        }

        return res
            .status(403)
            .json({ message: "Require Admin or Moderator Role!" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

module.exports = {
    verifyToken,
    storeOwner,
    isAdmin,
    isModerator,
    isAdminOrIsModerator,
};