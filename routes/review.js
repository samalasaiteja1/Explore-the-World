const express = require("express");
const router = express.Router({ mergeParams: true });
const { isLoggedIn, validateReview,isReviewAuthor} = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");
console.log(wrapAsync );
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const reviewController = require("../controllers/reviews.js");
const review=require("../models/review.js")
router.post("/", isLoggedIn, validateReview,
 wrapAsync(reviewController.createReview));

// Delete review route
router.delete("/:reviewId", isLoggedIn,
isReviewAuthor,
wrapAsync(reviewController.deleteReview));

module.exports = router;
