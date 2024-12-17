import express from "express";
import multer from "multer";
import path from "path";
import Razorpay from "razorpay"; 
import Rider from "../models/Rider.js";
import {
  generateToken,
  authenticateToken,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Save Rider Data
router.post("/saveRider", authenticateToken, async (req, res) => {
  const { VehicleType} = req.body;
  const { userId } = req.user;

  if (!VehicleType) {
    return res.status(400).json({ error: "Select a vehicle type." });
  }

  try {
    // Check if a rider document already exists for the user
    const existingRider = await Rider.findOne({ userId });
    console.log(existingRider);
    if (existingRider) {
      // Update the existing rider document
      const updatedRider = await Rider.findOneAndUpdate(
        { userId },
        { VehicleType},
        { new: true } // Return the updated document
      );
      return res.status(200).json({
        message: "Rider data updated successfully",
        rider: updatedRider,
      });
    } else {
      // Create a new rider document
      const newRider = new Rider({
        userId,
        VehicleType
      });

      await newRider.save();
      return res
        .status(201)
        .json({ message: "Rider data saved successfully", rider: newRider });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Save Work City
router.put("/saveCity", authenticateToken, async (req, res) => {
  const { userId } = req.user; // Ensure userId is available from the token
  const { selectedCity } = req.body;

  if (!selectedCity) {
    return res.status(400).json({ error: "City is required" });
  }
  if (!userId) {
    return res.status(400).json({ error: "User not authenticated" });
  }

  try {
    // Log userId to make sure it's being passed correctly
    console.log("User ID from token:", userId);

    // Find the rider by userId and update the workCity field
    const rider = await Rider.findOneAndUpdate(
      { userId }, // Ensure you're querying by userId
      { City: selectedCity },
      { new: true } // Return the updated document
    );

    // Check if rider document exists
    if (!rider) {
      return res.status(404).json({ error: "Rider not found" });
    }

    // If the update is successful, return the updated rider
    res.status(200).json({ message: "City updated successfully", rider });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/saveArea", authenticateToken, async (req, res) => {
  const { userId } = req.user; // Ensure userId is available from the token
  const { selectedArea } = req.body;

  if (!selectedArea) {
    return res.status(400).json({ error: "Area is required" });
  }

  if (!userId) {
    return res.status(400).json({ error: "User not authenticated" });
  }

  try {
    // Log userId to make sure it's being passed correctly
    console.log("User ID from token:", userId);

    // Find the rider by userId and update the city and area fields
    const rider = await Rider.findOneAndUpdate(
      { userId }, // Ensure you're querying by userId
      { Area: selectedArea }, // Save both city and area
      { new: true } // Return the updated document
    );

    if (!rider) {
      return res.status(404).json({ error: "Rider not found" });
    }

    res
      .status(200)
      .json({ message: "City and Area updated successfully", rider });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/saveAadhar", authenticateToken, async (req, res) => {
  const { userId } = req.user; // Ensure userId is available from the token
  const { aadhaarNumber } = req.body;

  if (!aadhaarNumber) {
    return res.status(400).json({ error: "Aadhar Number required" });
  }

  if (!userId) {
    return res.status(400).json({ error: "User not authenticated" });
  }

  try {
    // Log userId to make sure it's being passed correctly
    console.log("User ID from token:", userId);

    // Find the rider by userId and update the city and area fields
    const rider = await Rider.findOneAndUpdate(
      { userId }, // Ensure you're querying by userId
      { Aadhar: aadhaarNumber }, // Save both city and area
      { new: true } // Return the updated document
    );

    if (!rider) {
      return res.status(404).json({ error: "Rider not found" });
    }

    res
      .status(200)
      .json({ message: "City and Area updated successfully", rider });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store images in the 'uploads' folder
    cb(null, "uploads/profile/");
  },
  filename: (req, file, cb) => {
    // Generate a unique filename for each file
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Save Photo (Handles photo upload)
router.put(
  "/uploadPhoto",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const imagePath = `/uploads/profile/${req.file.filename}`; // Save the image path in the database

    // You can optionally save the image URL in the database here
    try {
      const { userId } = req.user;

      // Update the user's profile or other database operations
      const rider = await Rider.findOneAndUpdate(
        { userId },
        { Image: imagePath }, // Save image path or URL to the database
        { new: true }
      );

      if (!rider) {
        return res.status(404).json({ error: "Rider not found" });
      }

      res.status(200).json({
        success: true,
        message: "Photo uploaded successfully",
        imageUrl: imagePath,
      });
    } catch (error) {
      console.error("Error saving image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Save Payment Status
router.post("/savePaymentStatus",authenticateToken, async (req, res) => {
  const { paymentId, amount } = req.body;

  if (!paymentId || !amount) {
    return res.status(400).json({ error: "Missing payment details" });
  }

  try {
    // Save payment details in the database (update this to fit your schema)
    const updatedRider = await Rider.findOneAndUpdate(
      { userId: req.user.userId }, // Ensure authentication middleware adds `user` to the request
      { IsPaid: true, PaymentDetails: { paymentId, amount } }, // Example structure
      { new: true }
    );

    if (!updatedRider) {
      return res.status(404).json({ error: "Rider not found" });
    }

    res.status(200).json({ message: "Payment status updated successfully", rider: updatedRider });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});




// Fetch All Riders
router.get("/getRiders", async (req, res) => {
  try {
    const riders = await Rider.find();
    res.status(200).json(riders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch Single Rider by ID
router.get("/getRider/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const rider = await Rider.findById(id);
    if (!rider) {
      return res.status(404).json({ error: "Rider not found" });
    }
    res.status(200).json(rider);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update Rider by ID
router.put("/updateRider/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedRider = await Rider.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!updatedRider) {
      return res.status(404).json({ error: "Rider not found" });
    }
    res
      .status(200)
      .json({ message: "Rider updated successfully", updatedRider });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete Rider by ID
router.delete("/deleteRider/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedRider = await Rider.findByIdAndDelete(id);
    if (!deletedRider) {
      return res.status(404).json({ error: "Rider not found" });
    }
    res.status(200).json({ message: "Rider deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
