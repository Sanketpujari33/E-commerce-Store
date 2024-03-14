// Import the Store model
const { Role } = require("../models/roleModel");
const Store = require("../models/storeModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const  Category  = require("../models/categoryModel");
const { cloudinary } = require("../config/cloudinary");
const fs = require("fs");

// Fetch all stores
const getAllStores = async (req, res) => {
    try {
        let query = {};
        let sort = "-createdAt";
        let page = 1;
        let limit = 6;
        // Extract city from the request query
        const city = req.query.city;

        // Check if the city is provided in the query
        if (city) {
            query.city = { $regex: `${city}`, $options: "i" };
        }
        if (req.query.title) {
            query.name = { $regex: `${req.query.title}`, $options: "i" };
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

        const store = await Store.find(query)
            .sort(sort)
            .limit(limit)
            .skip(skip)
            .exec();
        const totalResults = await Store.find(query).countDocuments();

        // Send a JSON response with the retrieved stores
        return res.status(200).json({ success: true, data: store, total: totalResults });
    } catch (error) {
        // Log and handle errors if any occur during the process
        console.error("Error fetching stores:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const postNewStore = async (req, res) => {
    try {
        // Extract data from the request body
        const {
            name,
            description,
            discount,
            cheapestPrice,
            img,
            lic_no,
            address,
            city,
            phone,
        } = req.body;
        const userId = req.params.id;
         // Find the user by ID in the database
        const users = await User.findById(userId);
        if (!users) {
            return res.status(400).json({ success: false, message: 'user Not found' });
        }
        if (!req.file && !req.file.path) {
            return res.status(400).json({ success: false, message: 'File not provided or invalid.' });
        }
        // Check if a file is included in the request
        const imageUploaded = await cloudinary.v2.uploader.upload(req.file.path);
        // Create a new store instance
        const newStore = new Store({
            storeOwner: users,
            name,
            description,
            address,
            discount,
            cheapestPrice,
            city,
            phone,
            lic_no,
            img: imageUploaded.secure_url,
            img_id: imageUploaded.public_id,
        });
        fs.unlink(req.file.path, (err) => {
            if (err) {
                console.error(err);
                return;
            }
        });
        // Save the store to the database
        const savedStore = await newStore.save();

        // Assuming you have a Role model and it has an ObjectId for 'storeOwner'
        const storeOwnerRoleId = await Role.findOne({ name: 'storeOwner' }).select('_id');

        // Update the user's role to "storeOwner" and add store
        await User.findByIdAndUpdate(userId, { roles: [storeOwnerRoleId], store: savedStore._id });

        return res.status(200).json({
            success: true,
            data: savedStore,
            message: "Store added successfully",
        });
    } catch (error) {
        console.error("Error adding store:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}

// Fetch a store by ID
const getStoreById = async (req, res) => {
    try {
        // Extract the store ID from the request parameters
        const id = req.params.id;
        // Find the store by ID in the database
        const store = await Store.findById(id);
        // Check if the store exists; if not, return a 404 response
        if (!store) {
            return res.status(404).json({ success: false, message: "Store not found" });
        }
        // Send a JSON response with the retrieved store
        return res.status(200).json({ success: true, data: store });
    } catch (error) {
        // Log and handle errors if any occur during the process
        console.error("Error fetching store by ID:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Delete a store by ID along with its associated products and categories
const deleteStoreById = async (req, res) => {
    try {
        const userId = req.params.id;
        // Find the user by ID in the database
        const users = await User.findById(userId);
        if (!users) {
            return res.status(400).json({ success: false, message: 'user Not found' });
        }
        const storeId = users.store;
        // Find the store by ID in the database
        const store = await Store.findById(storeId);

        // Check if the store exists; if not, return a 404 response
        if (!store) {
            return res.status(404).json({ success: false, message: "Store not found" });
        }
        // Find Category associated with the store
        const CategoryToDelete = await Category.find({ store: storeId });
        // Delete the categories and their associated store
        for (const category of CategoryToDelete) {
            // Remove the product document
            await Category.findByIdAndRemove(category._id);
        }
        // Find products associated with the store
        const productsToDelete = await Product.find({ store: storeId });
        // Delete the product images from cloudinary and their associated categories
        for (const product of productsToDelete) {
            await cloudinary.uploader.destroy(product.img);
            await cloudinary.uploader.destroy(product.img_id);
            // Remove the product document
            await Product.findByIdAndRemove(product._id);
        }
        // Update users referencing the deleted store
        await User.updateMany({ store: storeId }, { $unset: { store: 1 } });
        // Remove the store from the database
        await store.remove();
        // Send a JSON response indicating success
        return res.status(200).json({ success: true, message: "Store and associated products and Category deleted successfully" });
    } catch (error) {
        // Log and handle errors if any occur during the process
        console.error("Error deleting store and associated products and Category:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Update a store by ID
const updateStoreById = async (req, res) => {
    const { name, description, address, city, phone, discount, cheapestPrice, lic_no, active } = req.body;
    try {
        const userId = req.params.id;
        // // Find the user by ID in the database
        const users = await User.findById(userId);
        if (!users) {
            return res.status(400).json({ success: false, message: 'user Not found' });
        }
        const storeId = users.store;
        // Find the store by ID in the database
        const storeFound = await Store.findById(storeId);
        // Check if the store exists; if not, return a 404 response
        if (!storeFound) {
            return res.status(404).json({ success: false, message: "Store not found" });
        }
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
            img = storeFound.img;
            img_id = storeFound.img_id;
        }
        // Update the store properties based on the request body
        const updatedStore = await Store.findByIdAndUpdate(
            storeId,
            {
                name: name || storeFound.name,
                description: description || storeFound.description,
                address: address || storeFound.address,
                city: city || storeFound.city,
                phone: phone || storeFound.phone,
                lic_no: lic_no || storeFound.lic_no,
                discount: discount || storeFound.discount,
                cheapestPrice: cheapestPrice || storeFound.cheapestPrice,
                img,
                img_id,
                active: active || storeFound.active,
            },
            { new: true }
        );
        // Send a JSON response with the updated store information
        return res.status(200).json({ success: true, data: updatedStore, message: "Store updated successfully" });
    } catch (error) {
        // Log and handle errors if any occur during the process
        console.error("Error updating store:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


// Export the functions to be used as controllers in the application routes
module.exports = { getAllStores, postNewStore, getStoreById, deleteStoreById, updateStoreById };
