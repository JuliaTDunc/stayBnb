const express = require('express')
const router = express.Router();
const {validateSpot} = require('../../utils/validation');
const { requireAuth } = require('../../utils/auth');
const { Spot, Review, User, ReviewImage, spotImage, Booking, Sequelize } = require('../../db/models');
const { validator } = require('sequelize/lib/utils/validator-extras');
const {validationResult, check} = require('express-validator');
const {spotsArray} = require('../../utils/spotData')

const setQueries = (minLat, maxLat, minLng, maxLng, minPrice, maxPrice) => {
    const where = {};

    if (minLat && maxLat) {
        where.lat = { [Op.gte]: minLat, [Op.lte]: maxLat };
    } else if (minLat) {
        where.lat = { [Op.gte]: minLat };
    } else if (maxLat) {
        where.lat = { [Op.lte]: maxLat };
    }

    if (minLng && maxLng) {
        where.lng = { [Op.gte]: minLng, [Op.lte]: maxLng };
    } else if (minLng) {
        where.lng = { [Op.gte]: minLng };
    } else if (maxLng) {
        where.lng = { [Op.lte]: maxLng };
    }

    if (minPrice && maxPrice) {
        where.price = { [Op.gte]: minPrice, [Op.lte]: maxPrice };
    } else if (minPrice) {
        where.price = { [Op.gte]: minPrice };
    } else if (maxPrice) {
        where.price = { [Op.lte]: maxPrice };
    }

    return where;
};

    router.get("/", validateQuery, async (req, res) => {
        let {
            page = 1,
            size = 20,
            minLat,
            maxLat,
            minLng,
            maxLng,
            minPrice,
            maxPrice,
        } = req.query;

        page = Number(page);
        size = Number(size);
        if (page === 0) page = 1;
        if (size === 0) size = 20;

        const where = setQueries(minLat, maxLat, minLng, maxLng, minPrice, maxPrice);

        const spotData = await Spot.findAll({
            where,
            limit: size,
            offset: size * (page - 1),
            include: [{ model: Review }, { model: spotImage }],
        });

        const formattedSpots = spotsArray(spotData);

        return res.json({ Spots: formattedSpots, page, size });
    });

/*
//Create a spot
router.post('/', requireAuth, validateSpot, async (req, res) => {
    const { ownerId } = req.user.id;
    const { address, city, state, country, lat, lng, name, description, price } = req.body;
    try {
        const spot = await Spot.create({
            ownerId,
            address,
            city,
            state,
            country,
            lat,
            lng,
            name,
            description,
            price
        });
        res.status(201).json({ spot })
    } catch (err) {
        if (err.name === 'SequelizeValidationError') {
            return res.status(400).json({ message: "Validation error"});
        } else {
            return res.status(400).json({message: 'Bad Request'})
        }
    }
});
//Add an Image to a Spot based on the Spot's id
router.post('/:spotId/images', requireAuth, async (req, res, next) => {
    /*const { url, previewImage } = req.body
    const { spotId } = req.params
    const userId = req.user.id
    try {
        const spot = await Spot.findByPk(spotId);
        if (!spot) {
            return res.status(404).json({ message: 'Spot could not be found' });
        }
        if (spot.owner_id !== userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const image = await spotImage.create({ spotId, url, previewImage });

        res.status(200).json({
            id: image.id,
            url: image.url,
            previewImage: image.previewImage
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }

});
//Get all spots owned by the current user
router.get('/current', requireAuth, async (req, res) => {
    try {
        const currId = req.user.id;
        const ownedSpots = await Spot.findAll({
            where: { ownerId: currId },
            include: [
                {
                    model: spotImage,
                    as: 'spotImages',
                    attributes: ['url'],
                    where: { previewImage: true },
                    limit: 1
                },
                {
                    //ADD REVIEW ATTRIBUTES
                    
                    model: Review,
                    attributes: []
                }
               
            ],
            attributes: {
                include: [
                    [Sequelize.fn('AVG', Sequelize.col('Reviews.stars')), 'avgRating']
                ]
            },
            group: ['Spot.id']
        });

        const ownedSpotsResponse = ownedSpots.map(spot => {
            const spotJSON = spot.toJSON();
            spotJSON.avgRating = parseFloat(spotJSON.avgRating).toFixed(1);

            if (spotJSON.spotImages && spotJSON.spotImages.length) {
                spotJSON.previewImage = spotJSON.spotImages[0].url;
            }
            delete spotJSON.spotImages;
            return spotJSON;
        });
        res.status(200).json({ Spots: ownedSpotsResponse });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


const spotExists = async (req, _res, next) => {
    // If the spot doesn't exist, return an error
    const spotData = await Spot.findOne({
        where: {
            id: req.params.spotId,
        },
        include: [{ model: spotImage }],
    });

    if (!spotData) {
        const err = new Error("Spot couldn't be found");
        err.hideTitle = true;
        err.status = 404;
        return next(err);
    } else {
        // If it does exist, attach the queried data to the request
        req.spotData = spotData;
        req.spotImage = spotData.spotImage
        return next();
    }
};
const formatOneSpot = (spotData) => {
    spotData.dataValues.numReviews = 0;
    let starSum = 0;

    for (const review of spotData.dataValues.Reviews) {
        const currReview = review.dataValues;
        spotData.dataValues.numReviews++;
        starSum += currReview.stars;
        const avg = starSum / spotData.dataValues.numReviews
        spotData.dataValues.avgRating = Number(avg.toFixed(1));
    }
    delete spotData.dataValues.Reviews;

    return spotData;
};
router.get("/:spotId", spotExists, async (req, res) => {
    
    const { spotId } = req.params;

    const spotData = await Spot.findOne({
        where: {
            id: spotId,
        },
        include: [
            {
                model: spotImage,
                attributes: ["id", "url", "previewImages"],
            },
            {
                model: User,
                as: "Owner",
                attributes: ["id", "firstName", "lastName"],
            },
            { model: Review },
        ],
    });

    const formattedSpot = formatOneSpot(spotData);

    return res.json(formattedSpot);
});
//Edit a spot
router.put('/:spotId', requireAuth, async (req, res, next) => {
    const { spotId } = req.params;
    const { ownerId } = req.user.id;
    const owner_id = ownerId;
    const { address, city, state, country, lat, lng, name, description, price } = req.body;
    const userId = req.user.id;
    try {
        let spot = await Spot.findByPk(spotId)
        if (!spot.id) {
            return res.status(404).json({ message: "Spot couldn't be found" });
        }
        if (spot.owner_id !== userId) {
            return res.status(403).json({ message: "Forbidden. You don't have permission to edit this spot." });
        }

        await spot.update({
            address, city, state, country, lat, lng, name, description, price
        })

        res.status(200).json(spot);

    } catch (err) {
        if (err.name === 'SequelizeValidationError') {
            const errors = err.errors.reduce((acc, error) => ({
                ...acc,
                [error.path]: error.message,
            }), {});
            return res.status(400).json({
                message: "Bad Request",
                errors,
            });
        } else {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    }
});
//Delete a spot
router.delete('/:spotId', requireAuth, async (req, res) => {
    const { ownerId } = req.user.id;
    const { spotId } = req.params;
    try {
        const spot = await Spot.findByPk(spotId);
        if (!spot) {
            return res.status(404).json({ message: "Spot couldn't be found" });
        }
        if (spot.ownerId !== ownerId) {
            return res.status(403).json({ message: "Forbidden. You don't have permission to delete this spot." });
        }
        await spot.destroy();
        res.status(200).json({ message: 'Successfully deleted' })
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
//Get all bookings based on a spots Id ******
router.get('/:spotId/booking', requireAuth, async (req, res) => {
    const { spotId } = req.params;
    const userId = req.user.id;
    try {
        const spot = await Spot.findByPk(spotId, { attributes: ['id', 'ownerId'] });
        if (!spot) {
            return res.status(404).json({ message: 'Spot could not be found' })
        }
        const isOwner = spot.ownerId === userId;

        const bookings = await Booking.findAll({
            where: { spotId },
            ...(isOwner ? {
                include: [{
                    model: User,
                    attributes: ['id', 'firstName', 'lastName']
                }],
                attributes: ['id', 'spotId', 'userId', 'startDate', 'endDate', 'createdAt', 'updatedAt']
            } : {
                attributes: ['spotId', 'startDate', 'endDate']
            })
        });

        const formattedBookings = bookings.map(booking => {
            if (!isOwner) {
                return {
                    spotId: booking.spotId,
                    startDate: booking.startDate,
                    endDate: booking.endDate
                };
            }
            return {
                User: {
                    id: booking.User.id,
                    firstName: booking.User.firstName,
                    lastName: booking.User.lastName
                },
                id: booking.id,
                spotId: booking.spotId,
                userId: booking.userId,
                startDate: booking.startDate,
                endDate: booking.endDate,
                createdAt: booking.createdAt,
                updatedAt: booking.updatedAt
            };
        });

        res.status(200).json({ Bookings: formattedBookings });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
//Create a new booking based on a spot's id
router.post('/:spotId/booking', requireAuth, async (req, res) => {
    const spotId = parseInt(req.params.spotId);
    const { startDate, endDate } = req.body;
    const userId = req.user.id;

    if (isNaN(spotId)) {
        return res.status(400).json({ message: "Spot ID must be a valid integer" });
    }

    try {
        const spot = await Spot.findByPk(spotId);
        if (!spot) {
            return res.status(404).json({ message: "Spot couldn't be found" });
        }

        if (spot.owner_id === userId) {
            return res.status(403).json({ message: "Cannot book your own spot" });
        }

        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);

        if (startDateObj >= endDateObj) {
            return res.status(400).json({ errors: { endDate: "endDate cannot be on or before startDate" } });
        }

        const existingBookings = await Booking.findAll({ where: { spotId } });

        for (const booking of existingBookings) {
            const existingStartDate = new Date(booking.startDate);
            const existingEndDate = new Date(booking.endDate);

            if ((startDateObj < existingEndDate && endDateObj > existingStartDate) ||
                startDateObj.getTime() === existingEndDate.getTime() ||
                endDateObj.getTime() === existingStartDate.getTime()) {
                return res.status(403).json({ message: "Sorry, this spot is already booked for the specified dates" });
            }
        }

        const newBooking = await Booking.create({ userId, spotId, startDate, endDate });
        res.status(200).json(newBooking);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }

});
router.get('/:spotId/reviews', async (req, res) => {
    const { spotId } = req.params;

    try {
        const spot = await Spot.findByPk(spotId);
        if (!spot) {
            return res.status(404).json({ message: "Spot couldn't be found" });
        }

        const reviews = await Review.findAll({
            where: { spotId },
            include: [
                {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName']
                },
                {
                    model: ReviewImage,
                    attributes: ['id', 'url']
                }
            ]
        });

        res.status(200).json({ Review: reviews });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/:spotId/reviews', requireAuth, async (req, res) => {
    const { spotId } = req.params;
    const { review, stars } = req.body;
    const userId = req.user.id;

    try {
        const spot = await Spot.findByPk(spotId);
        if (!spot) {
            return res.status(404).json({ message: "Spot couldn't be found" });
        }

        const existingReview = await Review.findOne({
            where: { userId, spotId }
        });
        if (existingReview) {
            return res.status(500).json({ message: "User already has a review for this spot" });
        }

        const newReview = await Review.create({
            userId,
            spotId,
            review,
            stars
        });

        res.status(201).json(newReview);
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(e => e.message);
            res.status(400).json({ message: "Bad Request", errors });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});
*/
module.exports = router;