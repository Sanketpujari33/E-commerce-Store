const  Category  = require("../models/categoryModel");
const Store = require("../models/storeModel");
const User = require('../models/userModel')
// Middleware to check if a category with the same name already exists
async function checkDuplicatedCategory(req, res, next) {
    try {
        const userId = req.params.id;

        // Find the user by ID in the database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        const storeId = user.store;

        // Find the store by ID in the database
        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(400).json({ success: false, message: 'Store not found' });
        }
        const categoryFound = await Category.findOne({
            name: req.body.name,
            store: storeId,
        });
        if (categoryFound) {
            return res.status(409).json({ successful: false, message: "The category already exists" });
        }
        const categoryNewFound = await Category.findOne({
            name: req.body.categoryNewName,
            store: storeId,
        });
        if (categoryNewFound) {
            return res.status(409).json({ successful: false, message: "The category already exists" });
        }
        // If the category doesn't exist, proceed to the next middleware
        next();
    } catch (err) {
        console.log(err);

        res.status(500).json({
            success: false,
            message: "Something went wrong, duplicated category verification failed",
        });
    }
}

module.exports = { checkDuplicatedCategory};