const Product = require("../models/productModel");
const Store = require("../models/storeModel")
const User = require("../models/userModel");
const { Order } = require("../models/orderModel");
const { emitNewOrder, emitOrderActualization } = require("../config/io");


// Get all orders with optional filters and pagination
async function getAllOrders(req, res) {
    // Initialize query, sorting, page, and limit with default values
    let query = {};
    let sort = "-createdAt";
    let page = 1;
    let limit = 5;

    // Check for query parameters and update query, sort, page, and limit accordingly
    if (req.query.orderID) {
        query.orderID = parseInt(req.query.orderID);
    }
    if (req.query.state) {
        if (req.query.state === "finish") {
            query.finished = true;
        }
        if (req.query.state === "unfinished") {
            query.finished = false;
        }
    }
    if (req.query.sort) {
        sort = req.query.sort;
    }
    if (req.query.page) {
        page = parseInt(req.query.page);
    }
    if (req.query.limit) {
        limit = parseInt(req.query.limit);
    }

    // Calculate the number of documents to skip for pagination
    let skip = (page - 1) * limit;

    try {
        // Find orders based on query, apply sorting, limit, skip, and populate client data
        const orders = await Order.find(query)
            .sort(sort)
            .limit(limit)
            .skip(skip)
            .populate("client")
            .exec();

        // Calculate the total number of matching results
        const totalResults = await Order.find(query).countDocuments();

        return res
            .status(200)
            .json({ successful: true, data: orders, total: totalResults });
    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Something went wrong, couldn't get orders",
        });
    }
};

// Get an order by its ID
async function getOrderById(req, res) {
    try {
        const orderFound = await Order.findById(req.params.id)
            .populate("client")
            .exec();

        return res.status(200).json({ successful: true, data: orderFound });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong, couldn't get the order",
        });
    }
};

// Get all orders of a user with pagination
async function getAllUserOrders(req, res) {
    // Initialize sorting, page, and limit with default values
    let sort = "-createdAt";
    let page = 1;
    let limit = 5;

    // Check for query parameters and update page and limit accordingly
    if (req.query.page) {
        page = parseInt(req.query.page);
    }
    if (req.query.limit) {
        limit = parseInt(req.query.limit);
    }

    // Calculate the number of documents to skip for pagination
    let skip = (page - 1) * limit;

    try {
        // Find the user by ID
        const user = await User.findById(req.params.userId);

        // Find orders associated with the user's order IDs, apply sorting, limit, skip, and populate client data
        const ordersFound = await Order.find({ _id: { $in: user.orders } })
            .sort(sort)
            .limit(limit)
            .skip(skip)
            .populate("client")
            .exec();

        return res.status(200).json({
            successful: true,
            data: ordersFound,
            total: user.orders.length,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong, couldn't get user orders",
        });
    }
};

async function createOrder(req, res) {
    try {
        const { orders } = req.body;

        // Validate that orders array is provided
        if (!orders || !Array.isArray(orders) || orders.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid orders data' });
        }

        // Store created orders
        const createdOrders = [];

        // Loop through each order in the request
        for (const orderInfo of orders) {
            const { userId, products } = orderInfo;

            // Find user by ID
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: `User with ID ${userId} not found` });
            }

            // Calculate total based on product prices and quantities
            let total = 0;

            // Create an array to store order description
            const description = [];

            // Loop through each product in the order
            for (const productInfo of products) {
                const { productId, quantity } = productInfo;

                // Find product by ID
                const product = await Product.findById(productId);
                if (!product) {
                    return res.status(404).json({ success: false, message: `Product with ID ${productId} not found` });
                }

                // Calculate total for each product
                const productTotal = product.price * quantity;

                // Add product details to the order description
                description.push({
                    product: {
                        name: product.name,
                        price: product.price,
                        store: product.store,
                    },
                    quantity: quantity,
                    total: productTotal,
                });

                // Add product total to the overall order total
                total += productTotal;
            }

            // Create an order
            const order = new Order({
                client: userId,
                description: description,
                total: total,
            });
            // Create initial states for the order
            order.createStates();
            // Save the order
            const savedOrder = await order.save();

            // Update user's order list
            user.addOrder(savedOrder._id);
            user.client = true; // Set client to true
            await user.save();

            // Update store's order list
            const firstProduct = products[0];
            const store = await Store.findById(firstProduct.storeId);
            if (!store) {
                return res.status(404).json({ success: false, message: `Store with ID ${firstProduct.storeId} not found` });
            }
            store.addOrder(savedOrder._id);
            await store.save();

            // Add the created order to the response
            createdOrders.push(savedOrder);
        }
        // Emit the new order event using orderEmitter
        emitNewOrder(createdOrders);
        // Respond with the created orders
        return res.status(201).json({ success: true, orders: createdOrders });
    } catch (error) {
        console.error('Error creating order:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

// Update the state of an order
async function actualizeOrderState(req, res) {
    try {
        const order = await Order.findById(req.params.id);
        const clientFound = await User.findById(order.client[0]);

        await order.updateOrderState(req.confirmedState); // Use await here

        if (req.confirmedState === "liquidated") {
            order.closeOrder();
            clientFound.setIsClient();

            const promises = order.description.map((item) =>
                Product.incrementProductSales(item.product.name, item.quantity) // Fix: Access product name
            );

            try {
                await Promise.all(promises);
            } catch (err) {
                console.log(err);
                return res.status(500).json({
                    success: false,
                    message:
                        "Something went wrong, the product sold quantity could not be updated",
                });
            }
        }

        await order.save(); // Use await here
        await clientFound.save();

        // Notify the user about an order actualization
        emitOrderActualization(clientFound._id, order);

        return res
            .status(200)
            .json({ success: true, message: "Order state updated successfully" });
    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Something went wrong, the state couldn't be updated",
        });
    }
}



// Delete an order by its ID
async function deleteOrderById(req, res) {
    try {
        const orderFound = await Order.findById(req.orderId);
        const product = orderFound.description;
        for (const findStore of product) {
            const store = await Store.findById(findStore.product.store);
            store.orders.map((oder) => {
                if (req.orderId == oder) {
                    store.removeOrder(req.orderId);
                }
            })
        }
        // Find the client and remove the order ID from their orders array
        const clientFound = await User.findById(orderFound.client[0]);

        // Call deleteOrder method and save the updated user document
        await clientFound.deleteOrder(req.orderId);
        await orderFound.remove();
        return res.status(200).json({ success: true, message: "Order has been deleted" });
    } catch (err) {
        console.log(err);
        return res
            .status(500)
            .json({ success: false, message: "Order couldn't be deleted" });
    }
};


module.exports = {
    createOrder,
    getAllOrders,
    getOrderById,
    actualizeOrderState,
    deleteOrderById,
    getAllUserOrders,
};