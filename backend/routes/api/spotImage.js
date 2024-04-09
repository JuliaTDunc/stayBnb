const express = require('express');
const {requireAuth } = require('../../utils/auth.js');
const { Spot, Review, spotImage, User, ReviewImage, Booking, Sequelize } = require('../../db/models');


const router = express.Router()

router.delete("/:imageId", requireAuth, async (req, res) => {
    try {
        const imageId = parseInt(req.params.imageId/*, 10*/);
        const userId = req.user.id;
        const spotImagedel = await spotImage.findByPk(imageId, {
            include: {
                model: Spot,
                attributes: ['owner_id']
            }
        });

        if (!spotImagedel) {
            return res.status(404).json({ message: "Spot Image couldn't be found" });
        }

        if (spotImagedel.Spot.owner_id !== userId) {
            return res.status(403).json({ message: "Forbidden" });
        }

        await spotImagedel.destroy();
        res.status(200).json({ message: "Successfully deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
})

module.exports = router;