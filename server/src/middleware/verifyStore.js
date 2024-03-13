const Store  = require("../models/storeModel");
const User = require('../models/userModel')
// Middleware to check if a store with the same name already exists
async function checkDuplicatedStore(req, res, next) {
    try {
        const storeFound = await Store.findOne({ name: req.body.name });
        if (storeFound) {
            return res
                .status(409)
                .json({ success: false, message: "The store already exists" });
        }
        // If the store doesn't exist, proceed to the next middleware
        next();
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Something went wrong, duplicated store verification failed",
        });
    }
}

// Middleware to check if a store with the given ID exists
async function checkStoreExist(req, res, next) {
    try {
        const userId = req.params.id;
        // // Find the user by ID in the database
        const users = await User.findById(userId);
        // Find the store by ID in the database
        const storeFound = await Store.findById(users.store);
        if (!storeFound) {
            return res
                .status(404)
                .json({ success: false, message: "No store found" });
        }
        // If the store exists, set req.id and req.storeName for later use
        req.id = storeFound._id;
        req.storeName = storeFound.name;
        // Proceed to the next middleware
        next();
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Something went wrong, store existence verification failed",
        });
    }
}
// Middleware to check if a store with the given ID exists
async function checkNewStore(req, res, next) {
    try {
        const userId = req.params.id;
        // // Find the user by ID in the database
        const users = await User.findById(userId);
        // Find the store by ID in the database
        const storeFound = await Store.findById(users.store);
        if (storeFound) {
            return res
                .status(400)
                .json({ success: false, message: "The store already exists in you account" });
        }
        // Proceed to the next middleware
        next();
    } catch (err) {
        console.log(err);

        res.status(500).json({
            success: false,
            message: "Something went wrong, store existence verification failed",
        });
    }
}
module.exports = { checkDuplicatedStore, checkStoreExist, checkNewStore };
