const express = require('express')
const router = express.Router();
const { Spot, User, Booking } = require('../../db/models');
const {restoreUser, requireAuth} = require('../../utils/auth');

//Get all of the current users bookings
router.get('/session', restoreUser, async (req,res) => {
    const userId = req.user.id;
    try{
        const bookings = await Booking.findAll({
            where: {userId},
            include: [{model: Spot}]
        })
        res.status(200).json(bookings);
    }catch(error){
        console.error('Error finding bookings', error)
        res.status(500).json({error: 'Internal Server Error'})
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
            return res.status(403).json({message: "Not authorized"})
        }
        if(new Date(booking.endDate) < new Date()){
            return res.status(403).json({message: "Past bookings can't be modified"})
        }
        const existingBooking = await Booking.findOne({
            where: {
                id: {[Op.not]: bookingId},
                spotId: booking.spotId,
                [Op.or]: [
                    {startDate: {[Op.lte]: endDate}},
                    {endDate: {[Op.gte]: startDate}}
                ]
            }
        });
        if(existingBooking){
            return res.status(403).json({
                message: "Sorry this spot is already booked for the specified dates",
                errors: {
                    startDate: "Start date conflicts with an existing booking",
                    endDate: "End date conflicts with an existing booking"
                }
            });
        }
        booking.startDate = startDate;
        booking.endDate = endDate;
        await booking.save();

        res.status(200).json(booking)
    } catch(error){
        if(error.name === 'SequelizeValidationError'){
            return res.status(400).json({
                message: "Validation error",
                error: error.message
            })
        } else{
            console.error('Error updating booking', error);
            res.status(500).json({error: 'Internal Server Error'})
        }
    }
});
//delete a booking
router.delete('/:bookingId', requireAuth, async(req,res) => {
    const {bookingId} = req.query.params;
    const userId = req.user.id;
    try{
        const booking = await Booking.findByPk(bookingId);
        if(!booking){
            return res.status(404).json({message: "Booking couldn't be found"})
        }
        if(booking.userId !== userId){
            const spot = await Spot.findByPk(booking.spotId);
            if(!spot || spot.ownerId !== userId){
                return res.status(403).json({message: "Not authorized"})
            }
        }
        if(new Date(booking.startDate) < new Date()){
            return res.status(403).json({message: 'Bookings that have been started  cannot be deleted'})
        }
        await booking.destroy();
        res.status(200).json({message: 'Successfully deleted'});
    } catch(error){
        console.error('Error deleting booking ', error);
        res.status(500).json({error: 'Internal Server Error'})
    }
});
module.exports = router;
