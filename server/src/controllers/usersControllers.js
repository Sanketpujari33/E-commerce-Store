const User = require("../models/userModel");
const { Role } = require("../models/roleModel");
const Store = require("../models/storeModel");
const Product = require("../models/productModel");
const  Category  = require("../models/categoryModel");
const { cloudinary } = require("../config/cloudinary");

// Get all users
async function getAllUsers(req, res) {
    try {
        const users = await User.find().populate("roles");

        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Update user's role by ID
async function updateUserRoleById(req, res) {
    const { roles } = req.body;

    try {
        let roleFound = await Role.findOne({ name: roles });
        if (!roleFound)
            return res
                .status(404)
                .json({ success: false, message: "Role not provided" });

        let user = await User.findById(req.params.id);

        if (!user)
            return res
                .status(404)
                .json({ success: false, message: "User not found" });

        user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: { roles: roleFound._id } },
            { new: true }
        );
        updatedUser = await user.save();

        return res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

async function updateProfileById(req, res) {

    const { profilePicture, email, lastName, name, password, newPassword, area, state, city, } = req.body;
    const number = parseInt(req.body.number);
    const pinCode = parseInt(req.body.pinCodeNumber);
    const streetNumber = parseInt(req.body.houseNo);

    const fullName = `${name} ${lastName}`;
    const userAddress = `${streetNumber}, ${area} ${city} , ${state} - ${pinCode}, ${number} `;
    try {
        const userFound = await User.findById(req.userId);

        if (!userFound) {
            return res.status(404).json({ success: false, message: "User Not Found" });
        }

        let encodedPassword;

        if (newPassword && password) {
            const matchPassword = await User.comparePassword(password, userFound.password);

            if (!matchPassword) {
                return res.status(401).json({
                    token: null,
                    message: "Invalid Password",
                });
            }

            encodedPassword = await User.encryptPassword(newPassword);
        }

        let profileState;

        if ((userAddress || userFound.address) && (number || userFound.number)) {
            profileState = "completed";
        } else {
            profileState = "uncompleted";
        }

        const updatedUserFields = {
            name: fullName || userFound.name,
            password: encodedPassword || userFound.password,
            email: email || userFound.email,
            address: userAddress || userFound.address,
            number: number || userFound.number,
            profileState: profileState,
            profilePicture: profilePicture || userFound.profilePicture,
        };

        const updatedUser = await User.findByIdAndUpdate(
            userFound.id,
            updatedUserFields,
            { new: true }
        );

        // Save the updated user
        await userFound.save();
        return res.status(200).json({
            success: true,
            user: updatedUser,
            message: "User updated successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server-side error" });
    }
}


// Assuming you have defined relationships in your User, Store, Product, and Category models
// Controller to delete a user by ID
async function deleteUserById(req, res) {
    try {
        const userId = req.params.id;

        // Check if the user exists
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        // Delete associated store, products, and categories
        if (user.store) {
            // Find products associated with the store
            const productsToDelete = await Product.find({ store: user.store });
            // Delete the product images from cloudinary and their associated categories
            for (const product of productsToDelete) {
                await cloudinary.uploader.destroy(product.img);
                await cloudinary.uploader.destroy(product.img_id);
                // Remove the product document
                await Product.findByIdAndRemove(product._id);
            }
            // Delete associated categories
            await Category.deleteMany({ store: user.store });
            // Delete the associated store
            const deletedStore = await Store.findByIdAndDelete(user.store);
            await cloudinary.uploader.destroy(deletedStore.img);
            await cloudinary.uploader.destroy(deletedStore.img_id);
            if (!deletedStore) {
                return res.status(500).json({ success: false, message: 'Failed to delete associated store' });
            }
            // Delete associated products
            await Product.deleteMany({ store: user.store });
        }
        // Perform the user deletion
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(500).json({ success: false, message: 'Failed to delete user' });
        }

        return res.status(200).json({ success: true, message: 'User and associated data deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

module.exports = {
    getAllUsers,
    deleteUserById,
    updateUserRoleById,
    updateProfileById,
};
