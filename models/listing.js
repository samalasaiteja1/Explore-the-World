const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js"); // Ensure the path is correct for your project structure

// Define the Listing schema
const listingSchema = new Schema({
  title: {
    type: String,
    required: true, // Title is required
  },
  description: String, // Description is optional
  image: {
    url: String, // URL for the image
    filename: String, // Filename of the image
  },
  price: Number, // Price of the listing
  location: String, // Location of the listing
  country: String, // Country of the listing
  category: { 
    type: String, 
    required: true, // Category is required
    enum: ["Beach", "Mountain", "City", "Desert", "Forest", "Snow", "Historical"] // Limited options for category
  },
  reviews: [
    {
      type: Schema.Types.ObjectId, // Reference to the Review model
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId, // Reference to the User model (listing owner)
    ref: "User",
  },
  geometry: {
    type: {
      type: String,
      enum: ['Point'], // Type of geometry
      required: true,
    },
    coordinates: {
      type: [Number], // Coordinates for geolocation
      required: true,
    }
  }
});

// Middleware to delete associated reviews when a listing is deleted
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    // Delete all reviews associated with the listing
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

// Create the Listing model
const Listing = mongoose.model("Listing", listingSchema);

// Export the model
module.exports = Listing;
