
const express = require('express')
const router = express.Router();
const {Op, Sequelize, DATE} = require('sequelize')
const { restoreUser, requireAuth } = require('../../utils/auth');
const {Spot, Review, User, reviewImage, spotImage, Booking} = require('../../db/models');
const {handleValidationErrors} = require('../../utils/validation');
const {check} = require('express-validator');

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

        if (toJson.spotImages[0]) {
            toJson.previewImage = toJson.spotImages[0].url;
        } else {
            toJson.previewImage = null;
        }
        delete toJson.spotImages
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
            model: spotImages,
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
router.post('/', requireAuth, async(req,res) => {
    try{
    const {address, city, state, country, lat, lng, name, description, price } = req.body; 

    if(!address || !city || !state || !country || !lat || !lng || !name || !description || !price ){
        return res.status(400).json({error: 'Missing required fields'});
    }
    const spot = await Spot.create({
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
        console.log('Error creating spot', error);
        res.status(500).json({error: 'Internal server error'})
    }
});
//Add an Image to a Spot based on the Spot's id
router.post('/:spotId/images', restoreUser, async (req, res) => {
    try{
        const spotId = req.params.spotId;
        const userId = req.user.id;

        const spot = await Spot.findByPk(spotId);
        if(!spot) {
            return res.status(404).json({error: 'Spot not found'});
        }
        if (spot.ownerId !== userId){
            return res.status(403).json({error: 'Forbidden'});
        }
        const {url, preview} = req.body;
        const image = await spotImage.create({url, preview, spotId});

        res.status(201).json({
            id: image.id,
            url: image.url,
            preview: image.preview
        });
    } catch (error){
        console.error('Error adding image to spot:', error);
        res.status(500).json({error: 'Internal server error'})
    }
});
//Get all spots owned by the current user
router.get('/session', restoreUser, async (req,res) => {
    try{
        const userId = req.user.id;
        const spots = await Spots.findAll({
        where:{
                ownerId: userId
            }
        });
        res.json(spots);
    } catch (error){
        console.error('Error fetching users spots:', error);
        res.status(500).json({error: 'Internal server error'})
    }
});
//Get details from a Spot from an id
/*router.get('/:spotId', async(req,res) => {
    
        const spotId = req.params.spotId;
        const spot = await Spot.findByPk(spotId,{
             include: [
                {
                     model: Review,
                     attributes: [
                      [Sequelize.fn('COUNT', Sequelize.col('*')), 'numReviews'],
                         [Sequelize.fn('AVG', Sequelize.col('stars')), 'avgStarRating']
                     ],
                },
                {
                    model: spotImage,
                    attributes: ['id', 'url', 'preview']
                },
                {
                    model: User,
                    as: 'Owner',
                    attributes: ['id', 'firstName', 'lastName']
                }
            ]
        }
    );

      /*  if(!spot){
            return res.status(404).json({error: 'Spot not found'});
        }
        res.json(spot);
    
    catch (error){
        console.error('Error fetching spot details:', error);
        res.status(500).json({error: 'Internal server error'})
    }
    return res.json(spot);
});
*/
router.get("/:spotId", async (req, res, next) => {
    const { spotId } = req.params
  
        const spots = await Spot.findByPk(spotId, {
            include: [
                { model: sequelize.models.User, attributes: ['id', 'firstName', 'lastName',] },
                { model: sequelize.models.Review, attributes: [[sequelize.fn('avg', sequelize.col('stars')), 'avgRating']], required: false }
            ],
            attributes: ['id', 'owner_id', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'description', 'price', 'createdAt', 'updatedAt'],
        })
    

    return res.json(
        spots
    )
})
//Edit a spot
router.put('/:spotId', restoreUser, async(req,res)=> {
    try{
        const spotId = req.params.spotId;
        const userId = req.user.id;

        const spot = await Spot.findByPk(spotId);
        if(!spot){
            return res.status(404).json({error: 'Spot not found'})
        }
        if(spot.ownerId !== userId){
            return res.status(404).json({error:'Forbidden'})
        }

        spot.address = req.body.address;
        spot.city = req.body.city;
        spot.state = req.body.state;
        spot.country = req.body.country;
        spot.lat = req.body.lat;
        spot.lng = req.body.lng;
        spot.name = req.body.name;
        spot.description = req.body.description;
        spot.price = req.body.price;
        await spot.save();

        return res.json({spot})
    } catch (error){
        console.error('Error editing spot: ', error);
        res.status(500).json({error: 'Internal server error'})
    }
});
//Delete a spot
router.delete('/:spotId', restoreUser, async(req,res) => {
    try{
        const spotId = req.params.spotId;
        const userId = req.user.id;

        const spot = await Spot.findByPk(spotId);
        if(!spot){
            return res.status(404).json({error: 'Spot not found'})
        }
        if(spot.ownerId !== userId){
            return res.status(403).json({error: 'Forbidden'})
        }
        await spot.destroy();
        res.json({message: 'Spot deleted'})
    } catch(error){
        console.error('Error deleting spot: ', error);
        res.status(500).json({error: 'Internal server error'})
    }
});
//Get all bookings based on a spots Id
router.get('/:spotId/booking', restoreUser, async (req, res) => {
    const { spotId } = req.params;
    const userId = req.user.id;
    try {
        const spot = await Spot.findByPk(spotId);
        if (!spot) {
            return res.status(404).json({ message: 'Could not find spot' })
        }
        if (spot.ownerId === userId) {
            const bookings = await Booking.findAll({
                where: { spotId },
                include: [{ model: User }]
            });
            res.status(200).json(bookings)
        } else {
            const bookings = await Booking.findAll({ where: { spotId } });
            res.status(200).json(bookings)
        }
    } catch (error) {
        console.error('Error finding spot', error);
        res.status(500).json({ error: 'Internal Server Error' })
    }
});
//Create a new booking based on a spot's id
router.post('/:spotId/booking', requireAuth, async (req, res) => {
    const { spotId } = req.query.params;
    const userId = req.user.id;
    const { startDate, endDate } = req.body;
    try {
        const spot = await Spot.findByOk(spotId);
        if (!spot) {
            return res.status(404).json({ message: "Spot couldn't be found" })
        }
        if (spot.ownerId === userId) {
            return res.json(403).json({ message: "You cannot book your own spot" })
        }
        const existingBooking = await Booking.findOne({
            where: {
                spotId,
                [Op.or]: [
                    { startDate: { [Op.lte]: endDate } },
                    { endDate: { [Op.gte]: startDate } }
                ]
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
        const booking = await Booking.create({ spotId, userId, startDate, endDate });
        res.status(200).json(booking);
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                message: 'Validation error',
                error: error.message
            });
        } else {
            console.error('Error creating booking', error);
            res.status(500).json({ error: 'Internal Server Error' })
        }
    }
});
//Delete a spots image
router.delete('/:spotId/images/:imageId', requireAuth, async(req,res)=>{
    const {spotId, imageId} = req.query.params;
    const userId = req.user.id;
    try{
        const spot = await Spot.findByPk(spotId);
        if(!spot){
            return res.status(404).json({message: "Spot couldn't be found"})
        }
        if(spot.ownerId !== userId){
            return res.status(403).json({message: 'Not authorized'})
        }
        const image = await spotImage.findByPk(imageId);
        if(!image){
            return res.status(404).json({message: "Spot Image couldn't be found"})
        }
        await image.destroy();
        res.status(200).json({message: 'Successfully deleted'})
    } catch(error){
        console.error('Error deleting image ', error);
        res.status(500).json({error: 'Internal Server Error'})
    }
});
module.exports = router;