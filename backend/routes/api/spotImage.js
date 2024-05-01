const express = require('express');
const router = express.Router();
const {Spot, spotImage} = require('../../db/models');
const {requireAuth} = require('../../utils/auth');

//Delete spot image
router.delete('/:imageId', requireAuth, async(req,res) =>{
    const {user,params:{spotImageId}} = req;
    const img = await spotImage.findOne({
        where:{id:spotImageId},
        include:{model:Spot}
    });
    if(!img){
        return res.status(404).json({message:"Spot couldn't be found"});
    }else if(img.Spot.ownerId !== req.user.id){
        return res.status(403).json({message:'Forbidden'})
    }else{
        await img.destroy();
        return res.json({message:'Successfully deleted'})
    }
});
module.exports = router;