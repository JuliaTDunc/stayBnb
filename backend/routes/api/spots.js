
const express = require('express')
const router = express.Router();
const {Spot, User, Review, SpotImage, sequelize, Sequelize} = require('../../db/models')
//Get all the spots
router.get('/', async(req,res)=>{
    const spots = await Spot.findAll({
        include: [
            {model: sequelize.models.User, attributes: ['id', 'firstName', 'lastName',]},
            {model: sequelize.models.Review, attributes: [[sequelize.fn('avg', sequelize.col('stars')), 'avgRating']], required: false}
        ],
        attributes: ['id', 'owner_id', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'description', 'price','createdAt', 'updatedAt', 'preview_image' ,]
    })

    return res.json({ Spots: spots });

});
//Create a spot
router.post('/', async(req,res) => {
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
router.post('/:spotId/images', async (req, res) => {
    try{
        const spotId = req.params.spotId;
        const userId = req.user.id;

        const spot = await Spot.findByPk(spotId);
        if(!spot) {
            return res.status(404).json({error: 'Spot not found'});
        }
        if (spot.ownerId !== userId){
            return res.status(403).json({error: 'Not authorized'});
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
router.get('/current', async (req,res) => {
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
router.get('/:spotId', async(req,res) => {
    try{
        const spotId = req.params.spotId;
        const spot = await Spot.findByPk(spotId,{
            include: [
                {
                    model: Review,
                    attributes: [
                        [Sequelize.fn('COUNT', Sequelize.col('*')), 'numReviews'],
                        [Sequelize.fn('AVG', Sequelize.col('stars')), 'avgStarRating']
                    ],
                    raw: true
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
            ],
            raw: true
        });
        if(!spot){
            return res.status(404).json({error: 'Spot not found'});
        }
        res.json(spot);
    } catch (error){
        console.error('Error fetching spot details:', error);
        res.status(500).json({error: 'Internal server error'})
    }
});
//Edit a spot
router.put('/:spotid', async(req,res)=> {
    try{
        const spotId = req.params.id;
        const userId = req.user.id;

        const spot = await Spot.findByPk(spotId);
        if(!spot){
            return res.status(404).json({error: 'Spot not found'})
        }
        if(spot.ownerId !== userId){
            return res.status(404).json({error:'Not authorized'})
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
router.delete('/:spotId', async(req,res) => {
    try{
        const spotId = req.params.spotId;
        const userId = req.user.id;

        const spot = await Spot.findByPk(spotId);
        if(!spot){
            return res.status(404).json({error: 'Spot not found'})
        }
        if(spot.ownerId !== userId){
            return res.status(403).json({error: 'Not authorized'})
        }
        await spot.destroy();
        res.json({message: 'Spot deleted'})
    } catch(error){
        console.error('Error deleting spot: ', error);
        res.status(500).json({error: 'Internal server error'})
    }
})
module.exports = router;