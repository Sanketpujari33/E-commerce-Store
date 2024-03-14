// Import required modules and middleware
const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const {
  getAllProducts,
  getProductById,
  postNewProduct,
  updateProductById,
  deleteProductById,
} = require("../controllers/productsControllers");
const { verifyToken, isAdmin, storeOwner} = require("../middleware/authJwt");
const {checkCategoryExist} = require("../middleware/verifyProduct");
const checkIsValidId = require("../middleware/checkIsValidId");
const { deleteReview, addReview, updateReview } = require('../controllers/ratingAndReviewsControllers');


// Multer configuration for handling file uploads
const storageProduct = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, "src/storage/upload/image/Product");
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

const uploadProduct = multer({
  storage: storageProduct,
  limits: { fieldSize: 10 * 1024 * 1024 },
  fileFilter: fileFilter,
});

// Define routes for handling products
/**
 * @swagger
 * /api/products/:
 *   get:
 *     summary: Get all products.
 *     description: Retrieve a list of all products with optional filters and pagination.
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: title
 *         description: Filter products by name (case-insensitive).
 *         schema:
 *           type: string
 *       - in: query
 *         name: active
 *         description: Filter products by active status.
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
 *         description: Successfully retrieved products.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 -   # First product details
 *                     // ...
 *                 -   # Second product details
 *                     // ...
 *               total: 42  # Total number of products
 *       '500':
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Internal Server Error
 */
router.get("/", getAllProducts);
/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by its ID
 *     description: Retrieve details of a product based on its ID.
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the product to be retrieved.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved product.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *       '404':
 *         description: Product not found.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Product not found
 *       '500':
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Internal Server Error
 */
router.get("/:id", [checkIsValidId], getProductById);
/**
 * @swagger
 * /api/products/{id}:
 *   post:
 *     summary: Create a new product
 *     description: Create a new product and associate it with a store and category.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the user (store owner) creating the product.
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
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               size:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: integer
 *               active:
 *                 type: boolean
 *               img:
 *                 type: file
 *             required:
 *               - name
 *               - category
 *               - size
 *               - description
 *               - price
 *               - active
 *               - img
 *           encoding:
 *             img:
 *               contentType: "image/*"
 *     responses:
 *       '201':
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 // New product details
 *       '400':
 *         description: Bad Request. Validation errors or other issues.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Validation error or other issues
 */
router.post("/:id",[verifyToken, storeOwner, uploadProduct.single("img"), checkCategoryExist],postNewProduct);
/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product by its ID
 *     description: Update an existing product by its ID. Only accessible by the store owner.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the user (store owner) update the product.
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
 *               productId:
 *                 type: string
 *               name:
 *                 type: string
 *               size:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: integer
 *               active:
 *                 type: boolean
 *               img:
 *                 type: string
 *             required:
 *               - productId
 *           encoding:
 *             img:
 *               contentType: "image/*"
 *     responses:
 *       '200':
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 // Updated product details
 *       '400':
 *         description: Bad Request. Validation errors or other issues.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Validation error or other issues
 *       '404':
 *         description: Product not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Product not found
 */
router.put("/:id",[verifyToken, storeOwner, uploadProduct.single("img"),checkCategoryExist],updateProductById);
/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product by its ID
 *     description: Delete an existing product by its ID. Only accessible by the store owner.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the user (store owner) delete the product.
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
 *               productId:
 *                 type: string
 *             required:
 *               - productId
 *     responses:
 *       '204':
 *         description: Product deleted successfully
 *       '404':
 *         description: Product not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Product not found
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Something went wrong, the product was not deleted correctly
 */
router.delete("/:id", [verifyToken, storeOwner], deleteProductById);
/**
 * @swagger
 * /api/products/reviews/{id}:
 *   post:
 *     summary: Add a Review to a Product
 *     description: Endpoint to add a review to a product.
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the product to which the review is being added.
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
 *         description: Product not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Product not found
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
 * /api/products/reviews/{id}:
 *   put:
 *     summary: Update a Review for a Product
 *     description: Endpoint to update an existing review for a product.
 *     tags:
 *       - Products
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
 * /api/products/reviews/{id}:
 *   delete:
 *     summary: Delete a Review from a Product
 *     description: Endpoint to delete an existing review from a product.
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the product from which the review is being deleted.
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

module.exports = router;
