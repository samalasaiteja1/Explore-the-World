const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    const { category } = req.query; // Get the category from the query string

    try {
        let query = {};
        
        // Check if a category filter is provided
        if (category) {
            // Ensure categories is an array in the Listing model
            query['categories'] = { $in: [category] }; // This will match if the category is in the categories array
        }

        // Fetch listings from the database
        const listings = await Listing.find(query);

        // Sort listings to show the selected category first if it's included
        const sortedListings = listings.sort((a, b) => {
            if (category && a.categories.includes(category) && !b.categories.includes(category)) {
                return -1; // a comes first
            }
            if (category && !a.categories.includes(category) && b.categories.includes(category)) {
                return 1; // b comes first
            }
            return 0; // leave order unchanged
        });

        // Render the listings with the sorted results
        res.render("listings/index.ejs", { allListings: sortedListings });
    } catch (error) {
        console.error(error);
        req.flash("error", "Something went wrong while fetching the listings!");
        res.redirect("/listings");
    }
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showlisting = async (req, res) => {
    const { id } = req.params;
    try {
        const listing = await Listing.findById(id)
            .populate({
                path: "reviews",
                populate: {
                    path: "author",
                },
            })
            .populate("owner"); // Populate the owner field

        if (!listing) {
            req.flash("error", "Listing you requested does not exist!");
            return res.redirect("/listings");
        }

        res.render("listings/show.ejs", { listing });
    } catch (error) {
        console.error(error);
        req.flash("error", "Something went wrong while fetching the listing details!");
        res.redirect("/listings");
    }
};

module.exports.createlisting = async (req, res) => {
    try {
        const response = await geocodingClient.forwardGeocode({
            query: req.body.listing.location,
            limit: 1,
        }).send();

        const url = req.file.path;
        const filename = req.file.filename;

        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = { url, filename };
        newListing.geometry = response.body.features[0].geometry;

        await newListing.save();
        req.flash("success", "New Listing created");
        res.redirect("/listings");
    } catch (error) {
        console.error("Error creating listing:", error);
        req.flash("error", "Could not create listing!"); // More specific error handling could be added here
        res.redirect("/listings/new");
    }
};

module.exports.editlisting = async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id).populate("reviews").populate("owner");

        if (!listing) {
            req.flash("error", "Listing you requested does not exist!");
            return res.redirect("/listings");
        }

        const originalImageUrl = listing.image.url.replace("/upload", "/upload/h_10,w_15");

        res.render("listings/edit.ejs", { listing, originalImageUrl });
    } catch (err) {
        console.error("Error:", err);
        req.flash("error", "Something went wrong while fetching the listing details!");
        res.redirect("/listings");
    }
};

module.exports.updatelisting = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedData = { ...req.body.listing };

        // Check if a new file was uploaded
        if (req.file) { 
            const url = req.file.path;
            const filename = req.file.filename;
            updatedData.image = { url, filename };
        }

        await Listing.findByIdAndUpdate(id, updatedData);
        req.flash("success", "Listing updated");
        res.redirect(`/listings/${id}`);
    } catch (error) {
        console.error("Error updating listing:", error);
        req.flash("error", "Could not update the listing!");
        res.redirect(`/listings/${id}/edit`);
    }
};

module.exports.deletelisting = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedListing = await Listing.findByIdAndDelete(id);
        if (!deletedListing) {
            req.flash("error", "Listing you requested does not exist!");
            return res.redirect("/listings");
        }
        req.flash("success", "Listing deleted");
        res.redirect("/listings");
    } catch (error) {
        console.error("Error deleting listing:", error);
        req.flash("error", "Could not delete the listing!");
        res.redirect("/listings");
    }
};
