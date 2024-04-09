const express = require('express');
const {requireAuth } = require('../../utils/auth.js');
const { Spot, Review, spotImage, User, ReviewImage, Booking } = require('../../db/models');
const router = express.Router()

router.delete("/:imageId", requireAuth, async (req, res, next) => {
    try {
        const imageId = parseInt(req.params.imageId/*, 10*/);
        const userId = req.user.id;

        const reviewImage = await ReviewImage.findByPk(imageId, {
            include: Review
        });

        if (!reviewImage) {
            return res.status(404).json({ message: "Review Image couldn't be found" });
        }

        if (reviewImage.Review.userId !== userId) {
            return res.status(403).json({ message: "Forbidden" });
        }

        await reviewImage.destroy();
        res.status(200).json({ message: "Successfully deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
})

module.exports = router;