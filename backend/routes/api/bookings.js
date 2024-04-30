const express = require('express');
const router = express.Router();
const {Spot, spotImage, Booking} = require('../../db/models');
const {validateBooking, validateDates, existingBooking, isBookingOwner} = require('../../utils/validation');
const {requireAuth} = require('../../utils/auth');
const currDate = new Date().toISOString().split("T")[0];

//Get current users bookings
router.get('/current', requireAuth, async(req,res) => {
    const {user} = req;
    const allSpots = await Spot.findAll({include:[{model:spotImage,where:{previewImage:true}},{model:Booking, where:{userId:user.id}}]});
    const currBookings = [];
    for(let spot of allSpots){
        const bookings = spot.Bookings;
        if(spot.spotImages){
        spot.dataValues.preview = spot.spotImages[0].url
        }
        for(let booking of bookings){
            booking.dataValues.Spot = {
                id: spot.id,
                ownerId: spot.ownerId,
                address: spot.address,
                city: spot.city,
                state: spot.state,
                country: spot.country,
                lat: spot.lat,
                lng: spot.lng,
                name: spot.name,
                price: spot.price,
                previewImage: spot.dataValues.preview
            };
            currBookings.push({
                id:booking.id,
                spotId:booking.spotId,
                Spot: booking.dataValues.Spot,
                userId:booking.userId,
                startDate:booking.startDate,
                endDate:booking.endDate,
                createdAt:booking.createdAt,
                updatedAt:booking.updatedAt
            })
        }
    }
    return res.json({Bookings: currBookings})
});
//Edit a booking
router.put('/:bookingId', requireAuth, validateBooking, existingBooking, isBookingOwner, validateDates, async(req,res,next)=>{
    const {body:{startDate,endDate}, currBook} = req;
    if(currBook.endDate < currDate){
        const err = new Error("Past bookings can't be modified");
        err.status(403);
        return next(err);
    }else{
        await currBook.update({startDate,endDate});
        return res.json(currBook);
    }
});
//Delete booking
router.delete('/:bookingId', requireAuth, existingBooking, isBookingOwner, async(req, res) => {
    const {currBook} = req;
    if(currBook.startDate < currDate){
        const err = new Error("Bookings that have been started cannot be deleted.")
        err.status = 403;
        return next(err)
    } else {
        await currBook.destroy();
        return res.json({message: 'Successdully deleted.'})
    }
})

module.exports = router;
