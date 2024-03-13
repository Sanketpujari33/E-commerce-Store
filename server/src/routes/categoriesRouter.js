const router = require("express").Router();

// Import middleware for category validation
const {
    checkDuplicatedCategory,
} = require("../middleware/verifyCategory");

// Import middleware for authentication and authorization
const { verifyToken, isAdmin, storeOwner } = require("../middleware/authJwt");

// Import category controller functions
const {
    getAllCategories,
    deleteCategory,
    editCategoryName,
    createCategory,
} = require("../controllers/categoryControllers");

// Define routes and their associated middleware and controller functions
/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get All Categories
 *     description: Endpoint to retrieve all categories.
 *     tags:
 *       - Categories
 *     responses:
 *       '200':
 *         description: Successful retrieval of categories
 *         content:
 *           application/json:
 *             example:
 *               categories:
 *                 - id: 1
 *                   name: "Category 1"
 *                 - id: 2
 *                   name: "Category 2"
 *               # Include more details based on your actual response structure
 *       # You can add more response codes and descriptions as needed
 */
router.get("/", getAllCategories); // Route to get all categories
/**
 * @swagger
 * /api/categories/{id}:
 *   post:
 *     summary: Create a Category
 *     description: Endpoint to create a new category.
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the user/store owner.
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             example:
 *               id: "65c76bfbc886323d341a5a18"
 *               name: "Pizza"
 *               # Include more details based on your actual response structure
 *       # You can add more response codes and descriptions as needed
 */

router.post(
    "/:id",
    [verifyToken, storeOwner,checkDuplicatedCategory], // Middleware: Verify token, check admin role, and check duplicated category
    createCategory // Controller function: Create a new category
);
/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Edit Category Name
 *     description: Endpoint to edit the name of an existing category.
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the user/store owner.
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryId:
 *                 type: string
 *               categoryNewName:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Category successfully renamed
 *         content:
 *           application/json:
 *             example:
 *               successful: true
 *               category:
 *                 id: "65c61afe4dc5be2a18b3815c"
 *                 name: "puranpoli"
 *               message: "Category successfully renamed"
 *       '404':
 *         description: Category not found
 *         content:
 *           application/json:
 *             example:
 *               successful: false
 *               message: "Category not found"
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               successful: false
 *               message: "Something went wrong, could not update category name"
 */

router.put(
    "/:id",
    [verifyToken, storeOwner,checkDuplicatedCategory], // Middleware: Verify token, check admin role, and check category existence
    editCategoryName // Controller function: Edit the name of an existing category
);
/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete a Category
 *     description: Endpoint to delete a category and its associated products.
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the user/store owner.
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryId:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Category and associated products deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Category and associated products deleted successfully"
 *       '404':
 *         description: Category not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Category not found"
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Something went wrong, could not delete category"
 */

// Sample request object:
// {
//   "categoryId": "65c65c468e49fea6b008bed8"
// }

// Sample response for '200':
// {
//   "success": true,
//   "message": "Category and associated products deleted successfully"
// }

// Sample response for '404':
// {
//   "success": false,
//   "message": "Category not found"
// }

// Sample response for '500':
// {
//   "success": false,
//   "message": "Something went wrong, could not delete category"
// }

router.delete(
    "/:id",
    [verifyToken, storeOwner], // Middleware: Verify token, check admin role, and check category existence
    deleteCategory // Controller function: Delete an existing category
);

module.exports = router;
