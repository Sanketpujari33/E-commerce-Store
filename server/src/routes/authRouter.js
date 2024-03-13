const router = require("express").Router();

const {
  login,
  signUp,
  validateEmailToken,
  sendConfirmationEmail,
  sendResetPasswordEmail,
  resetPassword,
  logout,
  getSession } = require("../controllers/authControllers");

// Import middleware to check for duplicated email during sign-up
const { checkDuplicatedEmail } = require("../middleware/verifySignUp");

// Import middleware to check the validity of user data during sign-up
const { checkIsValidUser } = require("../middleware/userValidator");
// Define routes and associated controllers
/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: User Sign Up
 *     description: Endpoint to register a new user.
 *     tags:
 *       - Authentication
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
 *               mobile:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       '200':
 *         description: Successful sign-up
 *       '400':
 *         description: Bad request, check your request payload
 *       '401':
 *         description: Unauthorized, authentication failed
 *       '409':
 *         description: Conflict, user with the provided email already exists
 *       '500':
 *         description: Internal Server Error, something went wrong on the server
 *       # You can add more response codes and descriptions as needed
 */
router.post("/signup", [checkDuplicatedEmail, checkIsValidUser], signUp); // Sign-up route

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User Login
 *     description: Endpoint for user login.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successful login
 *       '400':
 *         description: Bad request, check your request payload
 *       '401':
 *         description: Unauthorized, invalid credentials
 *       '404':
 *         description: Not Found, user not found
 *       '500':
 *         description: Internal Server Error, something went wrong on the server
 */
router.post("/login", login); // Login route
/**
 * @swagger
 * /api/auth/session:
 *   get:
 *     summary: Get User Session
 *     description: Endpoint to retrieve user session information.
 *     tags:
 *       - Authentication
 *     responses:
 *       '200':
 *         description: Successful retrieval of user session
 *         content:
 *           application/json:
 *             example:
 *               // Include an example response if applicable
 */
router.get("/session", getSession); // Get session information route
/**
 * @swagger
 * /api/auth/forgotPassword:
 *   post:
 *     summary: Forgot Password
 *     description: Request to reset user password. An email will be sent with instructions.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Password reset email sent successfully
 *       # You can add more response codes and descriptions as needed
 */
router.post("/forgotPassword", sendResetPasswordEmail); // Forgot password route
/**
 * @swagger
 * /api/auth/resetPassword/{token}:
 *   post:
 *     summary: Reset Password
 *     description: Reset user password using the provided token.
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         description: Token received for password reset.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Password reset successful
 *       # You can add more response codes and descriptions as needed
 */
router.post("/resetPassword/:token", resetPassword); // Reset password route
/**
 * @swagger
 * /api/auth/confirmation:
 *   post:
 *     summary: Send Confirmation Email
 *     description: Request to send a confirmation email for account activation.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Confirmation email sent successfully
 *       # You can add more response codes and descriptions as needed
 */
router.post("/confirmation", sendConfirmationEmail); // Send confirmation email route
/**
 * @swagger
 * /api/auth/verification/{token}:
 *   get:
 *     summary: Validate Email Token
 *     description: Validate the email verification token.
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         description: The email verification token.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Email verification successful
 *       # You can add more response codes and descriptions as needed
 */
router.get("/verification/:token", validateEmailToken); // Email verification route
/**
 * @swagger
 * /api/auth/logout:
 *   get:
 *     summary: User Logout
 *     description: Endpoint to log out the authenticated user.
 *     tags:
 *       - Authentication
 *     responses:
 *       '200':
 *         description: User successfully logged out
 *       # You can add more response codes and descriptions as needed
 */
router.get("/logout", logout); // Logout route


module.exports = router;
