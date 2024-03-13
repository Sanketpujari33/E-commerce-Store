const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        product: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            },
        ],
        store: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Store",
        },
        active: {
            type: Boolean,
            default: true
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

categorySchema.statics.decrementCategoryProducts = function (categoryId) {
    return this.findOneAndUpdate(
        { _id: categoryId },
        { $inc: { quantity: -1 } },
        { new: true }
    );
};

categorySchema.statics.incrementCategoryProducts = function (categoryId) {
    return this.findOneAndUpdate(
        { _id: categoryId },
        { $inc: { quantity: 1 } },
        { new: true }
    );
};

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
