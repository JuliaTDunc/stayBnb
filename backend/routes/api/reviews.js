const express = require('express');
const router = express.Router();
const {Review, User, Spot, ReviewImage, spotImage, Booking, Sequelize} = require('../../db/models');
const {requireAuth } = require('../../utils/auth');



//Add an image to a review based on reviewId
router.post('/:reviewId/images', requireAuth, async (req,res) => {
  const reviewId = req.params;
  const {url} = req.body;
  const userId = req.user.id;
  try{
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
    if (count >= 10) {
      return res.status(403).json({ message: "Maximum number of images for this resource was reached" });
    }

    const reviewImage = await ReviewImage.create({ reviewId, url });
    res.status(200).json(reviewImage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
//Get all reviews of the current user
router.get('/current', requireAuth, async (req,res) => {
  const userId = req.userId;
  try{
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
              model: spotImage,
              attributes: ['id', 'url'],
              where: { preview: true },
              required: false
            }
          ]
        },
        {
          model: ReviewImage,
          attributes: ['id', 'url']
        }
      ],
    });
    userReviews = userReviews.map(review => review.toJSON());

    userReviews.forEach(review => {
      if (review.Spot.SpotImages && review.Spot.SpotImages.length > 0) {
        review.Spot.previewImage = review.Spot.SpotImages[0].url;
      } else {
        review.Spot.previewImage = null;
      }

      delete review.Spot.SpotImages;
    });

    res.status(200).json({ Reviews: userReviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
//Edit a review
router.put('/:reviewId', requireAuth, async (req,res) => {
  const {reviewId} = req.params;
  const {review: newReviewText, stars: newStars} = req.body;
  const userId = req.user.id;
  try{

    const existing = await Review.findByPk(reviewId);
    if(!existing){
      return res.status(404).json({error: 'Review could not be found'})
    }
    if(userId !== existing.userId){
      return res.status(403).json({error: 'Forbidden'})
    }

    existing.review = newReviewText;
    existing.stars = newStars;
    await existing.save();
    res.status(200).json(existing)
  } catch (err){
    console.error(err);
    if (err.name === 'SequelizeValidationError') {
      const errors = err.errors.map(e => ({ [e.path]: e.message }));
      res.status(400).json({ message: "Validation error", errors });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});
//Delete a review
router.delete('/:reviewId', requireAuth, async(req,res) => {
  const reviewId = req.params;
  const userId = req.user.id;
  try{
    const existing = await Review.findByPk(reviewId);
    if(!existing){
      return res.status(404).json({error: 'Review could not be found'});
    }
    if(userId !== existing.userId){
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    await existing.destroy();

    res.status(200).json({ message: "Successfully deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;