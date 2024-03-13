const  Category  = require("../models/categoryModel");
const Store = require("../models/storeModel");
const User =require('../models/userModel')
const Product = require("../models/productModel");
const connectToDatabase = require("../config/db");

// Middleware to check if a category with the given name exists
async function checkCategoryExist(req, res, next) {
    // Logging for debugging purposes
    try {
        const userId = req.params.id;
        // // Find the user by ID in the database
        const users = await User.findById(userId);
        if (!users) {
            return res.status(400).json({ success: false, message: 'user Not found' });
        }
        const storeId = users.store;
        // Find the store by ID in the database
        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(400).json({ success: false, message: 'Store not found' });
        }
        const categoryFound = await Category.findOne({
            name: req.body.category,
            store: storeId,
        });
      // If no category with the provided name is found, return a 404 response
        if (!categoryFound) {
            return res
                .status(404)
                .json({ successful: false, message: "Category not found" });
        }

        // If the category exists, set req.id to the category's ID for later use
        req.id = categoryFound._id;

        // Proceed to the next middleware
        next();
    } catch (err) {
        console.log(err);

        res.status(500).json({
            success: false,
            message: "Something went wrong, category existence verification failed",
        });
    }
};


// Middleware to create a new product and increment the quantity if a similar product already exists
async function checkDuplicatedProduct(req, res, next) {
    try {
        const { name, description, category, store, price, size, img, img_id, active } = req.body;

        // Check if a similar product already exists in the database
        const db = await connectToDatabase(); // Connect to the database
        // Check if a similar product already exists in the database
        if (!db) {
            throw new Error('Database connection failed');
        }
        const collection = db.collection('products');
        // Check if a similar product already exists in the database
        const similarProduct = await collection.findOne({
            name, description, category, store, price, size, img, img_id, active
        });

        if (similarProduct && similarProduct._id) {
            // Increment the product quantity for the associated category
            await Product.incrementQuantityProducts(similarProduct._id);
            // Pass the updated product to the next middleware or route handler
            return res.json({ message: 'Product quantity incremented successfully' });
        } else {
            next();  // Move next() here to indicate that the middleware is done
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { checkCategoryExist, checkDuplicatedProduct };
