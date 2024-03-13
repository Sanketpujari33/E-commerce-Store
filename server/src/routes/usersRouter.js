// Import required modules and middleware

const router = require("express").Router();

const { getAllUsers,updateUserRoleById,deleteUserById, updateProfileById} = require("../controllers/usersControllers");

const { verifyToken, isAdmin, storeOwner } = require("../middleware/authJwt");
const { checkIsValidUpdate} = require("../middleware/userValidator");

// Define routes for handling user-related operations
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users with their roles.
 *     tags:
 *       - User Management
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved all users
 *         content:
 *           application/json:
 *             example:
 *               - _id: "65c76bfbc886323d341a5a18"
 *                 username: "example_user"
 *                 email: "user@example.com"
 *                 roles:
 *                   - _id: "65c76bfbc886323d341a5a19"
 *                     name: "user"
 *                     description: "Regular user"
 *               - _id: "65c76bfbc886323d341a5a20"
 *                 username: "admin_user"
 *                 email: "admin@example.com"
 *                 roles:
 *                   - _id: "65c76bfbc886323d341a5a21"
 *                     name: "admin"
 *                     description: "Administrator"
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Internal Server Error
 */

router.get("/", [verifyToken, isAdmin], getAllUsers);
/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Update user profile by ID
 *     description: Update the user's profile information based on the provided data.
 *     tags:
 *       - User Management
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Bearer token obtained after user login.
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               number:
 *                 type: string
 *               area:
 *                 type: string
 *               houseNo:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               pinCodeNumber:
 *                 type: string
 *               profilePicture:
 *                 type: file
 *     responses:
 *       '200':
 *         description: Successfully updated user profile
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               user:
 *                 _id: "65c76739bb12c52c68d2ff9c"
 *                 name: "poonam"
 *                 lastName: "ambadkar"
 *                 email: "sanketpujari@gmail.com"
 *                 number: "7378768735"
 *                 area: "nagar manmad road, kolhar kh.,"
 *                 houseNo: "3338"
 *                 city: "Ahmednagar"
 *                 state: "Maharashtra"
 *                 pinCodeNumber: "413710"
 *                 profilePicture: "profile-picture-url"
 *                 profileState: "completed"
 *               message: "User updated successfully"
 *       '404':
 *         description: User Not Found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "User Not Found"
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Server-side error"
 */

router.put("/me", [verifyToken, checkIsValidUpdate], updateProfileById);
/**
 * @swagger
 * /api/users/role/{id}:
 *   put:
 *     summary: Update user's role by ID
 *     description: Update the role of a user based on the provided role name.
 *     tags:
 *       - User Management
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The ID of the user to update.
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roles:
 *                 type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully updated user's role
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 _id: "65c76bfbc886323d341a5a18"
 *                 username: "example_user"
 *                 email: "user@example.com"
 *                 roles:
 *                   - _id: "65c76bfbc886323d341a5a19"
 *                     name: "user"
 *                     description: "Regular User"
 *       '404':
 *         description: Not Found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Role not provided"            
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Internal Server Error
 */

router.put("/role/:id",[verifyToken, isAdmin],updateUserRoleById);
/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     description: Delete a user and associated data (store, products, and categories) by ID.
 *     tags:
 *       - User Management
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The ID of the user to be deleted.
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *     responses:
 *       '200':
 *         description: Successfully deleted user and associated data
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "User and associated data deleted successfully"
 *       '404':
 *         description: User Not Found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "User not found"
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Internal Server Error"
 *       '503':
 *         description: Failed to delete associated store
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Failed to delete associated store"
 */

router.delete("/:id", [verifyToken],deleteUserById)
module.exports = router;
