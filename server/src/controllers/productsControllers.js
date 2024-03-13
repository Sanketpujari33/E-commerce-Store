const Product = require("../models/productModel");
const  Category  = require("../models/categoryModel");
const Store = require('../models/storeModel')
const User =require('../models/userModel')

const { cloudinary } = require("../config/cloudinary");

const fs = require("fs");

// Get all products with optional filters and pagination
async function getAllProducts(req, res) {
    try {
        let query = {};
        let sort = "-createdAt";
        let page = 1;
        let limit = 6;

        if (req.query.title) {
            query.name = { $regex: `${req.query.title}`, $options: "i" };
        }
        if (req.query.store) {
            query.store = req.query.store;
        }
        if (req.query.category) {
            query.category = req.query.category;
        }
        if (req.query.active) {
            req.query.active === "true"
                ? (query.active = true)
                : (query.active = false);
        }

        if (req.query.sort) {
            sort = req.query.sort;
        }
        if (req.query.page) {
            page = parseInt(req.query.page);
        }
        if (req.query.limit) {
            limit = parseInt(req.query.limit);
        }

        let skip = (page - 1) * limit;

        const products = await Product.find(query)
            .sort(sort)
            .limit(limit)
            .skip(skip)
            .exec();
        const totalResults = await Product.find(query).countDocuments();

        return res
            .status(200)
            .json({ success: true, data: products, total: totalResults });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get a product by its ID
async function getProductById(req, res) {
    try {
        // Extract the product ID from the request parameters
        const id = req.params.id;
        // Find the product by ID in the database
        const product = await Product.findById(id);
        // Check if the product exists; if not, return a 404 response
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        return res.status(200).json({ success: true, data: product });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Create a new product
async function postNewProduct(req, res) {
    try {
        const { name, category, size, description, active, img} = req.body;
        const price = parseInt(req.body.price);
        const userId = req.params.id;
         // Find the user by ID in the database
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
        const categoryInfo = await Category.findOne({
            name: category,
        });
        const categoryId=categoryInfo._id;
        // Check if a file is included in the request
        if (!req.file) {
            throw new Error('No file uploaded');
        }
        const imageUploaded = await cloudinary.v2.uploader.upload(req.file.path);

        const product = new Product({
            name,
            price,
            category: categoryId,
            store: store,
            size,
            description,
            active,
            img: imageUploaded.secure_url,
            img_id: imageUploaded.public_id,
        });
        fs.unlink(req.file.path, (err) => {
            if (err) {
                console.error(err);
                return;
            }
        });

        // Increment the product quantity for the associated category
        await Category.incrementCategoryProducts(categoryId);
        const newProduct = await product.save();
        // Push the new product's ID to the category's product array
        categoryInfo.product.push(newProduct._id);
        // Save the updated category document
        await categoryInfo.save();
        return res.status(201).json({ success: true, data: newProduct });
    } catch (error) {
        console.log(error);
        // Handle validation errors or other issues with a 400 status
        return res.status(400).json({ success: false, message: error.message });
    }
};


// Update a product by its ID
async function updateProductById(req, res) {
    const { productId, name, category, description, active } = req.body;
    const price = parseInt(req.body.price);

    try {
        const productFound = await Product.findById(productId);

        if (!productFound)
            return res
                .status(404)
                .json({ success: false, message: "Product not found" });

        let img;
        let img_id;

        if (req.file) {
            const imageUploaded = await cloudinary.v2.uploader.upload(req.file.path);

            fs.unlink(req.file.path, (err) => {
                if (err) {
                    console.error(err);
                    return;
                }
            });

            img = imageUploaded.secure_url;
            img_id = imageUploaded.public_id;
        } else {
            img = productFound.img;
            img_id = productFound.img_id;
        }

        if (category && category !== productFound.category) {
            // Decrement the product quantity for the old category
            await Category.decrementCategoryProducts(productFound.category);

            // Increment the product quantity for the new category
            await Category.incrementCategoryProducts(category);
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            {
                name: name || productFound.name,
                description: description || productFound.description,
                category: productFound.category,
                store: productFound.store,
                price: price || productFound.price,
                size: size || productFound.size,
                img,
                img_id,
                active: active || productFound.active,
            },
            { new: true }
        );

        return res.status(200).json({ success: true, data: updatedProduct });
    } catch (error) {
        console.log(error);

        // Handle validation errors or other issues with a 400 status
        return res.status(400).json({ success: false, message: error.message });
    }
};


// Delete a product by its ID
async function deleteProductById(req, res) {
    try {
        let product = await Product.findById(req.body.productId);

        if (!product)
            return res
                .status(404)
                .json({ success: false, message: "Product not found" });

        // Decrement the product quantity for the associated category
        await Category.decrementCategoryProducts(product.category);
        // Delete the product image from cloudinary
        await cloudinary.v2.uploader.destroy(product.img_id);

        // Remove the product document
        await Product.findByIdAndRemove(req.params.id);

        return res.status(204).json({ success: true, message: "Product has been deleted" });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong, the product was not deleted correctly",
        });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    postNewProduct,
    updateProductById,
    deleteProductById,
};