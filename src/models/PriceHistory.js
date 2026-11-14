import mongoose from "mongoose";

const priceHistorySchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    index: true,
  },

  price: {
    type: Number,
    required: true,
  },

  currency: {
    type: String,
    required: true,
  },

  recordedAt: {
    type: Date,
    default: Date.now,
  },
});

export const PriceHistory = mongoose.model("PriceHistory", priceHistorySchema);
