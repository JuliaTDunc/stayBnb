const express = require('express');
const router = express.Router();
const {User,Spot,SpotImage,Review,ReviewImage} = require('../../db/models');
const {requireAuth} = require('../../utils/auth');
const {validateReview, existingReview, isReviewOwner} = require('../../utils/validation');

//Get current users reviews
router.get('/current', requireAuth, async (req,res) =>{
  
    const allRevs = await Review.findAll({
        where:{userId: req.user.id},
        include:[{model:User,attributes:['id','firstName','lastName']},
        {model:Spot,attributes:{exclude:['createdAt','updatedAt','description']}},
        {model:ReviewImage,attributes:{exclude:['createdAt','updatedAt','reviewId']}}]
    });
    const revws = await Review.findAll({where: {userId: req.user.id}})
    //unused-SpotImage-previewImage
    for(let rev of allRevs){
        let currSpot = rev.Spot.dataValues;
        let currImg = currSpot.SpotImage[0];
        currSpot.preview = currImg.url;
        delete currSpot.SpotImage;
    }
    return res.json({Reviews: revws, u:req.user.id})
});
const revImgNum = async (req, _res, next) => {
  if (req.reviewData.ReviewImage.length >= 10) {
    const err = new Error(
      "Maximum number of images for this resource was reached"
    );
    err.hideTitle = true;
    err.status = 403;
    return next(err);
  } else {
    return next();
  }
};
//Add image to revew by id
router.post('/:reviewId/images', requireAuth,existingReview,isReviewOwner,revImgNum, async(req,res) =>{
    const {params: {reviewId},body:{url}} = req;
    const newImg = await ReviewImage.create({reviewId,url});
    return res.json({id:newImg.id, url})
});
//Edit a review
router.put('/:reviewId', requireAuth, validateReview, existingReview, isReviewOwner, async(req,res) => {
    const {body: {review,stars},currReview} = req;
    delete currReview.dataValues.ReviewImage;
    await currReview.update({review,stars});
    return res.json(currReview);
});
//Delete a review
router.delete('/:reviewId', requireAuth, existingReview,isReviewOwner, async(req,res)=>{
    const {currReview} = req;
    await currReview.destroy();
    return res.json({message:'Successfully deleted'})
});

module.exports = router;