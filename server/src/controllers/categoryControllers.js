const { Category } = require("../models/categoryModel");
const User = require('../models/userModel')
const Store = require('../models/storeModel')
const Product = require("../models/productModel"); // Import the Product model with correct variable name
const sendEmail = require("../config/nodemailer");
const { cloudinary } = require("../config/cloudinary");

// Get all categories
async function getAllCategories(req, res) {
    try {
        const categories = await Category.find({});
        return res.status(200).json({ successful: true, data: categories });
    } catch (error) {
        console.error("Error fetching categories:", error);
        return res.status(500).json({
            successful: false,
            message: "Something went wrong, could not get all categories",
        });
    }
};

// Create a new category
async function createCategory(req, res) {
    try {
        const { name } = req.body;
        const userId = req.params.id;
        // // Find the user by ID in the database
        const users = await User.findById(userId);
        if (!users) {
            return res.status(400).json({ success: false, message: 'user Not found' });
        }
        const storeId = users.store;
        // Find the store by ID in the database
        const store = await Store.findById(storeId);
        const category = new Category({
            name,
            store: storeId,
        });
        
        const newCategory = await category.save();
        // Push the new category's ID to the store's category array
        store.category.push(newCategory._id);

        // Save the updated store document
        await store.save();
        return res.status(200).json({
            successful: true,
            data: newCategory,
            message: `Category created successfully`, // Fixed the message to include the category name
        });
    } catch (error) {
        console.error("Error adding Category:", error);
        return res.status(500).json({
            successful: false,
            message: "Something went wrong, could not create new category",
        });
    }
};

// Edit a category's name
async function editCategoryName(req, res) {
    try {
        const category = await Category.findByIdAndUpdate(req.body.categoryId, {
            $set: { name: req.body.categoryNewName },
        });

        if (!category) {
            return res.status(404).json({
                successful: false,
                message: "Category not found",
            });
        }

        return res.status(200).json({
            successful: true,
            category: { ...category.toObject(), name: req.body.categoryNewName },
            message: `Category successfully renamed`,
        });
    } catch (error) {
        // Log and handle errors if any occur during the process
        console.error("Error updating Category:", error);
        return res.status(500).json({
            successful: false,
            message: "Something went wrong, could not update category name",
        });
    }
};


// Delete a category
async function deleteCategory(req, res) {
    try {
        const id = req.body.categoryId;
        // Find the Category by ID in the database
        const category = await Category.findById(id);
        // Check if the Category exists; if not, return a 404 response
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }
        // Find products associated with the store
        const productsToDelete = await Product.find({ category: id });
        // Delete the product images from cloudinary and their associated categories
        for (const product of productsToDelete) {
            await cloudinary.uploader.destroy(product.img_id);
            await cloudinary.uploader.destroy(product.img);
            // Remove the product document
            await Product.findByIdAndRemove(product._id);
        }
        const store = await Store.findById(category.store);
        // Remove the store from the database
        store.category.pop(id);
        await store.save();
        await category.remove();
        // Send a JSON response indicating success
        return res.status(200).json({ success: true, message: "Category and associated products deleted successfully" });
    } catch (error) {
        // Log and handle errors if any occur during the process
        console.error("Error deleting Category and associated products :", error);
        return res.status(500).json({
            successful: false,
            message: "Something went wrong, could not delete category",
        });
    }
};


module.exports = {
    getAllCategories,
    deleteCategory,
    editCategoryName,
    createCategory,
};