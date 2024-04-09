
const express = require('express')
const router = express.Router();
const {requireAuth } = require('../../utils/auth');
const {Spot, Review, User, ReviewImage, spotImage, Booking, Sequelize} = require('../../db/models');

//*Get all Spots
router.get('/', async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1;
        let size = parseInt(req.query.size) || 20;
        const minLat = req.query.minLat !== undefined ? parseFloat(req.query.minLat) : undefined;
        const maxLat = req.query.maxLat !== undefined ? parseFloat(req.query.maxLat) : undefined;
        const minLng = req.query.minLng !== undefined ? parseFloat(req.query.minLng) : undefined;
        const maxLng = req.query.maxLng !== undefined ? parseFloat(req.query.maxLng) : undefined;
        const minPrice = req.query.minPrice !== undefined ? parseFloat(req.query.minPrice) : undefined;
        const maxPrice = req.query.maxPrice !== undefined ? parseFloat(req.query.maxPrice) : undefined;

        let errors = {};
        if (page < 1) errors.page = "Page must be greater than or equal to 1";
        if (size < 1 || size > 20) errors.size = "Size must be between 1 and 20";
        if (minLat !== undefined && (isNaN(minLat) || minLat < -90 || minLat > 90)) errors.minLat = "Minimum latitude is invalid";
        if (maxLat !== undefined && (isNaN(maxLat) || maxLat < -90 || maxLat > 90)) errors.maxLat = "Maximum latitude is invalid";
        if (minLng !== undefined && (isNaN(minLng) || minLng < -180 || minLng > 180)) errors.minLng = "Minimum longitude is invalid";
        if (maxLng !== undefined && (isNaN(maxLng) || maxLng < -180 || maxLng > 180)) errors.maxLng = "Maximum longitude is invalid";
        if (minPrice !== undefined && (isNaN(minPrice) || minPrice < 0)) errors.minPrice = "Minimum price must be greater than or equal to 0";
        if (maxPrice !== undefined && (isNaN(maxPrice) || maxPrice < 0)) errors.maxPrice = "Maximum price must be greater than or equal to 0";

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ message: "Bad Request", errors });
        }

        let where = {};
        if (minLat !== undefined) where.lat = { [Sequelize.Op.gte]: minLat };
        if (maxLat !== undefined) where.lat = { ...where.lat, [Sequelize.Op.lte]: maxLat };
        if (minLng !== undefined) where.lng = { [Sequelize.Op.gte]: minLng };
        if (maxLng !== undefined) where.lng = { ...where.lng, [Sequelize.Op.lte]: maxLng };
        if (minPrice !== undefined) where.price = { [Sequelize.Op.gte]: minPrice };
        if (maxPrice !== undefined) where.price = { ...where.price, [Sequelize.Op.lte]: maxPrice };

        let offset = (page - 1) * size;
        let limit = size;

        const spots = await Spot.findAll({
            where,
            include: [
                {model: spotImage,attributes: ['url'],where: { preview: true },limit: 1},
                {model: Review,attributes: [],}
            ],
            attributes: {
                include: [[Sequelize.fn('AVG', Sequelize.col('Review.stars')), 'avgRating']]
            },
            group: ['Spot.id'],limit,offset,subQuery: false,order: [['id']]
        });

        const spotsResponse = spots.map(spot => {
            const spotJSON = spot.toJSON();
            spotJSON.avgRating = parseFloat(spotJSON.avgRating).toFixed(1);
            if (spotJSON.spotImage && spotJSON.spotImage.length) {
                spotJSON.preview = spotJSON.spotImage[0].url;
            }
            delete spotJSON.spotImage;
            return spotJSON;
        });

        res.status(200).json({
            Spots: spotsResponse,
            page: page,
            size: size
        });
    } catch(err){
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

//Create a spot
router.post('/', requireAuth, async(req,res) => {
const {ownerId} = req.user.id;
const owner_id = ownerId
    const { address, city, state, country, lat, lng, name, description, price } = req.body; 
    try{
    const spot = await Spot.create({
        owner_id,
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
    res.status(201).json({spot})
    } catch (err) {
        if (err.name === 'SequelizeValidationError') {
            const errors = {};
            err.errors.forEach((error) => {
                errors[error.path] = error.message;
            });
            return res.status(400).json({ message: "Validation error", errors });
        } else {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }
    }
});
//Add an Image to a Spot based on the Spot's id
router.post('/:spotId/images', requireAuth,async (req, res, next) => {
        const {url, preview} = req.body
        const {spotId} = req.params
        const userId = req.user.id
    try{
        const spot = await Spot.findByPk(spotId);
        if(!spot) {
            return res.status(404).json({message: 'Spot could not be found'});
        }
        if (spot.owner_id !== userId){
            return res.status(403).json({message: 'Forbidden'});
        }
        const image = await spotImage.create({spotId, url, preview});

        res.status(200).json({
            id: image.id,
            url: image.url,
            preview: image.preview
        });
    } catch(err){
        console.error(err);
        res.status(500).json({ error: err.message });
    }
    
});
//Get all spots owned by the current user
router.get('/current', requireAuth, async (req,res) => {
        try{
            const currId = req.user.id;
            const ownedSpots = await Spot.findAll({
                where: { owner_id: currId },
                include: [
                    {
                        model: spotImage,
                        as: 'spotImages',
                        attributes: ['url'],
                        where: { preview: true },
                        limit: 1
                    },
                    {
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
                    spotJSON.preview = spotJSON.spotImages[0].url;
                }
                delete spotJSON.spotImages;
                return spotJSON;
            });
            res.status(200).json({ Spots: ownedSpotsResponse });
        }catch(err){
            console.error(err);
            res.status(500).json({ error: err.message });
        }
});

router.get("/:spotId", async (req, res, next) => {
    try{
    const spotId = parseInt(req.params.spotId, 10)
        if (isNaN(spotId)) {
            return res.status(400).json({ error: "\"spotId\" must be a valid integer" })
        }

        const spot = await Spot.findByPk(spotId, {
            include: [
                {
                    model: spotImage,
                    as: 'spotImages',
                    attributes: ['id', 'url', 'preview']
                },
                {
                    model: Review,
                    attributes: []
                },
                {
                    model: User,
                    as: 'Owner',
                    attributes: ['id', 'firstName', 'lastName']
                }
            ],
            attributes: {
                include: [
                    [Sequelize.fn('COUNT', Sequelize.col('Review.id')), 'numReviews'],
                    [Sequelize.fn('AVG', Sequelize.col('Review.stars')), 'avgStarRating']
                ]
            },
            group: ['Spot.id', 'spotImages.id', 'Owner.id']
        });

        if (spot) {
            spot.avgStarRating = parseFloat(spot.avgStarRating).toFixed(1);
            res.status(200).json(spot);
        } else {
            res.status(404).json({ message: "Spot couldn't be found" });
        }
}catch(err){
        console.error(err);
        res.status(500).json({ error: err.message });
}
})
//Edit a spot
router.put('/:spotId', requireAuth, validateSpot, async(req,res,next)=> {
    const { spotId } = req.params;
const {ownerId} = req.user.id;
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

    } catch(err) {
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
router.delete('/:spotId', requireAuth, async(req,res) => {
const {ownerId} = req.user.id;
const owner_id = ownerId
    const {spotId} = req.params;
    const userId = req.user.id;
    try{
        const spot = await Spot.findByPk(spotId);
        if(!spot){
            return res.status(404).json({ message: "Spot couldn't be found" });
        }
        if(spot.owner_id !== owner_id){
            return res.status(403).json({ message: "Forbidden. You don't have permission to delete this spot." });
        }
        await spot.destroy();
        res.status(200).json({message: 'Successfully deleted'})
    } catch(err){
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
//Get all bookings based on a spots Id ******
router.get('/:spotId/booking', requireAuth, async (req, res) => {
    const {spotId} = req.params;
    const userId = req.user.id;
    try{
        const spot = await Spot.findByPk(spotId,{attributes: ['id','owner_id']});
        if (!spot) {
            return res.status(404).json({ message: 'Spot could not be found' })
        }
        const isOwner = spot.owner_id === userId;

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
    }catch(err){
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

module.exports = router;