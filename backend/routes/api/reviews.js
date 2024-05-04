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
        {model:Spot,attributes:{exclude:['createdAt','updatedAt','description']}, include: {model: SpotImage, where: {previewImage: true}}},
        {model:ReviewImage,attributes:{exclude:['previewImage','createdAt','updatedAt','reviewId']}}]
    });
      const resArr = [];
    for(let rev of allRevs){
        let jsonRev = rev.toJSON();
        if(Array.isArray(jsonRev.Spot.SpotImages) && jsonRev.Spot.SpotImages.length > 0){
        let currImg = jsonRev.Spot.SpotImages[0];
        jsonRev.Spot.preview = currImg.url;
        }else{
          jsonRev.Spot.preview = null
        }
      delete jsonRev.Spot.SpotImages;
        resArr.push(jsonRev)
    }
    return res.json({Reviews: resArr})
});
const revImgNum = async (req, res, next) => {
  //let count = req.currReview.ReviewImages.length
  //return res.json(count)
  if (req.currReview.ReviewImages.length >= 10) {
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
    delete currReview.dataValues.ReviewImages;
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