const { Role } = require("../models/roleModel");
const User = require("../models/userModel");
require("dotenv").config({ path: ".env" });
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const createRoles = async () => {
    try {
        const count = await Role.estimatedDocumentCount({ timeout: 30000 }); // Increase the timeout to 30 seconds
        if (count > 0) return;
        
        const rolesToCreate = ["user", "moderator", "admin", "storeOwner"].map((name) => ({ name }));
        const createdRoles = await Role.create(rolesToCreate);

        console.log("Roles Created:", createdRoles);
    } catch (err) {
        console.error("Error creating roles:", err);
    }
};

const createUserIfNotExists = async (userData) => {
    try {
        const user = await User.findOne({ email: userData.email });
        const roles = await Role.find({ name: userData.roles });

        if (!user) {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const token = jwt.sign({ id: userData.id }, process.env.JWT_EMAIL_CONFIRMATION_KEY);

            const newUser = await User.create({
                ...userData,
                password: hashedPassword,
                emailToken: token,
                roles: roles.map((role) =>[role.id]),
            });
            console.log(`${userData.name} User Created! User role ${newUser.roles}`);
        }
    } catch (err) {
        console.error(`Error creating ${userData.name} user:`, err);
    }
};
const createAdmin = async () => {
    try {
        const adminData = {
            name: "admin",
            email: "admin@localhost.com",
            roles: "admin",
            mobile: "1945514235",
            password: "admin", // Change this to a secure password.
        };

        await createUserIfNotExists(adminData);
    } catch (err) {
        console.error("Error creating admin user:", err);
    }
};

const createModerator = async () => {
    try {
        const moderatorData = {
            name: "moderator",
            email: "moderator@localhost.com",
            roles: "moderator",
            mobile: "1945514238",
            password: "moderator", // Change this to a secure password.
        };

        await createUserIfNotExists(moderatorData);
    } catch (err) {
        console.error("Error creating moderator user:", err);
    }
};

module.exports = { createRoles, createAdmin, createModerator };
