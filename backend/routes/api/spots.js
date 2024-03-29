const express = require('express')
const router = express.Router();
const {Spot} = require('../../db/models')

router.get('/', async(req,res)=>{
    const spots = await Spot.findAll({
    })

    return res.json(spots)
});
router.post('/', async(req,res) => {
    const {owner_id, address, city, state, country, lat, lng, name, description, price,} = req.query;
    if (address && city && state && country && name && description && price){
    const newSpot = new Spot({
       Spot.address = address;

    })
}
    //session cookies

})

module.exports = router;