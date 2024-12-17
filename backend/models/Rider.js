import mongoose, { Schema } from "mongoose";

const RiderSchema = new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  VehicleType: { type: String },
  City: { type: String },
  Area: { type: String },
  Aadhar: { type: String },
  Image: { type: String },
  IsPaid: { type: Boolean },
  IsActive: { type: Boolean },
  PaymentDetails: [
    {
      paymentId: { type: String },
      amount: { type: Number },
      date: { type: Date, default: Date.now },
    },
  ],

  IsVerified: { type: Boolean, default: false },
});

const Rider = mongoose.model("Riders", RiderSchema);

export default Rider;
