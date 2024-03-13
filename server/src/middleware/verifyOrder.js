const User = require("../models/userModel");
const { Order, STATES } = require("../models/orderModel");
const ObjectId = require("mongoose").Types.ObjectId;

// Middleware to check if the user's profile state is complete
async function checkProfileState(req, res, next) {
    try {
        const userFound = await User.findById(req.userId);

        if (userFound.profileState === "incomplete") {
            return res
                .status(403)
                .json({
                    successful: false,
                    message:
                        "User cannot place an order without basic shipping information",
                });
        }

        // If the profile state is complete, proceed to the next middleware
        next();
    } catch (err) {
        console.log(err);

        res
            .status(500)
            .json({
                success: false,
                message: "Something went wrong, profile state verification failed",
            });
    }
};

// Middleware to check if the order with the given ID exists
async function checkOrderExist(req, res, next) {
    try {
        const orderFound = await Order.findById(req.params.id);
        if (!orderFound) {
            return res
                .status(404)
                .json({ success: false, message: "No order found" });
        }

        // If the order exists, set req.orderId and req.order for later use
        req.orderId = orderFound._id;
        req.order = orderFound;

        // Proceed to the next middleware
        next();
    } catch (err) {
        console.log(err);
        res
            .status(500)
            .json({
                success: false,
                message: "Something went wrong, order verification failed",
            });
    }
};

// Middleware to check if the user is authorized to perform an action on the order
async function checkAuthorizedUser(req, res, next) {
    const isOrderOwner = req.userId === req.params.userId;

    if (!isOrderOwner) {
        return res
            .status(403)
            .json({ success: false, message: "Unauthorized User" });
    }

    // If the user is authorized, proceed to the next middleware
    next();
};

// Middleware to check if the provided state for an order update is valid
async function checkAllowedUpdates(req, res, next) {
    try {
        const isValid = STATES.indexOf(req.body.state);

        if (isValid === -1) {
            return res
                .status(404)
                .json({ success: false, message: "State not valid" });
        }

        // If the state is valid, set req.confirmedState for later use
        req.confirmedState = req.body.state;

        const orderFound = await Order.findById(req.orderId);

        const findAlreadySetState = orderFound.states.find(
            (state) => state.confirmed === true && state.name === req.confirmedState
        );

        if (findAlreadySetState) {
            return res
                .status(400)
                .json({
                    successful: false,
                    message: `State ${req.confirmedState} has already been set`,
                });
        }

        // Proceed to the next middleware
        next();
    } catch (err) {
        console.log(err);
        res
            .status(500)
            .json({
                success: false,
                message: "Something went wrong, allowed updates verification failed",
            });
    }
};

// Middleware to check if an order can be deleted
async function checkAllowedDelete(req, res, next) {
    try {
        const orderFound = await Order.findById(req.params.id);

        if (!orderFound) {
            return res
                .status(404)
                .json({ success: false, message: "No order found" });
        }
        if (orderFound.states[1].confirmed) {
            return res
                .status(401)
                .json({ success: false, message: "Can't delete order once accepted" });
        }

        // If the order can be deleted, set req.orderId and req.order for later use
        req.orderId = req.params.id;
        req.order = orderFound;

        // Proceed to the next middleware
        next();
    } catch (err) {
        console.log(err); 
        
        res
            .status(500)
            .json({
                success: false,
                message: "Something went wrong, order delete failed",
            });
    }
};

module.exports = {
    checkOrderExist,
    checkAllowedUpdates,
    checkProfileState,
    checkAllowedDelete,
    checkAuthorizedUser,
};