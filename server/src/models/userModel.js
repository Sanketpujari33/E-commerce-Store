const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

// Define the user schema
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: 1, // Index for faster email lookups
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
    },
    address: {
      type: String,
      required: false,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 10,
      unique: true
    },
    roles: [
      {
        type: Schema.Types.ObjectId,
        ref: "Role",
      },
    ],
    subscribed: {
      type: Boolean,
      default: false,
    },
    profileState: {
      type: String,
      default: "incomplete",
      trim: true,
      lowercase: true,
    },
    store:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    client: {
      type: Boolean,
      default: false,
    },
    emailToken: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    versionKey: false, // Removes the __v field
  }
);

// Static methods for password encryption and comparison
userSchema.statics.encryptPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

userSchema.statics.comparePassword = async (password, receivedPassword) => {
  return await bcrypt.compare(password, receivedPassword);
};

// Methods for managing orders and user properties
userSchema.methods.addOrder = function (orderId) {
  this.orders = [...this.orders, orderId];
  return this;
};
userSchema.methods.deleteOrder = async function (orderId) {
  try {
    // Filter out the order from the orders array
    this.orders = this.orders.filter((order) => order.toString() !== orderId.toString());
    // Save the updated user document
    const updatedUser = await this.save();
    return updatedUser;
  } catch (error) {
    throw error;
  }
};

userSchema.methods.setIsClient = function () {
  this.client = true;
  return this;
};

userSchema.methods.subscribe = function () {
  this.subscribed = true;
  return this;
};

// Create the User model
const User = mongoose.model("User", userSchema);

module.exports = User;
