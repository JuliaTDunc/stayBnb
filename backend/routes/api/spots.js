
const express = require('express')
const router = express.Router();
const { restoreUser, requireAuth } = require('../../utils/auth');
const {Spot, User, SpotImage, sequelize, Sequelize} = require('../../db/models');


//Get all the spots
router.get('/', async(req,res)=>{
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
        const image = await SpotImage.create({url, preview, spotId});

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
                    model: SpotImage,
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
        const image = await SpotImage.findByPk(imageId);
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