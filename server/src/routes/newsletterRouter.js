const router = require("express").Router();
const {verifyToken} = require("../middleware/authJwt");
// Import the controller function for subscribing users to the newsletter
const { subscribeUser } = require("../controllers/newsLetterController");

// Define a POST route for handling newsletter subscriptions
/**
 * @swagger
 * /api/newsletter/subscription:
 *   post:
 *     summary: Subscribe a user to the newsletter
 *     description: Subscribe a user to the newsletter based on their email.
 *     tags:
 *       - Newsletter
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userEmail:
 *                 type: string
 *                 description: The email of the user to subscribe.
 *       security:
 *       - bearerAuth: []  # Reference to the security scheme
 *     responses:
 *       '200':
 *         description: Successfully subscribed user to the newsletter
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Subscription successful"
 *       '404':
 *         description: User Not Found
 *         content:
 *           application/json:
 *             example:
 *               message: "No user found"
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Subscription failed"
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.post("/subscription", [verifyToken],subscribeUser);

module.exports = router;
