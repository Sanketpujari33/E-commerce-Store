// const { Order } = require("../models/orderModel");
// import Razorpay from "razorpay";

// // Function to create a new order
// export const createOrder = (request, response) => {
//     try {
//         // Initialize the Razorpay instance
//         const instance = new Razorpay({
//             key_id: process.env.RAZORPAY_KEY_ID,
//             key_secret: process.env.RAZORPAY_KEY_SECRET,
//         });

//         console.log(request.body);

//         const options = {
//             amount: request.body.price,
//             currency: "INR",
//         };

//         // Create a new order using the Razorpay instance
//         instance.orders.create(options, (error, order) => {
//             if (error) {
//                 console.error(error);
//                 response.status(500).send("Some error occurred");
//             } else {
//                 response.send(order);
//             }
//         });
//     } catch (error) {
//         console.error(error);
//         response.status(500).send(error);
//     }
// };

// // Function to handle payment and update the order as paid
// export const payOrder = async (request, response) => {
//     try {
//         const { amount, razorpayPaymentId, razorpayOrderId, razorpaySignature } =
//             request.body;

//         // Create a new order and mark it as paid
//         const newOrder = await Order.create({
//             isPaid: true,
//             amount: amount,
//             razorpay: {
//                 order_id: razorpayOrderId,
//                 payment_id: razorpayPaymentId,
//                 signature: razorpaySignature,
//             },
//         });

//         response.send({ msg: "Payment was successful" });
//     } catch (error) {
//         console.error(error);
//         response.status(500).send(error);
//     }
// };

// // Function to get payment response (for testing)
// export const paymentResponse = async (request, response) => {
//     try {
//         // Retrieve all orders from the database
//         const orders = await Order.find();
//         console.log(orders);
//         response.send(orders);
//     } catch (error) {
//         console.error(error);
//         response.status(500).send(error);
//     }
// };
