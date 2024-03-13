const Store = require('../models/storeModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');

// Common function to calculate and update rating and numReviews
async function updateRatingAndNumReviews(model, itemId) {
    try {
        const item = await model.findById(itemId);
        const totalReviews = item.reviews.length;
        const totalRating = item.reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
        item.rating = averageRating;
        item.numReviews = totalReviews;
        await item.save();
    } catch (error) {
        throw error;
    }
}

// Controller for adding a review to a product or store
async function addReview(req, res) {
    try {
        const { itemId, rating, comment } = req.body;
        const userId = await User.findById(req.params.id)
        if (!userId) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        // Check if the item is a product or store
        const isProduct = await Product.exists({ _id: itemId });
        const isStore = await Store.exists({ _id: itemId });
        if (isProduct || isStore) {
            const item = isProduct ? await Product.findById(itemId) : await Store.findById(itemId);
            item.reviews.push({ user: userId, rating, comment });
            await item.save();
            await updateRatingAndNumReviews(isProduct ? Product : Store, itemId);
            return res.status(201).json({ success: true, message: 'Review added successfully' });
        } else {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
    } catch (error) {
        console.error('Error adding review:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}


// Controller for deleting a review from a product or store
async function deleteReview(req, res) {
    try {
        const { itemId, reviewId } = req.body;
        // Check if the item is a product or store
        const isProduct = await Product.exists({ _id: itemId });
        const isStore = await Store.exists({ _id: itemId });
        if (isProduct || isStore) {
            const item = isProduct ? await Product.findById(itemId) : await Store.findById(itemId);
            const reviewIndex = item.reviews.findIndex(review => review._id == reviewId);
            if (reviewIndex !== -1) {
                item.reviews.splice(reviewIndex, 1);
                await item.save();
                await updateRatingAndNumReviews(isProduct ? Product : Store, itemId);
                return res.status(200).json({ success: true, message: 'Review deleted successfully' });
            } else {
                return res.status(404).json({ success: false, message: 'Review not found' });
            }
        } else {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
    } catch (error) {
        console.error('Error deleting review:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

// Controller for updating a review of a product or store
async function updateReview(req, res) {
    try {
        const { itemId, reviewId, rating, comment } = req.body;

        // Check if the item is a product or store
        const isProduct = await Product.exists({ _id: itemId });
        const isStore = await Store.exists({ _id: itemId });

        if (isProduct) {
            const product = await Product.findById(itemId);
            const review = product.reviews.id(reviewId);

            if (review) {
                review.rating = rating;
                review.comment = comment;

                await product.save();
                await updateRatingAndNumReviews(Product, itemId);

                return res.status(200).json({ success: true, message: 'Review updated successfully' });
            } else {
                return res.status(404).json({ success: false, message: 'Review not found' });
            }
        } else if (isStore) {
            const store = await Store.findById(itemId);
            const review = store.reviews.id(reviewId);

            if (review) {
                review.rating = rating;
                review.comment = comment;

                await store.save();
                await updateRatingAndNumReviews(Store, itemId);

                return res.status(200).json({ success: true, message: 'Review updated successfully' });
            } else {
                return res.status(404).json({ success: false, message: 'Review not found' });
            }
        } else {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
    } catch (error) {
        console.error('Error updating review:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

module.exports = { deleteReview, addReview ,updateReview };
