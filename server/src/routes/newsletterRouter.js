const router = require("express").Router();

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
 */

router.post("/subscription", subscribeUser);

module.exports = router;
