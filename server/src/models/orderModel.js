const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const STATES = ["shipped", "accepted", "dispatched", "delivered", "liquidated"];

const orderSchema = new Schema(
  {
    orderID: { type: Number, default: Date.now },
    client: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
      },
    ],
    description: [{
        product: {
          name: { 
            type: String, 
            required: true, 
            trim: true, 
            lowercase: true 
          },
          price: { 
            type: Number, 
            default: 0 
          },
          store:{
            type: Schema.Types.ObjectId,
            required: true, 
            ref: "Store",
          }
        },
        quantity: { type: Number, default: 1 },
        total: { type: Number, default: 0 },
      },
    ],
    total: { type: Number, default: 0 },
    states: [
      {
        name: { type: String, default: "" },
        confirmed: { type: Boolean, default: false },
        date: { type: Date },
      },
    ],
    finished: { type: Boolean, default: false },
    razorpay: {
      order_id: String,
      payment_id: String,
      signature: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

orderSchema.methods.createStates = function createStates() {
  this.states = STATES.map((state) => ({
    name: state,
    confirmed: state === "shipped",
    date: state === "shipped" ? Date.now() : null,
  }));
  return this;
};

orderSchema.methods.updateOrderState = async function (confirmedState) {
  const updatedStates = this.states.map((state) => {
    if (state.name === confirmedState) {
      return { ...state.toObject(), date: Date.now(), confirmed: true };
    }
    return state.toObject();
  });
  this.states = updatedStates;
  return this;
};
orderSchema.methods.closeOrder = function () {
  this.finished = true;
  return this;
};
const Order = mongoose.model("Order", orderSchema);

module.exports = { Order, STATES };
