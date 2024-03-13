const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        rating: { type: Number, required: true },
        comment: { type: String, required: true },
    },
    {
        timestamps: true,
    }
)

const storeSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        img: {
            type: String,
            trim: true,
        },
        img_id: {
            type: String,
            trim: true,
        },
        address: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        orders: [
            {
                type: Schema.Types.ObjectId,
                ref: "Order",
            },
        ],
        lic_no:{ 
            type: String,
            required: true,
        },
        category: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Category"
            },
        ],
        discount : {
            type: String,
            required: true,
        },
        cheapestPrice: {
            type: Number,
            required: true,
        },
        storeOwner: [
            {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: "User",
            },
        ],
        active: {
            type: Boolean,
            required: true,
            default: true,
        },
        reviews: [reviewSchema],
        rating: {
            type: Number,
            required: true,
            default: 0,
        },
        numReviews: {
            type: Number,
            required: true,
            default: 0,
        },
    })
// Add the addOrder method to the schema
storeSchema.methods.addOrder = function (orderId) {
    this.orders.push(orderId);
    return this;
};
// Add the removeOrder method to the schema
storeSchema.methods.removeOrder = async function (orderId) {
    try {
        // Use $pull to remove the order from the orders array
        this.orders.pull(orderId);

        // Save the updated document
        const updatedStore = await this.save();

        return updatedStore;
    } catch (error) {
        throw error;
    }
};
const Store = mongoose.model("Store", storeSchema)
module.exports = Store;
