const express = require('express');
const router = express.Router();
const {Review, ReviewImage} = require('../../db/models');
const {requireAuth} = require('../../utils/auth');

//Delete review image
router.delete('/:reviewImageId', requireAuth, async(req,res)=>{
    const{user,params:{reviewImageId}} = req;
    const img = await ReviewImage.findOne({
        where:{id:reviewImageId},
        include:{model:Review}
    });
    if(!img){
        return res.status(404).json({message: "Review Image couldn't be found."})
    } else if(img.Review.userId !== user.id){
        return res.status(403).json({message:'Forbidden'})
    }else{
        await img.destroy();
        return res.json({message:'Successfully deleted'})
    }
});
module.exports = router;