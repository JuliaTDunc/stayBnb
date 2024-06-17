import { useEffect, useState } from "react";
import {useDispatch, useSelector} from 'react-redux';
import { useParams } from "react-router-dom";
import {FaStar} from 'react-icons/fa';
import {LuDot} from 'react-icons/lu';
import { useModal } from "../../context/Modal";
import ReviewModal from '../ReviewModal/ReviewModal';
import DeleteReview from "../DeleteReview/DeleteReview";
import {getSpotDetails,getReviews,selectReviewsArray} from '../../store/spots';
import './SpotDetails.css'

const SpotsDetails = () => {
    const {spotId} = useParams();
    const dispatch = useDispatch();
    const spot = useSelector(state => state.spots.currSpot);
    const sessionUser = useSelector(state => state.session.user);
    const reviews = useSelector(selectReviewsArray);
    const [isLoaded, setIsLoaded] = useState(false);
    const [userHasReviewed, setUserHasReviewed] = useState(false);
    const { setModalContent } = useModal();

    useEffect(() => {
        dispatch(getSpotDetails(spotId))
        .then(() => {
        dispatch(getReviews(spotId))
        .then(() => setIsLoaded(true));
        });
    },[dispatch,spotId]);
    useEffect(()=> {
        if(sessionUser && reviews){
            setUserHasReviewed(reviews.some(review => review.userId === sessionUser.id))
        }
    }, [sessionUser, reviews])

    const handleReserve = () => {
        return alert('Feature Coming Soon...')
    }
   
    const isOwner = sessionUser && spot && sessionUser.id === spot.ownerId;
    const hasReviews = reviews.length > 0;
    const sortedReviews = [...reviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
   
    const handleImageError = (e) => {
        e.target.src = '/sorry-image-not-available.jpg';
    }

    return isLoaded ? (
        <div className ='full-spot'>
            <h2>{spot.name}</h2>
            <h3>{spot.city}, {spot.state}, {spot.country}</h3>
            <div className='image-det-container'>
                <img src={spot.SpotImages[0].url} className='first-img-det' />
                <div>
                    {spot.SpotImages.slice(1).map(image => (
                        <img key={image.id} src={image.url} className='second-img-det' />
                    ))}
                </div>
            </div>
            <div className='details-container'>
                <div>
                    <h2>Hosted by {spot.Owner.firstName} {spot.Owner.lastName}</h2>
                    <p>{spot.description}</p>
                </div>
                <div className='details-price-reviews'>
                    <h2>${spot.price} /night</h2>
                    <div>
                        {spot.avgStarRating ? (
                            <p className="details-spot-rating"><FaStar /> {(spot.avgStarRating).toFixed(1)}</p>
                        ) : (<FaStar />)}
                    </div>
                    {spot.numReviews && isLoaded ? (
                        <p className="details-spot-rating"><LuDot />{spot.numReviews} {
                            spot.numReviews > 1 ? ('reviews') : ('review')
                        }</p>
                    ) : (
                        <p className="new-rating">New!</p>
                    )}
                    <button onClick={handleReserve}>Reserve</button>
                </div>
            </div>
            <div>
                <div className='reviews-comments-container'>
                    <div className='reviews-stars-comments'>
                        {spot.avgStarRating ? (
                            <p className="details-spot-rating"><FaStar /> {(spot.avgStarRating).toFixed(1)}</p>
                        ) : (<FaStar />)}
                        {spot.numReviews ? (
                            <p className="details-spot-rating"><LuDot />{spot.numReviews} {
                                spot.numReviews > 1 ? ('reviews') : ('review')
                            }</p>
                        ) : (
                            spot.avgStarRating === null && <p className="details-spot-rating">New!</p>
                        )}
                    </div>
                </div>
                <div>
                    {sessionUser && !isOwner && !userHasReviewed && (
                    <button className='details-review-button' onClick={() => setModalContent(<ReviewModal spotId={spotId} />)}>
                        Post Your Review
                    </button>
                )}
                    {sessionUser && !isOwner && !hasReviews ? (
                        <p>Be the first to post a review!</p>
                    ) : (
                        <div>
                            {reviews.map(review => {
                                const reviewDate = new Date(review.createdAt);
                                const options = { year: 'numeric', month: 'long' };
                                const formattedDate = reviewDate.toLocaleDateString(undefined, options);
                                return (
                                    <div key={review.id}>
                                        <div>
                                            <p>{review.User ? review.User.firstName : (sessionUser && sessionUser.firstName)}</p>
                                            <p>{formattedDate}</p>
                                            <p>{review.review}</p>
                                            {sessionUser && review.userId === sessionUser.id && (
                                               <button className='details-review-button' onClick={() => setModalContent(<DeleteReview reviewId={review.id} />)}>
                                                 Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    ) : (
        <div>Loading...</div>
    )
    
}

export default SpotsDetails;