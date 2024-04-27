const { validationResult, check } = require('express-validator');
const {Spot, spotImage} = require('../db/models');
const handleValidationErrors = (req, _res, next) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        const errors = {};
        validationErrors
            .array()
            .forEach(error => errors[error.path] = error.msg);

        const err = Error("Bad request.");
        err.errors = errors;
        err.status = 400;
        err.title = "Bad request.";
        next(err);
    }
    next();
};

const validateLogin = [
    check("credential")
    .exists({checkFalsy: true})
    .notEmpty()
    .withMessage("Email or username is required"),
    handleValidationErrors
];
const validateSignup = [
    check("email")
    .exists({checkFalsy: true})
    .isEmail()
    .withMessage("Invalid email"),
    check("username")
    .exists({checkFalsy:true})
    .isLength({min:4})
    .withMessage("Username is required"),
    check("username").not().isEmail().withMessage("Username cannot be an email."),
    check("firstName")
    .exists({checkfalsy:true})
    .notEmpty()
    .withMessage("First name is required"),
    check("lastName")
    .exists({checkFalsy:true})
    .notEmpty()
    .withMessage("Last name is required"),
    check("password")
    .exists({checkFalsy:true})
    .isLength({min:6})
    .withMessage("Password must be 6 characters or more."),
    handleValidationErrors
];
const validateQuery = [
    check("page")
    .optional({nullable:true, checkfalsy: true})
    .isFloat({min:1,max:10})
    .withMessage("Page must be greater than or equal to 0"),
    check("size")
    .optional({nullable: true, checkFalsy: true})
    .isFloat({min:1, max:30})
    .withMessage("Size must be greater than or equal to 1"),
    check("maxLat")
    .optional({nullable:true, checkfalsy: true})
    .isFloat({max:90})
    .withMessage("Maximum latitude is invalide"),
    check("minLat")
    .optional({nullable:true, checkfalsy:true})
    .isFloat({min: -90})
    .withMessage("Minimum latitude is invalid"),
    check("maxLng")
        .optional({ nullable: true, checkfalsy: true })
        .isFloat({ max: 180 })
        .withMessage("Maximum longitude is invalide"),
    check("minLng")
        .optional({ nullable: true, checkfalsy: true })
        .isFloat({ min: -180 })
        .withMessage("Minimum longitude is invalid"),
    check("minPrice")
        .optional({ nullable: true, checkfalsy: true })
        .isFloat({ min: 0 })
        .withMessage("Minimum price must be greater than or equal to 0"),
    check("maxPrice")
        .optional({ nullable: true, checkfalsy: true })
        .isFloat({ min: 0 })
        .withMessage("Maximum price must be greater than or equal to 0")
]

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
        .withMessage('Price per day is required and must be greater than 0'),
    handleValidationErrors
];
const currDate = new Date().toISOString().split("T")[0];
const validateBooking = [
    check("startDate")
    .isAfter(currDate)
    .withMessage("startDate cannot be in the past"),
    check("endDate")
    .custom(async (endDate, {req})=> {
        if(endDate <= req.bodt.startDate){
            throw new Error();
        }
    })
    .withMessage("endDate cannot be on or before startDate"),
    handleValidationErrors
];
const validateReview = [
    check("review")
    .exists({checkFalsy:true})
    .notEmpty()
    .withMessage("Review text is required"),
    check("stars")
    .exists({checkfalsy:true})
    .notEmpty()
    .isFloat({min:1,max:5})
    .withMessage("Stars must be an integer from 1 to 5"),
    handleValidationErrors
];


const existingSpot = async (req, res, next) => {
    const id = req.params.spotId
    const currSpot = await Spot.findByPk(id, {
        include:[{model: spotImage}]
    });
    if(!currSpot){
        const err = new Error("Spot couldn't be found");
        err.status = 404;
        return next(err)
    } else{
        req.currSpot = currSpot;
        req.spotImage = currSpot.spotImage
        return next();
    }
};

const isSpotOwner = async (req, res, next) => {
    if (req.user.id !== req.currSpot.ownerId){
        const err = new Error("Forbidden");
        err.status = 403
        return next(err);
    } else {
        return next();
    }
}
const existingReview = async (req, res,next)=>{
    const id = req.params.reviewId
    const currReview = Review.findByPk({
        reviewId,
        include: [{model: ReviewImages}]
    });
    if(!currReview){
        const err = new Error("Review couldn't be found");
        err.status = 404;
        return next(err)
    }else{
        req.currReview = currReview;
        return next();
    }
};
const isReviewOwner = async(req,res,next)=>{
    if(req.user.id !== req.currReview.userId){
        const err = new Error("Forbidden")
        err.status = 403
        return next(err)
    }else{
        return next();
    }
};
const existingBooking = async (req,res,next) => {
    const currId = req.params.bookingId
    const currBook = await Booking.findByPk({
        currId,
        include:{model: Spot}
    });
    if(!currBook){
        const err = new Error("Booking couldn't be found");
        err.status = 404;
        return next(err)
    } else{
        req.currBook = currBook;
        return next();
    }
}

const isBookingOwner = async (req,res,next) =>{
    if(req.route.methods.delete){
        if(currBook.userId !== req.user.id && currBook.Spot.ownerId !== req.user.id){
            const err = new Error("Forbidden")
            err.status = 403
            return next(err)
        } else {
            return next();
        }
    } else {
        if(req.user.id !== req.currBook.userId){
            const err = new Error("Forbidden")
            err.status(403)
            return next(err)
        } else {
            return next();
        }
    }
}

const dateCompare = (startDate, endDate, currStart, currEnd) =>{
    const errors = {};
    if(startDate >= currStart && startDate <= currEnd){
        errors.startDate = "Start date conflicts with an existing booking";
    }
    if(endDate >= currStart && endDate <= currEnd){
        errors.endDate = "End date conflicts with an existing booking";
    }
    if(startDate >= currStart && endDate <= currEnd){
        errors.startDate = "Start date conflicts with an existing booking";
        errors.endDate = "End date conflicts with an existing booking"
    }
    return errors;
}
const validateDates = async (req, res, next) =>{
    const {startDate, endDate} = req.body;
    const currBookings = await Booking.findAll();
    for(const booking of currBookings){
        const currStart = booking.dataValues.startDate.toISOString().split("T")[0];
        const currEnd = booking.dataValues.endDate.toISOString.split("T")[0];
        if(Number(req.params.bookingId) === bookingId) continue;
        const errors = dateCompare(startDate, endDate, currStart, currEnd);

        if(errors.startDate || errors.endDate){
            const err = new Error("Sorry, this spot is already booked for the specified dates")
            err.errors = errors
            err.status = 403;
            return next(err)
        }
    }
    return next();
}
module.exports = {
    handleValidationErrors,
    existingSpot,
    isSpotOwner,
    existingReview,
    isReviewOwner,
    existingBooking,
    isBookingOwner,
    validateSpot,
    validateReview,
    validateBooking,
    validateQuery,
    validateSignup,
    validateLogin,
    validateDates
};
