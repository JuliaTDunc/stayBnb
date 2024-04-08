const express = require('express');
const router = express.Router();
const {Review, User, Spot, ReviewImage} = require('../../db/models');
const { restoreUser, requireAuth } = require('../../utils/auth');


//Create new review based on spotId
router.post('/spots/:spotId', restoreUser, async (req,res) => {
  try{
    const {userId, review, stars} = req.body;
    const spotId = req.params.spotId;
    const spot = await Spot.findByPk(spotId);
    if(!spot){
      return res._construct(404).json({error: 'Spot not found'});
    }
    const existing = await Review.findOne({
      where: {
        userId,
        spotId
      }
    });
    if(existing){
      return res.status(403).json({error: 'Review already exists for this spot'})
    }

    const newReview = await Review.create({
      userId,
      spotId,
      review,
      stars
    });
    res.status(201).json(newReview)
  } catch (error){
    console.error('Error creating review', error);
    if(error.name === 'SequelizeValidationError'){
      return res.status(400).json({error: error.message});
    }
    res.status(500).json({error: 'Internal Server Error'})
  }
});
//Add an image to a review based on reviewId
router.post('/:reviewId/images', restoreUser, async (req,res) => {
  try{
    const {userId, url} = req.body;
    const reviewId = req.params.reviewId;
    const review = await Review.findByPk(reviewId);
    if(!review){
      return res.status(404).json({error: 'Review Not Found'})
    }
    if(userId !== review.userId){
      return res.status(403).json({error: 'Forbidden'})
    }
    const reviewImagesCount = await ReviewImage.count({
      where: {
        reviewId
      }
    });
    const maxImages = 3;
    if(reviewImagesCount >= maxImages){
      return res.status(403).json({error: 'Max number of images'})
    }
    const newImage = await ReviewImage.create({
      reviewId,
      url
    });
    res.status(201).json(newImage);
  } catch (error){
    console.error('Image could not be added', error);
    res.status(500).json({error: 'Internal Server Error'})
  }
});
//Get all reviews of the current user
router.get('/session', restoreUser, async (req,res) => {
  try{
    const userId = req.userId;
    const userReviews = await Review.findAll({
      where: {userId},
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Spot,
          attributes: ['id', 'owner_id', 'address', 'city', 'state', 'country', 'lat', 'lng'],
          include: [
            {
              model: User,
              as: 'Owner',
              attributes: ['id', 'firstName', 'lastName']
            },
            {
              model: ReviewImage,
              attributes: ['id', 'url']
            }
          ]
        },
        {
        model: ReviewImage,
        attributes: ['id', 'url']
        }
      ],
      attributes: ['id', 'userId', 'spotId', 'review', 'stars', 'createdAt', 'updatedAt']
    });
    res.json(userReviews)
  } catch(error){
    console.error('Error finding user reviews', error);
    res.status(500).json({error: 'Internal Server Error'})
  }
});
//Get all reviews by a spots id
router.get('/spots/:spotId', async(req,res)=> {
  try{
    const spotId = req.params.spotId;
    const spot = await Spot.findByPk(spotId);
    if(!spot){
      return res.status(404).json({error: 'Spot not found'})
    }
    const spotReviews = await Review.findAll({
      where: {spotId},
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName']
        },
        /*{
          model: ReviewImage,
        attributes: ['id', 'url']
        }*/
      ],
      attributes: ['id', 'userId', 'spotId', 'review', 'stars', 'createdAt', 'updatedAt']
    });
    res.json(spotReviews)
  } catch (error){
    console.error('Error finding reviews', error);
    return res.status(500).json({error: 'Internal Server Error'})
  }
});
//Edit a review
router.put('/:reviewId', restoreUser, async (req,res) => {
  try{
    const {userId, review, stars} = req.body;
    const reviewId = req.params.reviewId;

    const existing = await Review.findByPk(reviewId);
    if(!existing){
      return res.status(404).json({error: 'Review not found'})
    }
    if(userId !== existing.userId){
      return res.status(403).json({error: 'Forbidden'})
    }

    existing.review = review;
    existing.stars = stars;
    await existing.save();
    res.json(existing)
  } catch (error){
    console.error('Error edititng', error);
    if(error.name === 'SequelizeValidationError'){
      return res.status(400).json({error: error.message})
    }
    res.status(500).json({error: 'Internal Server Error'})
  }
});
//Delete a review
router.delete('/:reviewId', restoreUser, async(req,res) => {
  try{
    const userId = req.userId;
    const reviewId = req.params.reviewId;
    const existing = await Review.findByPk(reviewId);
    if(!existing){
      return res.status(404).json({error: 'Review not found'});
    }
    if(userId !== existing.userId){
      return res.status(403).json({error: 'Forbidden'})
    }
    await existing.destroy();
    res.json({message: 'Review Deleted'})
  }catch (errors){
    console.error('Error deleting review ', error);
    res.status(500).json({error: 'Internal Server Error'});
  }
});
//Delete a review image
router.delete('/:reviewId/images/:imageId', requireAuth, async(req,res)=>{
  const {reviewId, imageId} = req.query.params;
  const userId = req.user.id;
  try{
    const review = await Review.findByPk(reviewId);
    if(!review){
      return res.status(404).json({message: "Review couldn't be found"})
    }
    if(review.userId !== userId){
      return res.status(403).json({message: 'Not authorized'})
    }
    await image.destroy();
    res.status(200).json({message: 'Successfully deleted'})
  }catch(error){
    console.error('Error deleting review image ', error);
    res.status(500).json({error: 'Internal Server Error'})
  }
});
module.exports = router;