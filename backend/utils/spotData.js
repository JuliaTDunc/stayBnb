
const spotData = (spot) => {
    spot.dataValues.num = 0;
    let sum = 0;
    for(let review of spot.dataValues.Reviews){
        const curr = review.dataValues;
        spot.dataValues.num++;
        sum += curr.stars;
        const avg = sum / spot.dataValues.num
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
        for(let review of curr.Reviews){
            let currRev = review.dataValues;
            if(curr.id === currRev.spotId){
                sum += currRev.stars
                num++;
            }
            const avg = sum / num;
            curr.avgRating = Number(avg.toFixed(1));
        }
        for(let image of curr.spotImages){
            const currImage = image.dataValues
            if(curr.id === currImage.spotId && currImage.previewImage === true){
                curr.previewImage = currImage.url
            }
        }
        delete curr.Reviews
        delete curr.spotImages
    }
    return spots;
}
module.exports = {
    spotData,
    spotsArray
};