
const spotData = (spot) => {
    spot = spot.toJSON();
    spot.numReviews = 0;
    let sum = 0;
    for(let review of spot.Reviews){
        spot.numReviews++;
        sum += review.stars;
    }
    if (spot.numReviews > 0) {
    const avg = sum / spot.numReviews
    spot.avgRating = avg;
    }else{
        spot.avgRating = null;
    }
    delete spot.Reviews;
    return spot;
}
const spotsArray = (spots) => {
    spots = spots.map(spot => spot.toJSON());
    for(let spot of spots){
        let sum = 0
        let num = 0;
        
        spot.avgRating = null;
        spot.previewImage = null;
        if(spot.Reviews && spot.Reviews.length > 0){
        for(let review of spot.Reviews){
                sum += review.stars
                num++;
        }
            const avg = sum / num;
            spot.avgRating = avg;
        }
        if(spot.SpotImage && spot.SpotImage.length > 0){
        for(let image of spot.SpotImage){
            if(image.preview === true){
                spot.previewImage = image.url;
                break;
            }
        }
    }
    
        delete spot.Reviews
        delete spot.SpotImage
    }
    return spots;
};

module.exports = {
    spotData,
    spotsArray
};