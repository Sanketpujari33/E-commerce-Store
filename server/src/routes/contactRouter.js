const router = require("express").Router();

// Import the controller function for handling contact form submissions
const { sendToAdminEmail } = require("../controllers/contactControllers");
// Define a POST route for handling contact form submissions
/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Send an email to the admin
 *     description: Send an email to the admin based on the user's contact form submission.
 *     tags:
 *       - Contact
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *                 description: The name of the sender.
 *               userEmail:
 *                 type: string
 *                 format: email
 *                 description: The email of the sender.
 *               userMessage:
 *                 type: string
 *                 description: The message content.
 *               subject:
 *                 type: string
 *                 description: The subject of the email.
 *     responses:
 *       '200':
 *         description: Successfully sent email to admin
 *         content:
 *           application/json:
 *             example:
 *               successful: true
 *               message: "The message has been sent successfully"
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             example:
 *               successful: false
 *               message: "Bad request. Name, email, subject, and message are required."
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               successful: false
 *               message: "Something went wrong"
 */

router.post("/", sendToAdminEmail);

module.exports = router;
