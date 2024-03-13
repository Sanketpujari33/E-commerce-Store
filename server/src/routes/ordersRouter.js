const router = require("express").Router();

// Import controller functions for handling orders
const {
    createOrder,
    getAllOrders,
    getAllUserOrders,
    getOrderById,
    actualizeOrderState,
    deleteOrderById,
} = require("../controllers/ordersControllers");

// Import middleware functions for authentication and order verification
const {
    verifyToken,
    isAdminOrIsModerator,
} = require("../middleware/authJwt");
const {
    checkOrderExist,
    checkProfileState,
    checkAllowedDelete,
    checkAllowedUpdates,
    checkAuthorizedUser,
} = require("../middleware/verifyOrder");
const checkIsValidId = require("../middleware/checkIsValidId");


// Define routes for handling orders
/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders with optional filters and pagination
 *     description: Retrieve a list of orders with optional filters and pagination.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The ID of the order
 *                       orderID:
 *                         type: integer
 *                         description: The ID of the order
 *                       finished:
 *                         type: boolean
 *                         description: Indicates whether the order is finished or not
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: The date and time when the order was created
 *                       client:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: The ID of the client
 *                           name:
 *                             type: string
 *                             description: The name of the client
 *                 total:
 *                   type: integer
 *                   description: The total number of matching results
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Something went wrong, couldn't get orders"
 */

router.get("/", [verifyToken, isAdminOrIsModerator], getAllOrders);
/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create an order
 *     description: Create a new order with the provided information.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orders:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       description: ID of the user placing the order
 *                     products:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           productId:
 *                             type: string
 *                             description: ID of the product in the order
 *                           quantity:
 *                             type: integer
 *                             description: Quantity of the product in the order
 *                           restaurantId:
 *                             type: string
 *                             description: ID of the restaurant associated with the product
 *             example:
 *               orders:
 *                 - userId: "65c77205c886323d341a5a26"
 *                   products:
 *                     - productId: "65c77380c886323d341a5a56"
 *                       quantity: 2
 *                       restaurantId: "65c772fec886323d341a5a32"
 *                     - productId: "65c7749fc886323d341a5a63"
 *                       quantity: 1
 *                       restaurantId: "65c772fec886323d341a5a32"
 *     responses:
 *       '201':
 *         description: Successfully created the order
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The ID of the created order
 *                       client:
 *                         type: string
 *                         description: The ID of the client who placed the order
 *                       description:
 *                         type: array
 *                         description: The array containing product details and order information
 *                       total:
 *                         type: number
 *                         description: The total price of the order
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: The date and time when the order was created
 *       '400':
 *         description: Bad Request - Invalid orders data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid orders data"
 *       '404':
 *         description: Not Found - User, Product, or Restaurant not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User with ID {userId} not found"
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 */

router.post("/", [verifyToken, checkProfileState], createOrder);
/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get an order by its ID
 *     description: Retrieve an order based on its ID.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the order to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved the order
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 successful:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: The ID of the order
 *                     orderID:
 *                       type: integer
 *                       description: The ID of the order
 *                     finished:
 *                       type: boolean
 *                       description: Indicates whether the order is finished or not
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: The date and time when the order was created
 *                     client:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           description: The ID of the client
 *                         name:
 *                           type: string
 *                           description: The name of the client
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Something went wrong, couldn't get the order"
 */

router.get("/:id", [verifyToken, checkIsValidId], getOrderById);
/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     summary: Update the state of an order
 *     description: Update the state of a specific order identified by its ID.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the order to be updated
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               state:
 *                 type: string
 *                 description: The state to update the order (e.g., "liquidated")
 *             example:
 *               state: "liquidated"
 *     responses:
 *       '200':
 *         description: Successfully updated the order state
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Order state updated successfully"
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Something went wrong, the state couldn't be updated"
 *       '404':
 *         description: Not Found - Order not found or user not authorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Order not found or user not authorized"
 *       '400':
 *         description: Bad Request - Invalid state or order is already closed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid state or order is already closed"
 */

router.put(
    "/:id",
    [verifyToken, isAdminOrIsModerator, checkOrderExist, checkAllowedUpdates],
    actualizeOrderState
);
/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Delete an order by its ID
 *     description: Delete a specific order identified by its ID.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the order to be deleted
 *     responses:
 *       '200':
 *         description: Successfully deleted the order
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Order has been deleted"
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Order couldn't be deleted"
 *       '404':
 *         description: Not Found - Order not found or user not authorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Order not found or user not authorized"
 */

router.delete("/:id", [verifyToken, checkAllowedDelete], deleteOrderById);
/**
 * @swagger
 * /api/orders/user/{userId}:
 *   get:
 *     summary: Get all orders of a user with pagination
 *     description: Retrieve all orders associated with a specific user identified by their user ID. Supports pagination with optional query parameters.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user whose orders are to be retrieved
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination (default is 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page (default is 5)
 *     responses:
 *       '200':
 *         description: Successfully retrieved user orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 successful:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'  # Reference to the Order schema
 *                 total:
 *                   type: integer
 *                   example: 10  # Total number of user orders
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Something went wrong, couldn't get user orders"
 *       '404':
 *         description: Not Found - User not found or user not authorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not found or user not authorized"
 */

router.get(
    "/user/:userId",
    [verifyToken, checkAuthorizedUser],
    getAllUserOrders
);

module.exports = router;
