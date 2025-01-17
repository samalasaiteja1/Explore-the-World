const express = require("express");  
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");

// Multer configuration
const upload = multer({ storage });

router.route("/")
  .get(wrapAsync(async (req, res) => {
      const { search, category } = req.query; // Get the search and category from the request
      let filter = {};

      // Search filter
      if (search) {
          filter.title = { $regex: search, $options: 'i' }; // Case-insensitive title search
      }

      // Category filter
      if (category) {
          filter.category = category; // Filter by category
      }

      // Fetch listings based on the filter
      const allListings = await Listing.find(filter);
      res.render('listings', { allListings, success: req.flash('success') }); // Render listings page
  }))
  .post(
      isLoggedIn,
      upload.single("listing[image]"),
      validateListing,
      wrapAsync(listingController.createlisting)
  );

router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id")
  .get(wrapAsync(listingController.showlisting))
  .put(
      isLoggedIn,
      isOwner,
      upload.single("listing[image]"),
      validateListing,
      wrapAsync(listingController.updatelisting)
  )
  .delete(isOwner, isLoggedIn, wrapAsync(listingController.deletelisting));

router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editlisting));

module.exports = router;
