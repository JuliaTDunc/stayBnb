const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { Spot, User, Booking, spotImage, Review, ReviewImage, Sequelize } = require('../../db/models');
const {restoreUser, requireAuth} = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
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
    const errors = {};
        const booking = await Booking.findByPk(bookingId);
        if(!booking){
            return res.status(404).json({message: "Booking couldn't be found"})
        }
        if(booking.userId !== userId){
            return res.status(403).json({message: "Forbidden"})
        }
        if(new Date().toISOString().split('T')[0] > new Date(booking.endDate.toISOString().split('T')[0])){
            return res.status(403).json({message: "Past bookings can't be modified"})
        }
    const existingBooking = await Booking.findAll({
        where: {
            spotId: booking.spotId
        },
        attributes: ['id', 'startDate', 'endDate']
    })

    if (existingBooking.length > 0) {
        const conflictErrors = {};

        for (let i = 0; i < existingBooking.length; i++) {
            const existingStartDate = new Date(existingBooking[i].startDate).toISOString().split('T')[0];
            const existingEndDate = new Date(existingBooking[i].endDate).toISOString().split('T')[0];
            const reqStartDate = new Date(startDate).toISOString().split('T')[0];
            const reqEndDate = new Date(endDate).toISOString().split('T')[0];

            if (existingBooking[i].id !== Number(bookingId)) {

                if ((reqStartDate === existingStartDate || reqStartDate === existingEndDate) ||
                    (reqStartDate > existingStartDate && reqStartDate < existingEndDate) ||
                    (reqStartDate < existingStartDate && reqStartDate > existingEndDate)) {
                    conflictErrors.startDate = "Start date conflicts with an existing booking"
                }

                if ((reqEndDate === existingEndDate || reqEndDate === existingStartDate) ||
                    (reqEndDate > existingStartDate && reqEndDate < existingEndDate)) {
                    conflictErrors.endDate = "End date conflicts with an existing booking"
                }

                if ((reqStartDate < existingStartDate && reqEndDate > existingEndDate) ||
                    (reqStartDate > existingStartDate && reqEndDate < existingEndDate)) {
                    conflictErrors.startDate = "Start date conflicts with an existing booking"
                    conflictErrors.endDate = "End date conflicts with an existing booking"
                }
            }
            if (Object.keys(conflictErrors).length > 0) {
                const errorMsg = {
                    message: "Sorry, this spot is already booked for the specified dates",
                    errors: conflictErrors
                }
                return res.status(403).json(errorMsg);
            }
        }
    }

    await booking.update({
        startDate,
        endDate
    })
        .catch((error) => {
            for (let i = 0; i < error.errors.length; i++) {
                let key = error.errors[i].path
                errors[`${key}`] = error.errors[i].message
            }
        });

    if (Object.keys(errors).length > 0) {
        const errorMsg = {
            message: "Bad Request",
            errors: errors
        }

        return res.status(400).json(errorMsg);
    } else {
        let splitCreate = booking.createdAt.toISOString().split('T').join(' ');
        let createdAt = splitCreate.split('.')[0];
        let splitUpdate = booking.updatedAt.toISOString().split('T').join(' ');
        let updatedAt = splitUpdate.split('.')[0];

        return res.json({
            id: booking.id,
            spotId: Number(booking.spotId),
            userId: booking.userId,
            startDate: new Date(booking.startDate).toISOString().split('T')[0],
            endDate: new Date(booking.endDate).toISOString().split('T')[0],
            createdAt,
            updatedAt
        });
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
            if(!spot || spot.owner_id !== userId){
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
