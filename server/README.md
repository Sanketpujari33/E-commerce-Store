# Backend API Documentation

This document outlines the available endpoints for the E-commerce Store backend API. Ensure proper authentication and authorization for accessing these resources.

## Authentication

No authentication is required for public endpoints. For endpoints requiring authentication, provide the appropriate credentials in the request header.

## Categories

### Get All Categories

**GET** `/api/categories`

### Create a Category

**POST** `/api/categories/{id}`

### Edit Category Name

**PUT** `/api/categories/{id}`

### Delete a Category

**DELETE** `/api/categories/{id}`

## Contact

### Send an Email to the Admin

**POST** `/api/contact`

## Newsletter

### Subscribe a User to the Newsletter

**POST** `/api/newsletter/subscription`

## Orders

### Get All Orders with Optional Filters and Pagination

**GET** `/api/orders`

### Create an Order

**POST** `/api/orders`

### Get an Order by its ID

**GET** `/api/orders/{id}`

### Update the State of an Order

**PUT** `/api/orders/{id}`

### Delete an Order by its ID

**DELETE** `/api/orders/{id}`

### Get All Orders of a User with Pagination

**GET** `/api/orders/user/{userId}`

## Products

### Get All Products

**GET** `/api/products/`

### Get a Product by its ID

**GET** `/api/products/{id}`

### Create a New Product

**POST** `/api/products/{id}`

### Update a Product by its ID

**PUT** `/api/products/{id}`

### Delete a Product by its ID

**DELETE** `/api/products/{id}`

### Add a Review to a Product

**POST** `/api/products/reviews/{id}`

### Update a Review for a Product

**PUT** `/api/products/reviews/{id}`

### Delete a Review from a Product

**DELETE** `/api/products/reviews/{id}`

## Stores

### Get All Stores

**GET** `/api/stores`

### Get a Store by ID

**GET** `/api/stores/{id}`

### Create a New Store

**POST** `/api/stores/{id}`

### Update a Store by ID

**PUT** `/api/stores/{id}`

### Delete a Store by ID

**DELETE** `/api/stores/{id}`

### Add a Review to a Store

**POST** `/api/stores/reviews/{id}`

### Update a Review for a Store

**PUT** `/api/stores/reviews/{id}`

### Delete a Review from a Store

**DELETE** `/api/stores/reviews/{id}`

## User Management

### Get All Users

**GET** `/api/users`

### Update User Profile by ID

**PUT** `/api/users/me`

### Update User's Role by ID

**PUT** `/api/users/role/{id}`

### Delete User by ID

**DELETE** `/api/users/{id}`
