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
const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Category"
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Store",
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    size: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    img: {
      type: String,
      trim: true,
    },
    img_id: {
      type: String,
      trim: true,
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
    sold: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    reviews: [reviewSchema],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

productSchema.statics.decrementQuantityProducts = function (productId) {
  return this.findOneAndUpdate(
    { _id: productId },
    { $inc: { quantity: -1 } },
    { new: true }
  );
};

productSchema.statics.incrementQuantityProducts = function (productId) {
  return this.findOneAndUpdate(
    { _id: productId },
    { $inc: { quantity: 1 } },
    { new: true }
  );
};

productSchema.statics.incrementProductSales = function (productName, quantity) {
  return this.findOneAndUpdate(
    { name: productName },
    { $inc: { sold: quantity } },
    { new: true }
  );
};
const Product = mongoose.model("Product", productSchema);

module.exports = Product;

