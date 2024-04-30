
const spotData = (spot) => {
    spot.dataValues.numReviews = 0;
    let sum = 0;
    for(let review of spot.dataValues.Reviews){
        const curr = review.dataValues;
        spot.dataValues.numReviews++;
        sum += curr.stars;
        const avg = sum / spot.dataValues.numReviews
        spot.dataValues.avgRating = Number(avg.toFixed(1))
    }
    delete spot.dataValues.Reviews;
    return spot;
}
const spotsArray = (spots) => {
    for(let spot of spots){
        let sum = 0
        let num = 0;
        let curr = spot.dataValues;
        curr.avgRating = null;
        curr.previewImage = null;
        if(curr.Reviews && curr.Reviews.length > 0){
        for(let review of curr.Reviews){
            let currRev = review.dataValues;
            if(curr.id === currRev.spotId){
                sum += currRev.stars
                num++;
            }
        }
            const avg = sum / num;
            curr.avgRating = Number(avg.toFixed(1));
        }
        if(curr.spotImage && curr.spotImage.length > 0){
        for(let image of curr.spotImage){
            const currImage = image.dataValues
            if(curr.id === currImage.spotId && currImage.preview === true){
                curr.previewImage = currImage.url;
                break;
            }
        }
    }
    
        delete curr.Reviews
        delete curr.spotImage
    }
    return spots;
};

module.exports = {
    spotData,
    spotsArray
};