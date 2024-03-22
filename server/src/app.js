const express = require("express");
const app = express();
const cors = require('cors');
require("dotenv").config({ path: ".env" });
const path = require("path");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger');


// Importing and using various routes
const productsRouter = require("./routes/productRouter.js");
const usersRouter = require("./routes/usersRouter.js");
const authRouter = require("./routes/authRouter.js");
const contactRouter = require("./routes/contactRouter.js");
const newsletterRouter = require("./routes/newsletterRouter.js");
const ordersRouter = require("./routes/ordersRouter.js");
const categoriesRouter = require("./routes/categoriesRouter.js");
const storeRoutes=require('./routes/storeRoutes.js');


// Middleware for parsing URL-encoded and JSON request bodies
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Middleware for parsing cookies
app.use(cookieParser());

// Enable CORS for cross-origin requests
// app.use(cors());

// HTTP request logger middleware (Morgan) with "tiny" format
app.use(morgan("tiny"));


// Serve static files from the "media" directory
// app.use("/media", express.static(path.join(__dirname, "storage", "upload")));

// Serve frontend build in production mode
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "/client", "build")));
//   app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "/client", "build", "index.html"));
//   });
// } else {
//   // Serve frontend in development mode
//   app.use(express.static(path.join(__dirname, "/client")));
// }

// Enable CORS for all origins in development mode
// if (process.env.NODE_ENV === "development") {
//   app.use(cors({
//     exposedHeaders: ['Cookie', 'Authorization'],
//     credentials: true,
//     origin: process.env.ACCESS_CONTROL_ALLOW_ORIGIN,
//   }));
// }

// CORS middleware to allow requests from Swagger UI
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Define routes with tags
/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization
 */
app.use("/api/auth", authRouter);

/**
 * @swagger
 * tags:
 *   name: User Management
 *   description: APIs for managing users
 */
app.use("/api/users", usersRouter);
/**
 * @swagger
 * tags:
 *   name: Stores
 *   description: APIs for managing stores
 */
app.use("/api/stores", storeRoutes);

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: APIs for managing categories
 */
app.use("/api/categories", categoriesRouter);

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: APIs for managing products
 */
app.use("/api/products", productsRouter);

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: APIs for managing orders
 */
app.use("/api/orders", ordersRouter);

/**
 * @swagger
 * tags:
 *   name: Newsletter
 *   description: APIs for managing newsletters
 */
app.use("/api/newsletter",  newsletterRouter);

/**
 * @swagger
 * tags:
 *   name: Contact
 *   description: APIs for managing contact
 */
app.use("/api/contact", contactRouter);


// Serve the Swagger UI using the generated documentation
app.use('/api/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = app;
