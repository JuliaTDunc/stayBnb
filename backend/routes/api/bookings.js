const express = require('express');
const router = express.Router();
const { Spot, User, Booking, spotImage, Review, ReviewImage, Sequelize } = require('../../db/models');
const {restoreUser, requireAuth} = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

//Get all of the current users bookings
router.get('/current', requireAuth, async (req,res) => {
    const userId = req.user.id;
        try{
        const bookings = await Booking.findAll({
            where: {userId: req.user.id},
            include: [{ model: Spot, attributes: ['id', 'owner_id', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'price'], include:[{model: spotImage, where: {preview: true}, attributes: ['url']}]}]
        })
    bookings = bookings.map(booking => {
        const bookingJSON = booking.toJSON();

        const previewImage = bookingJSON.Spot.SpotImages.length > 0 ? bookingJSON.Spot.SpotImages[0].url : null;

        bookingJSON.Spot.previewImage = previewImage;
        delete bookingJSON.Spot.SpotImages;

        return {
            id: bookingJSON.id,
            spotId: bookingJSON.spotId,
            Spot: {
                ...bookingJSON.Spot,
                previewImage: previewImage
            },
            userId: bookingJSON.userId,
            startDate: bookingJSON.startDate,
            endDate: bookingJSON.endDate,
            createdAt: bookingJSON.createdAt,
            updatedAt: bookingJSON.updatedAt
        };
    });

    res.status(200).json({ Bookings: bookings });
} catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
}   
});
//Edit a booking
router.put('/:bookingId', requireAuth, async(req,res) => {
    const {bookingId} = req.query.params;
    const userId = req.user.id;
    const {startDate, endDate} = req.body;
    try{
   
        const booking = await Booking.findByPk(bookingId);
        if(!booking){
            return res.status(404).json({message: "Booking couldn't be found"})
        }
        if(booking.userId !== userId){
            return res.status(403).json({message: "Forbidden"})
        }
    if (new Date(booking.endDate) < new Date()) {
        return res.status(403).json({ message: "Past bookings can't be modified" });
    }

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (startDateObj >= endDateObj) {
        return res.status(400).json({ errors: { endDate: "endDate cannot come before startDate" } });
    }

    const existingBookings = await Booking.findAll({
        where: {
            spotId: booking.spotId,
            id: { [Sequelize.Op.ne]: bookingId }
        }
    });

    for (const existingBooking of existingBookings) {
        const existingStartDate = new Date(existingBooking.startDate);
        const existingEndDate = new Date(existingBooking.endDate);

        if ((startDateObj < existingEndDate && endDateObj > existingStartDate) ||
            startDateObj.getTime() === existingEndDate.getTime() ||
            endDateObj.getTime() === existingStartDate.getTime()) {
            return res.status(403).json({
                message: "Sorry, this spot is already booked for the specified dates",
                errors: {
                    startDate: "Start date conflicts with an existing booking",
                    endDate: "End date conflicts with an existing booking"
                }
            });
        }
    }

    booking.startDate = startDate;
    booking.endDate = endDate;
    await booking.save();

    res.status(200).json(booking);
} catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
}
});
//delete a booking
router.delete('/:bookingId', requireAuth, async(req,res) => {
    try {
    const {bookingId} = req.query.params;
    const userId = req.user.id;
        const booking = await Booking.findByPk(bookingId);
        if(!booking){
            return res.status(404).json({message: "Booking couldn't be found"})
        }
        const spot = await Spot.findByPk(booking.spotId);
        if (booking.userId !== userId && (!spot || spot.owner_id !== userId)){
            const spot = await Spot.findByPk(booking.spotId);
            if(!spot || spot.owner_id !== userId){
                return res.status(403).json({message: "Not authorized"})
            }
        }
        if(new Date(booking.startDate) <= new Date()){
            return res.status(403).json({message: 'Bookings that have been started  cannot be deleted'})
        }
        await booking.destroy();
        res.status(200).json({message: 'Successfully deleted'});
    } catch(error){
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;
