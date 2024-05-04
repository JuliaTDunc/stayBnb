const express = require('express');
const router = express.Router();
const {Spot, SpotImage, Booking} = require('../../db/models');
const {validateBooking, validateDates, existingBooking, isBookingOwner} = require('../../utils/validation');
const {requireAuth} = require('../../utils/auth');
const currDate = new Date().toISOString().split("T")[0];

//Get current users bookings
router.get('/current', requireAuth, async(req,res) => {
    const allBooks = await Booking.findAll({
        where: { userId: req.user.id },
        include: [{ model: Spot, attributes: { exclude: ['createdAt', 'updatedAt', 'description'] },
         include: { model: SpotImage, where: { previewImage: true } } }]
    });
    const resArr = [];
    for (let book of allBooks) {
        let jsonBook = book.toJSON();
        if (Array.isArray(jsonBook.Spot.SpotImages) && jsonBook.Spot.SpotImages.length > 0) {
            let currImg = jsonBook.Spot.SpotImages[0];
            jsonBook.Spot.preview = currImg.url;
        } else {
            jsonBook.Spot.preview = null
        }
        delete jsonBook.Spot.SpotImages;
        const jsonBookTest = { id: jsonBook.id, spotId: jsonBook.spotId, Spot: jsonBook.Spot, userId: jsonBook.userId, startDate: jsonBook.startDate, endDate: jsonBook.endDate, createdAt: jsonBook.createdAt, updatedAt: jsonBook.updatedAt}
        
        resArr.push(jsonBookTest)
    }
    return res.json({ Bookings: resArr })
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
