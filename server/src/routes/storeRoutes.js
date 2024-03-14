const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

const {
    verifyToken,
    storeOwner,
} = require("../middleware/authJwt");
const checkIsValidId = require('../middleware/checkIsValidId')
const { checkDuplicatedStore, checkStoreExist, checkNewStore } = require('../middleware/verifyStore')
const {
    getAllStores,
    postNewStore,
    getStoreById,
    deleteStoreById,
    updateStoreById
} = require("../controllers/storeController");
const { deleteReview, addReview, updateReview } = require('../controllers/ratingAndReviewsControllers');


// Multer configuration for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "src/storage/upload/image/Stores");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const fileFilter = (req, file, cb) => {
    if (!file) {
        cb(null, false);
    } else {
        cb(null, true);
    }
};

const upload = multer({
    storage: storage,
    limits: { fieldSize: 10 * 1024 * 1024 },
    fileFilter: fileFilter,
});


// Define routes for handling products
/**
 * @swagger
 * /api/stores:
 *   get:
 *     summary: Get all stores
 *     description: Retrieve a list of all stores with optional filters and pagination.
 *     tags:
 *       - Stores
 *     parameters:
 *       - in: query
 *         name: title
 *         description: Filter stores by name (case-insensitive).
 *         schema:
 *           type: string
 *       - in: query
 *         name: active
 *         description: Filter stores by active status.
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *       - in: query
 *         name: sort
 *         description: Sort order for the results.
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         description: Page number for pagination.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         description: Number of items to retrieve per page.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successfully retrieved stores
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - _id: "65c76bfbc886323d341a5a18"
 *                   name: "Store 1"
 *                   active: true
 *                   # ... More store details
 *               total: 10
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Internal Server Error
 */
router.get("/", getAllStores);
/**
 * @swagger
 * /api/stores/{id}:
 *   get:
 *     summary: Get a store by ID
 *     description: Retrieve a store by its unique ID.
 *     tags:
 *       - Stores
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The ID of the store to retrieve.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved store
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 _id: "65c76bfbc886323d341a5a18"
 *                 name: "Store 1"
 *                 active: true
 *                 # ... More store details
 *       '404':
 *         description: Store not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Store not found
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Internal Server Error
 */
router.get("/:id", [checkIsValidId], getStoreById);
/**
 * @swagger
 * /api/stores/{id}:
 *   post:
 *     summary: Create a new store
 *     description: Create a new store and associate it with the specified user.
 *     tags:
 *       - Stores
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The ID of the user to associate with the new store.
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               img:
 *                 type: string
 *                 format: binary
 *               name:
 *                 type: string
 *               lic_no:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               phone:
 *                 type: string
 *               cheapestPrice:
 *                 type: string
 *               discount:
 *                 type: string
 *               description:
 *                 type: string
 *     security:
 *       - bearerAuth: []  # Reference to the security scheme
 *     responses:
 *       '200':
 *         description: Successfully created store
 *       '400':
 *         description: Bad Request
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
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.post("/:id",[verifyToken, upload.single("img"), checkNewStore, checkDuplicatedStore], postNewStore);
/**
 * @swagger
 * /api/stores/{id}:
 *   put:
 *     summary: Update a store by ID
 *     description: Update a store's information based on the provided data.
 *     tags:
 *       - Stores
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The ID of the store to update.
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               img:
 *                 type: string
 *                 format: binary
 *               name:
 *                 type: string
 *               lic_no:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               phone:
 *                 type: string
 *               cheapestPrice:
 *                 type: string
 *               discount:
 *                 type: string
 *               description:
 *                 type: string
 *     security:
 *       - bearerAuth: []  # Reference to the security scheme
 *     responses:
 *       '200':
 *         description: Successfully updated store
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "User not found"
 *       '404':
 *         description: Store Not Found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Store not found"
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Internal Server Error"
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.put("/:id",[verifyToken, storeOwner, upload.single("img"), checkDuplicatedStore,checkStoreExist],updateStoreById);
/**
 * @swagger
 * /api/stores/{id}:
 *   delete:
 *     summary: Delete a store by ID along with its associated products and categories
 *     description: Delete a store, its associated products, and categories based on the provided store ID.
 *     tags:
 *       - Stores
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The ID of the store to delete.
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []  # Reference to the security scheme
 *     responses:
 *       '200':
 *         description: Successfully deleted store, products, and categories
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Store and associated products and Category deleted successfully"
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "User not found"
 *       '404':
 *         description: Store Not Found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Store not found"
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Internal Server Error"
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.delete("/:id", [verifyToken, storeOwner], deleteStoreById);
// Routes for Store Reviews
/**
 * @swagger
 * /api/stores/reviews/{id}:
 *   post:
 *     summary: Add a Review to a Store
 *     description: Endpoint to add a review to a Store.
 *     tags:
 *       - Stores
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the Store to which the review is being added.
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
 *               itemId:
 *                 type: string
 *               rating:
 *                 type: string
 *               comment:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Review added successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Review added successfully
 *       '404':
 *         description: Store not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Store not found
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Internal Server Error
 */
router.post('/reviews/:id',[verifyToken], addReview);
/**
 * @swagger
 * /api/stores/reviews/{id}:
 *   put:
 *     summary: Update a Review for a Store
 *     description: Endpoint to update an existing review for a Store.
 *     tags:
 *       - Stores
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the review to be updated.
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
 *               itemId:
 *                 type: string
 *               reviewId:
 *                 type: string
 *               rating:
 *                 type: integer
 *               comment:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Review updated successfully
 *       '404':
 *         description: Review not found
 *       '500':
 *         description: Internal Server Error
 */
router.put('/reviews/:id',[verifyToken], updateReview);
/** @swagger
 * /api/stores/reviews/{id}:
 *   delete:
 *     summary: Delete a Review from a Store
 *     description: Endpoint to delete an existing review from a Store.
 *     tags:
 *       - Stores
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the Store from which the review is being deleted.
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
 *               itemId:
 *                 type: string
 *               reviewId:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Review deleted successfully
 *       '404':
 *         description: Review not found
 *       '500':
 *         description: Internal Server Error
 */
router.delete('/reviews/:id',[verifyToken], deleteReview);
// Export the router
module.exports = router;
