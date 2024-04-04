const express = require('express')
const router = express.Router();
const { Spot, User, Booking } = require('../../db/models');
const {restoreUser} = require('../../utils/auth');

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
module.exports = router;
