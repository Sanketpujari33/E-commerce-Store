const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const cloudinary = require('cloudinary').v2; // Assuming you have cloudinary configured

const validator = require('validator'); // You may need to install this library
// Middleware to validate user input when creating a new user
function checkIsValidUser(req, res, next) {
    const { lastName, email, name, password } = req.body;
    if (!email || !lastName || !name || !password) {
        return res.status(400).json({
            successful: false,
            message: `Missing inputs, name: ${name} lastName: ${lastName} email:${email} password:${password}`,
        });
    }
    if (!validator.isEmail(email)) {
        return res.status(400).json({ successful: false, message: 'Email is not valid' });
    }
    if (!lastName || !name || typeof lastName !== 'string' || typeof name !== 'string') {
        return res.status(400).json({ successful: false, message: 'Full name is required and should be valid' });
    }
    req.userName = `${name} ${lastName}`;
    if (password.length < 5) {
        return res.status(400).json({ successful: false, message: `Password min length is 5` });
    }
    next();
};

// Middleware to validate user input when updating user information

function checkIsValidUpdate(req, res, next) {
    const { profilePicture, email, lastName, name, newPassword, area, state, city} = req.body;
    const number = parseInt(req.body.number);
    const pinCode = parseInt(req.body.pinCodeNumber);
    const streetNumber = parseInt(req.body.houseNo);
    if (newPassword && newPassword.length < 5) {
        return res.status(400).json({ successful: false, message: 'Password min length is 5' });
    }
    if (!validator.isEmail(email)) {
        return res.status(400).json({ successful: false, message: 'Email is not valid' });
    }
    if (!isNaN(number) && (number.toString().length < 10 || typeof number !== 'number')) {
        return res.status(400).json({ successful: false, message: 'Number is not valid' });
    }
    if (!lastName || !name || typeof lastName !== 'string' || typeof name !== 'string') {
        return res.status(400).json({ successful: false, message: 'Full name is required and should be valid' });
    }
    if (!area || !state || !city || !streetNumber || typeof streetNumber !== 'number' || streetNumber.toString().length > 4 || !pinCode || typeof pinCode !== 'number' || pinCode.toString().length > 6) {
        return res.status(400).json({ successful: false, message: 'Full address is required and not valid' });
    }
    next();
}

// Assuming 'id' is the store ID
async function deleteStoreAndAssociatedData(id) {
    try {
        // Find categories associated with the store
        const categoriesToDelete = await Category.find({ store: id });
        // Delete categories and their associated store
        await Promise.all(
            categoriesToDelete.map(async (category) => {
                // Remove the product document
                await Category.findByIdAndRemove(category._id);
            })
        );
        // Find products associated with the store
        const productsToDelete = await Product.find({ store: id });
        // Delete product images from cloudinary and associated categories
        await Promise.all(
            productsToDelete.map(async (product) => {
                // Remove the product images from cloudinary
                await cloudinary.uploader.destroy(product.img);
                await cloudinary.uploader.destroy(product.img_id);
                // Remove the product document
                await Product.findByIdAndRemove(product._id);
            })
        );
        // Optionally, delete the store itself
        // await Store.findByIdAndRemove(id);
        return { success: true, message: 'Store and associated data deleted successfully' };
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Error deleting store and associated data' };
    }
}

module.exports = { checkIsValidUser, checkIsValidUpdate, deleteStoreAndAssociatedData };
