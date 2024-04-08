const express = require('express');
const { restoreUser, requireAuth } = require('../../utils/auth.js');
const { Spot, Review, spotImage, User, ReviewImage, Booking } = require('../../db/models');
const { Op, Sequelize } = require('sequelize');
const { check } = require('express-validator')
const { handleValidationErrors } = require('../../utils/validation.js')

const router = express.Router()

const validateSpot = [
    check('address')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage('Street address is required'),
    check('city')
        .exists({ checkFalsy: true })
        .withMessage('City is required'),
    check('state')
        .exists({ checkFalsy: true })
        .withMessage('State is required'),
    check('country')
        .exists({ checkFalsy: true })
        .withMessage('Country is required'),
    check('lat')
        .exists({ checkFalsy: true })
        .isFloat({ gte: -90, lte: 90 })
        .withMessage('Latitude is not valid'),
    check('lng')
        .exists({ checkFalsy: true })
        .isFloat({ gte: -180, lte: 180 })
        .withMessage('Longitude is not valid'),
    check('name')
        .exists({ checkFalsy: true })
        .isLength({ min: 1, max: 50 })
        .withMessage('Name must be less than 50 characters'),
    check('description')
        .exists({ checkFalsy: true })
        .withMessage('Description is required'),
    check('price')
        .exists({ checkFalsy: true })
        .isFloat({ min: 0 })
        .withMessage('Price per day is required'),
    handleValidationErrors
];
router.delete("/:imageId", requireAuth, async (req, res, next) => {
    let image = await spotImage.findByPk(req.params.imageId)
    if (!image) return res.status(400).json({
        "message": "Spot Image couldn't be found"
    })

    let spot = await Spot.findByPk(image.spotId)
    if (spot.ownerId != req.user.id) return res.status(400).json({
        message: "Booking couldn't be found"
    })

    await spotImage.destroy({ where: { id: req.params.imageId } })

    res.json({
        "message": "Successfully deleted"
    })
})

module.exports = router;