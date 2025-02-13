const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const {validateSpot, validateQuery, existingSpot, isSpotOwner, validateReview, validateBooking, validateDates} = require('../../utils/validation');
const { requireAuth } = require('../../utils/auth');
const { Spot, Review, User, ReviewImage, SpotImage, Booking, Sequelize } = require('../../db/models');
const { validator } = require('sequelize/lib/utils/validator-extras');
const {validationResult, check} = require('express-validator');
const {spotData, spotsArray} = require('../../utils/spotData')


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
        where.price = {[Op.lte]: maxPrice};
    }

    return where;
}
    router.get("/", validateQuery, async (req, res) => {
 
        let {
            page,
            size,
            minLat,
            maxLat,
            minLng,     
            maxLng,
            minPrice,
            maxPrice,
        } = req.query;
        page = Number(page);
        size = Number(size);
        if (!page || page <= 0) page = 1;
        if (!size || size <= 0) size = 20;

        const where = setQueries(minLat, maxLat, minLng, maxLng, minPrice, maxPrice);
        const spotData = await Spot.findAll({
            where,
            limit: size,
            offset: size * (page - 1),
            include: [{ model: Review }, { model: SpotImage }],
        });
        const formattedSpots = spotsArray(spotData);

        return res.json({ Spots: formattedSpots, page, size });
    });
//Create a spot
router.post("/", requireAuth, validateSpot, async (req, res) => {
    const {
        user,
        body: { address, city, state, country, lat, lng, name, description, price },
    } = req;

    const newSpot = await Spot.create({
        ownerId: user.id,
        address,
        city,
        state,
        country,
        lat,
        lng,
        name,
        description,
        price,
    });

    return res.status(201).json(newSpot);
});

//Add an Image to a Spot based on the Spot's id
router.post('/:spotId/images', requireAuth, existingSpot, isSpotOwner, async (req, res) => {
    req.body.previewImage = req.body.preview
    const data = {...req.body,spotId: req.params.spotId}
    delete data.preview
    const image = await SpotImage.create(data)
    delete image.createdAt
    delete image.updatedAt
    
    return res.json({id:image.id,url:image.url,preview:image.previewImage})
});
//Get all spots owned by the current user
router.get('/current', requireAuth, async (req, res) => {
    try {
        const currId = req.user.id;
        const ownedSpots = await Spot.findAll({
            where: { ownerId: currId },
            include: [{model: Review}, {model: SpotImage}],
        });
        const formattedSpots = spotsArray(ownedSpots)
        res.status(200).json({ Spots: formattedSpots });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
//Get spot by id
router.get("/:spotId", existingSpot, async (req, res) => {
    
    const { spotId } = req.params;

    const currSpot = await Spot.findOne({
        where: {
            id: spotId,
        },
        include: [
            { model: Review },
            {
                model: SpotImage,
                attributes: ["id", "url", "previewImage"],
            },
            {
                model: User,
                as: "Owner",
                attributes: ["id", "firstName", "lastName"],
            },
            
        ],
    });

    const formattedSpot = spotData(currSpot);
    //res obj for desired response format
    const resSpot = {
        id:formattedSpot.id,
        ownerId: formattedSpot.ownerId,
        address: formattedSpot.address,
        city: formattedSpot.city,
        state: formattedSpot.state,
        country: formattedSpot.country,
        lat: formattedSpot.lat,
        lng: formattedSpot.lng,
        name: formattedSpot.name,
        description: formattedSpot.description,
        price: formattedSpot.price,
        createdAt: formattedSpot.createdAt,
        updatedAt: formattedSpot.updatedAt,
        numReviews: formattedSpot.numReviews,
        avgStarRating: formattedSpot.avgRating,
        SpotImages: formattedSpot.SpotImages,
        Owner: formattedSpot.Owner
    }

    return res.json(resSpot);
});
//Edit a spot
router.put('/:spotId', requireAuth, validateSpot, existingSpot, isSpotOwner, async (req, res, next) => {
    const { address, city, state, country, lat, lng, name, description, price } = req.body;
    const {currSpot} = req;
        await currSpot.update({
            address, city, state, country, lat, lng, name, description, price
        })
        //res obj for desired response format
        const resSpot = {
            id:currSpot.id,
            ownerId: currSpot.ownerId,
            address: currSpot.address,
            city: currSpot.city,
            state: currSpot.state,
            country: currSpot.country,
            lat: currSpot.lat,
            lng: currSpot.lng,
            name: currSpot.name,
            description: currSpot.description,
            price: currSpot.price,
            createdAt: currSpot.createdAt,
            updatedAt: currSpot.updatedAt
        }
        res.status(200).json(resSpot);
});
//Delete a spot
router.delete('/:spotId', requireAuth, existingSpot, isSpotOwner, async (req, res) => {
   const {currSpot} = req;

        await currSpot.destroy();
        res.status(200).json({ message: 'Successfully deleted' })
});
//Get all bookings based on a spots Id
router.get('/:spotId/bookings', requireAuth, existingSpot,async (req, res) => {
    const {user,params:{spotId}} = req;
        const spot = await Spot.findByPk(spotId, { attributes: ['id', 'ownerId'] });
        if(spot.ownerId !== user.id){
            
            const bookings = await Booking.findAll({
            where: { spotId },attributes:['spotId','startDate','endDate']
            });
            return res.json({Bookings: bookings});
        
        }else{
            const bookings = await Booking.findAll({
                where:{spotId},
                include:[
                    {model:User,
                         attributes:['id','firstName','lastName']
                    }
            ]
        });
        const testArr = [];
        for(let booking of bookings){
            booking = {
                User: booking.User,
                id: booking.id,
                spotId: booking.spotId,
                userId: booking.userId,
                startDate: booking.startDate,
                endDate: booking.endDate,
                createdAt: booking.createdAt,
                updatedAt: booking.updatedAt
            }
            testArr.push(booking)
        }
            return res.json({Bookings:testArr})
        }
});

//Create a new booking based on a spot's id
router.post('/:spotId/bookings', requireAuth, existingSpot, validateBooking, validateDates, async (req, res) => {
        let {user, currSpot, params:{spotId},body:{startDate,endDate}} = req;
        spotId = Number(spotId)
        //check if we need this
        if(user.id === currSpot.ownerId){
            return res.status(403).json({message:'Forbidden'})
        }
        const newBooking = await Booking.create({
            spotId,
            userId: user.id,
            startDate,
            endDate
        });
        //res obj for desired response format
        const resBook = {
            id:newBooking.id,
            spotId: newBooking.spotId,
            userId: newBooking.userId,
            startDate: newBooking.startDate,
            endDate: newBooking.endDate,
            createdAt: newBooking.createdAt,
            updatedAt: newBooking.updatedAt
        }
        return res.json(resBook)
});
//Get all reviews by spotId
router.get('/:spotId/reviews', existingSpot, async (req, res) => {
    const { spotId } = req.params;


        const spotReviews = await Review.findAll({
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

        res.status(200).json({ Reviews: spotReviews });
});
//Create a review for a spot
router.post('/:spotId/reviews', requireAuth, validateReview, existingSpot, async (req, res) => {
    let {user,params:{spotId},body:{review,stars}} = req;
    spotId = Number(spotId)


        const existingRev = await Review.findOne({
            where: { spotId, userId: user.id }
        });
        if (existingRev) {
            return res.status(500).json({ message: "User already has a review for this spot" });
        }else {
        const newRev = await Review.create({
            userId: user.id,
            spotId,
            review,
            stars
        });
            res.status(201).json(newRev);
    }
});

module.exports = router;