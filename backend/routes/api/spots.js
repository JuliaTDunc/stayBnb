
const express = require('express')
const router = express.Router();
const {Op, Sequelize, DATE} = require('sequelize')
const { restoreUser, requireAuth } = require('../../utils/auth');
const {Spot, Review, User, reviewImage, spotImage, Booking} = require('../../db/models');
const {handleValidationErrors} = require('../../utils/validation');
const {check} = require('express-validator');
ownerId
//Get all the spots
/*router.get('/', async(req,res)=>{
    const {page = 1, size = 20, minLat, maxLat, minLng, maxLng, minPrice, maxPrice} = req.query.params;
    if(page < 1 || size < 1 || size > 20 || (minPrice && minPrice < 0) || (maxPrice && maxPrice < 0)){
        return res.status(400).json({
            message: 'Bad request',
            errors: {
                page: 'Page must be greater than or equal to 1',
                size: 'Size must be greater than or equal to 1',
                minPrice: 'Minimum price must be greater than or equal to 0',
                maxPrice: 'Maximum price must be greater than or equal to 0'
            }
        });
    }
    try{
    const filters = {};
    if(minLat && maxLat) filters.lat = {[Op.between]: [minLat, maxLat]};
    if(minLng && maxLng) filters.lng = {[Op.between]: [minLng, maxLng]};
    if(minPrice && maxPrice) filters.price = {[Op.between]: [minPrice, maxPrice]};
    const spots = await Spot.findAll({
        where: filters,
        include: [
            {model: User, attributes: ['id', 'firstName', 'lastName']},
            {model: Review}
        ],
        attributes: ['id', 'owner_id', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'description', 'price', 'createdAt', 'updatedAt'],
        offset: (page - 1) * size,
        limit: size
    });
    return res.json({Spots: spots, page: parseInt(page), size: parseInt(size)})
    } catch(error){
        console.error('Error fetching spots', error);
        return res.status(500).json({error: 'Internal Server Error'})
    }
});*/

const validateSpot = [
    check('address')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage('Street address is required'),
    check('city')
        .exists({ checkFalsy: true })
        .withMessage('City is required'),
    check('state')
        .exists({ checkFalsy: true })
        .withMessage('State is required'),
    check('country')
        .exists({ checkFalsy: true })
        .withMessage('Country is required'),
    check('lat')
        .exists({ checkFalsy: true })
        .isFloat({ gte: -90, lte: 90 })
        .withMessage('Latitude is not valid'),
    check('lng')
        .exists({ checkFalsy: true })
        .isFloat({ gte: -180, lte: 180 })
        .withMessage('Longitude is not valid'),
    check('name')
        .exists({ checkFalsy: true })
        .isLength({ min: 1, max: 50 })
        .withMessage('Name must be less than 50 characters'),
    check('description')
        .exists({ checkFalsy: true })
        .withMessage('Description is required'),
    check('price')
        .exists({ checkFalsy: true })
        .isFloat({ min: 0 })
        .withMessage('Price per day is required'),
    handleValidationErrors
];

const validateQuery = [
    check('page')
        .exists({ checkFalsy: true })
        .isInt({ min: 1, max: 10 })
        .withMessage('Page must be greater than or equal to 1'),
    check('size')
        .exists({ checkFalsy: true })
        .isInt({ min: 1, max: 20 })
        .withMessage('Size must be greater than or equal to 1'),
    check('maxLat')
        .exists({ checkFalsy: true })
        .isFloat({ gte: -90, lte: 90 })
        .withMessage('Maximum latitude is invalid'),
    check('minLat')
        .exists({ checkFalsy: true })
        .isFloat({ gte: -90, lte: 90 })
        .withMessage('Minimum latitude is invalid'),
    check('maxLng')
        .exists({ checkFalsy: true })
        .isFloat({ gte: -180, lte: 180 })
        .withMessage('Maximum longitude is invalid'),
    check('minLng')
        .exists({ checkFalsy: true })
        .isFloat({ gte: -180, lte: 180 })
        .withMessage('Minimum longitude is invalid'),
    check('minPrice')
        .exists({ checkFalsy: true })
        .isFloat({ min: 0 })
        .withMessage('Minimum price must be greater than or equal to 0'),
    check('maxPrice')
        .exists({ checkFalsy: true })
        .isFloat({ min: 0 })
        .withMessage('Maximum price must be greater than or equal to 0'),
    handleValidationErrors
];

const validateReview = [
    check('review')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage('Review text is required'),
    check('stars')
        .exists({ checkFalsy: true })
        .isInt({ gt: 0, lt: 5.1 })
        .withMessage('Stars must be an integer from 1 to 5'),
    handleValidationErrors
]

function getAvgAndImage(findAll) {
    let spots = findAll.map(spot => {
        let toJson = spot.toJSON()
        if (toJson.Reviews.length) {
            const numOfReviews = toJson.Reviews.length
            let totalReview = 0;
            for (let review of toJson.Reviews) {
                totalReview += review.stars
            }
            toJson.avgRating = totalReview / numOfReviews
        } else {
            toJson.avgRating = null;
        }
        delete toJson.Reviews

        if (toJson.spotImage[0]) {
            toJson.previewImage = toJson.spotImage[0].url;
        } else {
            toJson.previewImage = null;
        }
        delete toJson.spotImage
        return toJson
    })
    return spots
}

function getAvgReviewAndCount(spot) {
    let toJson = spot.toJSON()
    if (toJson.Reviews.length) {
        toJson.numReviews = toJson.Reviews.length
        let totalReview = 0;
        for (let review of toJson.Reviews) {
            totalReview += review.stars
        }
        toJson.avgRating = totalReview / toJson.numReviews
    } else {
        toJson.avgRating = null;
    }
    delete toJson.Reviews
    return toJson
}

//*Get all Spots
router.get("/", async (req, res, next) => {
    let { page, size, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } = req.query
    let limit;
    let offset;

    //check for validation errors
    if (page === 0) return res.status(400).json({
        message: "Bad Request",
        errors: { "page": "Page must be greater than or equal to 1" }
    });
    if (size < 1) return res.status(400).json({
        message: "Bad Request",
        errors: { "size": "Size must be greater than or equal to 1" }
    });
    if (minLat < -90 || minLat > 90) return res.status(400).json({
        message: "Bad Request",
        errors: { minLat: "Minimum latitude is invalid" }
    });
    if (maxLat > 90 || maxLat < -90) return res.status(400).json({
        message: "Bad Request",
        errors: { "maxLat": "Maximum latitude is invalid" }
    });
    if (minLng > 180 || minLng < -180) return res.status(400).json({
        message: "Bad Request",
        errors: { "minLng": "Maximum longitude is invalid" }
    });
    if (maxLng < -180 || maxLng > 180) return res.status(400).json({
        message: "Bad Request",
        errors: { "maxLng": "Minimum longitude is invalid" }
    });
    if (minPrice < 0) return res.status(400).json({
        message: "Bad Request",
        errors: { "minPrice": "Minimum price must be greater than or equal to 0" }
    });
    if (maxPrice < 0) return res.status(400).json({
        message: "Bad Request",
        errors: { "maxPrice": "Maximum price must be greater than or equal to 0" }
    });

    if (!page) page = 1;
    if (!size) size = 20;

    if (page >= 1 && size >= 1) {
        limit = size;
        offset = size * (page - 1);
    }

    const where = {};
    if (minLat) where.minLat = { [Op.gte]: minLat };
    if (maxLat) where.maxLat = { [Op.lte]: maxLat };
    if (minLng) where.lng = { [Op.gte]: minLng };
    if (maxLng) where.maxLng = { [Op.lte]: maxLng };
    if (minPrice) where.price = { [Op.gte]: minPrice }
    if (maxPrice) where.price = { [Op.lte]: maxPrice }

    let findAll = await Spot.findAll({
        where,
        include: [{
            model: Review,
            required: false,
            attributes: ['stars'],
        },
        {
            model: spotImage,
            required: false,
            where: {
                previewImage: true
            },
            attributes: ['url']
        }
        ],
        limit,
        offset,
        group: [['Spot.id']]
    })

    //find avg reviews and previewImage
    let spots = getAvgAndImage(findAll)



    return res.json({
        Spots: spots,
        page,
        size
    })
});

//Create a spot
router.post('/', requireAuth, validateSpot, async(req,res, next) => {
    const ownerId = req.user.id
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
    } catch (error) {
        error.status = 400;
        error.body = {
            message: 'Bad Request',
            errors: {
                address,city, state, country, lat, lng, name, description, price
            }
        }
        return next(err)
    }
});
//Add an Image to a Spot based on the Spot's id
router.post('/:spotId/images', requireAuth, restoreUser, async (req, res, next) => {
        const {url, preview} = req.body
        const previewImage = preview


        const spot = await Spot.findByPk(req.params.spotId);
        if(spot === null) {
            return res.status(404).json({message: 'Spot could not be found'});
        }
        if (spot.owner_id !== req.user.id){
            return res.status(403).json({message: 'Forbidden'});
        }
        const image = (await spotImage.create({url, previewImage})).toJSON();

        //may have to change (201)
        res.status(201).json({
            id: image.id,
            url: image.url,
            preview: image.previewImage
        });
    
});
//Get all spots owned by the current user
router.get('/session', requireAuth, async (req,res, next) => {
        const noAvg = await Spots.findAll({
        where:{
                owner_id: req.user.id
            },
            include: [{
                model: Review,
                required: false,
                attributes: ['stars']
            },{
                model: spotImage,
                required: false,
                where:{
                    preview: true
                },
                attributes: ['url']
            }],
            group: [['Spot.id', 'ASC'], ['Review.id'], ['spotImage.id']]
        });
        let spots = getAvgAndImage(noAvg)
        res.json({Spots: spots});
});

router.get("/:spotId", async (req, res, next) => {
    const { spotId } = req.params
    let getSpot = await Spot.findOne({
        where: {
            id: spotId
        },
        include: [
            {
                model: Review,
                required: false,
                attributes: ["stars"]
            },
            {
                model: spotImage,
                attributes: ['id', 'url', ['previewImage', 'preview']]
            },
            {
                model: User,
                as: "Owner",
                attributes: ['id', 'firstName', 'lastName']
            }
        ]
    })

    if (getSpot === null) return res.status(404).json({
        message: "Spot couldn't be found"
    });

    let spot = getAvgReviewAndCount(getSpot)

    return res.json(spot)
})
//Edit a spot
router.put('/:spotId', requireAuth, validateSpot, async(req,res,next)=> {
    const { spotId } = req.params;
    const ownerId = req.user.id;
    const { address, city, state, country, lat, lng, name, description, price } = req.body
    try {
        let spot = await Spot.findByPk(spotId)
        if (!spot.id) {
            const err = new Error(`Spot couldn't be found`);
            err.status = 404;
            err.body = {
                message: "Spot couldn't be found",
            }
            return next(err)
        }
        if (spot.owner_id !== ownerId) {
            const err = new Error(`Spot couldn't be found`);
            err.status = 400;
            err.body = {
                message: "Bad Request",
                errors: {
                    address, city, state, country, lat, lng, name, description, price
                }
            }
            return next(err)
        }

        await spot.update({
            address, city, state, country, lat, lng, name, description, price
        })

        res.json(spot)

    } catch(err) {
        return next(err)
    }
});
//Delete a spot
router.delete('/:spotId', requireAuth, async(req,res,next) => {
    const ownerId = req.user.id
    const {spotId} = req.params;
    try{
        const spot = await Spot.findByPk(spotId);
        if(!spot.id){
            const err = new Error(`Spot could not be found`);
            err.status = 404;
            err.body = {
                message: "Spot could not be found",
            }
            return next(err)
        }
        if(spot.owner_id !== ownerId){
            const err = new Error(`Spot could not be found`);
            err.status = 400;
            err.body = {
                message: "Spot could not be found",
            }
            return next(err)
        }
        await spot.destroy({
            where: {
                id: spotId
            }
        });
        res.json({message: 'Successfully deleted'})
    } catch(error){
       return next(err)
    }
});
//Get all bookings based on a spots Id ******
router.get('/:spotId/booking', requireAuth, async (req, res, next) => {
        const spot = await Spot.findByPk(req.params.spotId);
        if (!spot) {
            return res.status(404).json({ message: 'Spot could not be found' })
        }
        if (spot.owner_id === req.user.id) {
            const bookings = await Booking.findAll({
                where: { spotId: req.params.spotId },
                include: [{ model: User, required: false, attributes: ['id', 'firstName', 'lastName'] }]
            });
    
        } else {
            const bookings = await Booking.findAll({ where: { spotId: req.params.spotId }, include: {model: User, required: false, attributes: ['id','firstName','lastName']} });
            
        }
    return res.json({Bookings: bookings})
});
//Create a new booking based on a spot's id
router.post('/:spotId/booking', requireAuth, async (req, res, next) => {
    const { startDate, endDate } = req.body;
    startDate = new Date(startDate);
    endDate = new Date(endDate);
    
        const spot = await Spot.findByPk(req.params.spotId);
        if (!spot) {
            return res.status(404).json({ message: "Spot couldn't be found" })
        }
        if (spot.owner_id === userId) {
            return res.json(403).json({ message: "You cannot book your own spot" })
        }

    let currDate = new DATE(Sequelize.literal('CURRENT_TIMESTAMP'))
    if (startDate < currDate || endDate <= startDate) return res.status(400).json({
        "message": "Bad Request",
        "errors": {
            "startDate": "startDate cannot be in the past",
            "endDate": "endDate cannot be on or before startDate"
        }
    })

        const existingBooking = await Booking.findOne({
            where: {
                spotId: req.params.spotId,
                [Op.or]: [{ startDate: {[Op.between]: [startDate, endDate]}},
                {endDate: {[Op.between]: [startDate, endDate]}},
                {[Op.and]: {startDate: {[Op.lte]: startDate},endDate: {[Op.gte]: endDate}}
                }]
            }
        });
        if (existingBooking) {
            return res.status(403).json({
                message: "Sorry, this spot is already booked for the specified dates",
                errors: {
                    startDate: "Start date conflicts with an existing booking",
                    endDate: "End date conflicts with an existing booking"
                }
            });
        }
        const booking = await Booking.create({ spotId: req.params.spotId, userId: req.user.id, startDate, endDate });
        booking.toJSON()
        return res.json(booking)
    
});

module.exports = router;