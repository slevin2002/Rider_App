import mongoose, { Schema } from "mongoose";

const SellerSchema = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const Seller = mongoose.model("Seller", SellerSchema);

export default Seller;
